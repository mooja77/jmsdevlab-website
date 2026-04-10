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

      // Fetch CI status + PRs in parallel (with individual timeouts)
      let ciStatus = 'unknown';
      let openPRs = 0;
      try {
        const [ciRes, prRes] = await Promise.allSettled([
          fetch(`https://api.github.com/repos/${repo}/actions/runs?per_page=1`, {
            headers, signal: AbortSignal.timeout(3000)
          }),
          fetch(`https://api.github.com/repos/${repo}/pulls?state=open&per_page=1`, {
            headers, signal: AbortSignal.timeout(3000)
          }),
        ]);

        if (ciRes.status === 'fulfilled' && ciRes.value.ok) {
          const runs = await ciRes.value.json() as any;
          if (runs.workflow_runs?.length) {
            const run = runs.workflow_runs[0];
            ciStatus = run.conclusion || run.status || 'unknown';
            // Store deployment record
            await env.DB.prepare(`
              INSERT OR IGNORE INTO deployments (app_id, platform, status, commit_sha, commit_message, duration_seconds, deploy_url, created_at)
              VALUES (?, 'github', ?, ?, ?, ?, ?, ?)
            `).bind(
              app.id, run.conclusion || run.status,
              run.head_sha?.substring(0, 7) || '', run.name || '',
              Math.round(((new Date(run.updated_at).getTime()) - (new Date(run.created_at).getTime())) / 1000),
              run.html_url || '', run.created_at
            ).run();
          }
        }
        if (prRes.status === 'fulfilled' && prRes.value.ok) {
          const prs = await prRes.value.json() as any[];
          openPRs = Array.isArray(prs) ? prs.length : 0;
        }
      } catch { /* CI/PR data is optional */ }

      await env.DB.prepare(`
        INSERT OR REPLACE INTO github_cache
        (repo, app_id, last_commit_sha, last_commit_msg, last_commit_date, open_prs, ci_status, raw_json, fetched_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `).bind(
        repo,
        app.id,
        latest.sha.substring(0, 7),
        commitMsg,
        latest.commit.committer.date,
        openPRs,
        ciStatus,
        JSON.stringify({ sha: latest.sha, message: commitMsg, date: latest.commit.committer.date, ci: ciStatus })
      ).run();
    } catch (err) {
      console.error(`GitHub sync failed for ${app.id}:`, err);
    }
  });

  await Promise.allSettled(fetches);
  console.log(`GitHub sync complete: ${apps.results.length} repos`);
}
