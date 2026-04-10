/**
 * Customer Health Score — daily calculation for all real users.
 * Scores 0-100 based on: login frequency, feature breadth, recency, volume.
 * Labels: champion (80+), healthy (60-79), at_risk (40-59), churning (<40), new (<7 days)
 */

import { Env } from '../types';
import { getAllApps, fetchUsersFromApp } from '../lib/d1';

export async function runCustomerHealthScores(env: Env): Promise<void> {
  const apps = await getAllApps(env);

  // Fetch all apps in parallel for speed (Worker CPU limit)
  const fetches = apps
    .filter(a => a.has_admin && a.api_base_url)
    .map(async app => {
      const result = await fetchUsersFromApp(env, app, 100);
      return { app, result };
    });

  const results = await Promise.allSettled(fetches);

  for (const settled of results) {
    if (settled.status !== 'fulfilled') continue;
    const { app, result } = settled.value;

    try {
      if (result.error || !result.users.length) continue;

      for (const user of result.users) {
        if (user.isTest) continue;

        const email = user.email;
        if (!email) continue;

        // Calculate score components (0-25 each)
        const now = Date.now();
        const createdAt = new Date(String(user.createdAt || user.created_at || '')).getTime();
        const lastActive = new Date(String(user.lastActive || user.lastLogin || user.lastLoginAt || '')).getTime();
        const daysSinceCreated = Math.max(0, (now - createdAt) / 86400000);
        const daysSinceActive = isNaN(lastActive) ? 999 : Math.max(0, (now - lastActive) / 86400000);
        const sessionCount = Number(user.sessionCount || 0);
        const totalActions = Number(user.totalActions || 0);
        const topFeatures = (user.topFeatures as string[] || []);
        const featureBreadth = topFeatures.length;

        // New user (< 7 days) — special label
        const isNew = daysSinceCreated < 7;

        // Login frequency score (0-25): based on sessions per week
        const weeks = Math.max(daysSinceCreated / 7, 1);
        const sessionsPerWeek = sessionCount / weeks;
        const loginScore = Math.min(25, Math.round(sessionsPerWeek * 10));

        // Feature breadth score (0-25): unique features used
        const breadthScore = Math.min(25, featureBreadth * 8);

        // Recency score (0-25): days since last active (softer thresholds for pre-revenue SaaS)
        let recencyScore = 25;
        if (daysSinceActive > 90) recencyScore = 0;
        else if (daysSinceActive > 60) recencyScore = 5;
        else if (daysSinceActive > 30) recencyScore = 10;
        else if (daysSinceActive > 14) recencyScore = 15;
        else if (daysSinceActive > 7) recencyScore = 20;

        // Volume score (0-25): total actions
        const volumeScore = Math.min(25, Math.round(Math.sqrt(totalActions) * 3));

        const totalScore = Math.max(0, Math.min(100, loginScore + breadthScore + recencyScore + volumeScore));

        // Determine label (softer thresholds for pre-revenue SaaS)
        let label = 'new';
        if (!isNew) {
          if (totalScore >= 70) label = 'champion';
          else if (totalScore >= 45) label = 'healthy';
          else if (totalScore >= 25) label = 'at_risk';
          else label = 'churning';
        }

        // Upsert into customer_health
        await env.DB.prepare(`
          INSERT OR REPLACE INTO customer_health
          (email, app_id, score, label, login_frequency, feature_breadth, days_since_active, total_actions, error_count, last_calculated)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, datetime('now'))
        `).bind(
          email, app.id, totalScore, label,
          Math.round(sessionsPerWeek * 100) / 100,
          featureBreadth,
          Math.round(daysSinceActive),
          totalActions
        ).run();
      }
    } catch (err) {
      console.error(`Health score failed for ${app.id}:`, err);
    }
  }

  console.log('Customer health scores updated');
}
