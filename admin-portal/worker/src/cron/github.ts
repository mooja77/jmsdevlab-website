/**
 * GitHub sync — fetches latest commit for each app.
 * Runs every 30 minutes via cron trigger.
 * Optimized: parallel fetches, commits only (skip CI/PRs to stay within Worker limits).
 */

import { Env } from '../types';

interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    committer: { date: string };
  };
}

export async function runGitHubSync(env: Env): Promise<void> {
  if (!env.GITHUB_TOKEN) {
    console.log('GitHub sync skipped: no GITHUB_TOKEN');
    return;
  }

  const apps = await env.DB.prepare(
    'SELECT id, github_repo FROM apps WHERE github_repo IS NOT NULL AND github_repo != ""'
  ).all();

  const headers = {
    Authorization: `token ${env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'JMS-Admin-Portal',
  };

  // Fetch all repos in parallel to stay within Worker time limits
  const fetches = (apps.results as any[]).map(async (app) => {
    try {
      const repo = app.github_repo;
      if (!repo) return;

      const commitRes = await fetch(
        `https://api.github.com/repos/${repo}/commits?per_page=1`,
        { headers, signal: AbortSignal.timeout(5000) }
      );

      if (!commitRes.ok) {
        console.error(`GitHub: ${repo} failed: ${commitRes.status}`);
        return;
      }

      const commits: GitHubCommit[] = await commitRes.json();
      if (!commits.length) return;

      const latest = commits[0];
      const commitMsg = latest.commit.message.split('\n')[0].substring(0, 200);

      await env.DB.prepare(`
        INSERT OR REPLACE INTO github_cache
        (repo, app_id, last_commit_sha, last_commit_msg, last_commit_date, open_prs, ci_status, raw_json, fetched_at)
        VALUES (?, ?, ?, ?, ?, 0, 'unknown', ?, datetime('now'))
      `).bind(
        repo,
        app.id,
        latest.sha.substring(0, 7),
        commitMsg,
        latest.commit.committer.date,
        JSON.stringify({ sha: latest.sha, message: commitMsg, date: latest.commit.committer.date })
      ).run();
    } catch (err) {
      console.error(`GitHub sync failed for ${app.id}:`, err);
    }
  });

  await Promise.allSettled(fetches);
  console.log(`GitHub sync complete: ${apps.results.length} repos`);
}
