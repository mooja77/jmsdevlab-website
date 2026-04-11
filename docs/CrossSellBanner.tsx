/**
 * JMS Dev Lab — Cross-Sell Banner Component (React/TSX)
 *
 * Drop-in component for any JMS Dev Lab app.
 * Shows 2-3 related apps from the same cluster with UTM tracking.
 *
 * Usage:
 *   <CrossSellBanner cluster="protection" source="spamshield" />
 *   <CrossSellBanner cluster="jewelry" source="jewelvalue" />
 *   <CrossSellBanner cluster="operations" source="smartcash" />
 */

import React from "react";

type Cluster = "protection" | "jewelry" | "operations";

interface AppInfo {
  name: string;
  url: string;
  description: string;
}

const APPS: Record<string, AppInfo> = {
  spamshield: {
    name: "SpamShield",
    url: "https://spamshield.app",
    description:
      "AI-powered spam filtering for contact forms. Blocks human-written spam, not just bots.",
  },
  themesweep: {
    name: "ThemeSweep",
    url: "https://themesweep.com",
    description:
      "Find and remove dead code left by uninstalled apps. Speed up your store safely.",
  },
  profitshield: {
    name: "ProfitShield",
    url: "https://profitshield.app",
    description:
      "Block unprofitable orders before checkout. Real-time margin validation.",
  },
  jewelrystudiomanager: {
    name: "JewelryStudioManager",
    url: "https://jewelrystudiomanager.com",
    description:
      "CRM for jewelry studios. Track commissions, manage customers, and grow sales.",
  },
  jewelvalue: {
    name: "Jewel Value",
    url: "https://jewelvalue.app",
    description:
      "Professional jewellery and watch valuations. Insurance-ready certificates.",
  },
  repairdesk: {
    name: "RepairDesk",
    url: "https://repairdeskapp.net",
    description:
      "Repair job tracking for jewellers and watchmakers. Customer portal included.",
  },
  smartcash: {
    name: "SmartCash",
    url: "https://smartcashapp.net",
    description:
      "AI-powered cashflow management. Forecasting, expense tracking, and financial reports.",
  },
  staffhub: {
    name: "StaffHub",
    url: "https://staffhubapp.com",
    description:
      "Staff training and management. SOPs, quizzes, onboarding, and team scheduling.",
  },
  growthmap: {
    name: "GrowthMap",
    url: "https://mygrowthmap.net",
    description:
      "Guided marketing execution. Like Duolingo, but for growing your business.",
  },
};

const CLUSTERS: Record<Cluster, string[]> = {
  protection: ["spamshield", "themesweep", "profitshield"],
  jewelry: ["jewelrystudiomanager", "jewelvalue", "repairdesk"],
  operations: ["smartcash", "staffhub", "growthmap"],
};

interface CrossSellBannerProps {
  cluster: Cluster;
  /** The app embedding this banner (used for UTM tracking) */
  source: string;
}

export default function CrossSellBanner({
  cluster,
  source,
}: CrossSellBannerProps) {
  const appKeys = CLUSTERS[cluster].filter((key) => key !== source);

  return (
    <div
      style={{
        margin: "2rem 0",
        padding: "1.25rem 1.5rem",
        background: "linear-gradient(135deg, #f8fafc 0%, #dbeafe 100%)",
        border: "1px solid #bfdbfe",
        borderRadius: 12,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "0.75rem",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="6" fill="#2563eb" />
          <text
            x="16"
            y="22"
            textAnchor="middle"
            fontFamily="monospace"
            fontWeight="700"
            fontSize="14"
            fill="#fff"
          >
            {"</>"}
          </text>
        </svg>
        <span
          style={{
            fontSize: "0.8rem",
            fontWeight: 600,
            color: "#475569",
            letterSpacing: "0.05em",
            textTransform: "uppercase" as const,
          }}
        >
          More from JMS Dev Lab
        </span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "1rem" }}>
        {appKeys.map((key) => {
          const app = APPS[key];
          const href = `${app.url}/?utm_source=${source}&utm_medium=cross-sell&utm_campaign=app-banner`;
          return (
            <a
              key={key}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1,
                minWidth: 200,
                padding: "0.75rem 1rem",
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#131729",
                  marginBottom: "0.25rem",
                }}
              >
                {app.name}
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "#64748b",
                  lineHeight: 1.4,
                }}
              >
                {app.description}
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
