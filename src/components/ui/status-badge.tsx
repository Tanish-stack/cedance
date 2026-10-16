import React from "react";
import { STATUS_CONFIG, AT_RISK_CONFIG, type TaskStatus } from "@/lib/design-tokens";

interface StatusBadgeProps {
  status: TaskStatus;
  atRisk?: boolean;
  className?: string;
}

export function StatusBadge({ status, atRisk, className = "" }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.Assigned;

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${config.badgeBg} ${config.badgeText} ${config.badgeBorder}`}
      >
        <span
          className="w-1.5 h-1.5 rounded-full mr-1.5"
          style={{ backgroundColor: config.color }}
        />
        {config.label}
      </span>

      {atRisk && (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${AT_RISK_CONFIG.badgeBg} ${AT_RISK_CONFIG.badgeText} ${AT_RISK_CONFIG.badgeBorder}`}
        >
          <span
            className="w-1.5 h-1.5 rounded-full mr-1.5"
            style={{ backgroundColor: AT_RISK_CONFIG.color }}
          />
          {AT_RISK_CONFIG.label}
        </span>
      )}
    </div>
  );
}
