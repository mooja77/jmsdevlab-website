/**
 * GitHub sync — fetches latest commit, CI status, and open PRs for each app.
 * Runs every 30 minutes via cron trigger.
 */

import { Env } from '../types';

interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    committer: { date: string };
  };
}

interface GitHubCheckSuite {
  conclusion: string | null;
  status: string;
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

  for (const app of apps.results as any[]) {
    try {
      const repo = app.github_repo;
      if (!repo) continue;

      // Fetch latest commit
      const commitRes = await fetch(
        `https://api.github.com/repos/${repo}/commits?per_page=1`,
        { headers }
      );

      if (!commitRes.ok) {
        console.error(`GitHub: ${repo} commits failed: ${commitRes.status}`);
        continue;
      }

      const commits: GitHubCommit[] = await commitRes.json();
      if (!commits.length) continue;

      const latest = commits[0];
      const commitMsg = latest.commit.message.split('\n')[0].substring(0, 200);

      // Fetch CI status for the latest commit
      let ciStatus = 'unknown';
      try {
        const checkRes = await fetch(
          `https://api.github.com/repos/${repo}/commits/${latest.sha}/check-suites`,
          { headers: { ...headers, Accept: 'application/vnd.github.v3+json' } }
        );
        if (checkRes.ok) {
          const checkData: { check_suites: GitHubCheckSuite[] } = await checkRes.json();
          if (checkData.check_suites.length > 0) {
            const suite = checkData.check_suites[0];
            ciStatus = suite.conclusion || suite.status || 'unknown';
          }
        }
      } catch {
        // CI status is optional — don't fail the whole sync
      }

      // Fetch open PR count
      let openPRs = 0;
      try {
        const prRes = await fetch(
          `https://api.github.com/repos/${repo}/pulls?state=open&per_page=1`,
          { headers }
        );
        if (prRes.ok) {
          // GitHub returns Link header with total count info, but simplest to just count
          const prs = await prRes.json();
          openPRs = Array.isArray(prs) ? prs.length : 0;
        }
      } catch {
        // PR count is optional
      }

      // Upsert into github_cache
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
  }

  console.log(`GitHub sync complete: ${apps.results.length} repos checked`);
}
