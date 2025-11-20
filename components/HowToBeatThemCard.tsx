import React from "react";

interface ActionItem {
  action: string;
  theirWeakness?: string;
  whatToBuild?: string;
  impact?: string;
  effort?: "low" | "medium" | "high";
  demand?: number;
  opportunity?: string;
  whyItWorks?: string;
}

interface HowToBeatThemCardProps {
  title: string;
  icon: React.ReactNode;
  color: string; // e.g., "purple", "blue", "green", etc.
  items: ActionItem[];
  showDemand?: boolean;
}

export const HowToBeatThemCard: React.FC<HowToBeatThemCardProps> = ({
  title,
  icon,
  color,
  items,
  showDemand = false,
}) => {
  // Show card even if empty, but with a message

  const colorClasses: Record<
    string,
    { bg: string; border: string; text: string; progress: string }
  > = {
    purple: {
      bg: "bg-purple-500/10",
      border: "border-purple-500/30",
      text: "text-purple-400",
      progress: "bg-purple-500",
    },
    blue: {
      bg: "bg-blue-500/10",
      border: "border-blue-500/30",
      text: "text-blue-400",
      progress: "bg-blue-500",
    },
    green: {
      bg: "bg-green-500/10",
      border: "border-green-500/30",
      text: "text-green-400",
      progress: "bg-green-500",
    },
    orange: {
      bg: "bg-orange-500/10",
      border: "border-orange-500/30",
      text: "text-orange-400",
      progress: "bg-orange-500",
    },
    yellow: {
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/30",
      text: "text-yellow-400",
      progress: "bg-yellow-500",
    },
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <div className={`${colors.bg} border ${colors.border} rounded-xl p-4`}>
      <div className="flex items-center gap-2 mb-3">
        <div className={colors.text}>{icon}</div>
        <h3 className={`text-sm font-semibold ${colors.text} flex-1`}>
          {title}
        </h3>
      </div>
      <div className="space-y-2">
        {items.length === 0 ? (
          <div className="text-gray-500 text-[10px] text-center py-2">
            Analysis in progress...
          </div>
        ) : (
          items.slice(0, 3).map((item, idx) => (
            <div
              key={idx}
              className={`${colors.bg.replace(
                "/10",
                "/5"
              )} border ${colors.border.replace(
                "/30",
                "/20"
              )} rounded-lg p-3 text-xs`}
            >
              <div className="font-semibold text-white mb-1">{item.action}</div>
              {item.theirWeakness && (
                <div className="text-gray-400 mb-1 text-[10px]">
                  ⚠ {item.theirWeakness}
                </div>
              )}
              {item.opportunity && (
                <div className="text-gray-400 mb-1 text-[10px]">
                  💡 {item.opportunity}
                </div>
              )}
              {item.whatToBuild && (
                <div className="text-gray-300 text-[10px] leading-relaxed mb-1">
                  <span className="text-green-400">Build in YOUR app: </span>
                  {item.whatToBuild}
                </div>
              )}
              {item.whyItWorks && (
                <div className="text-gray-300 text-[10px] leading-relaxed">
                  <span className="text-orange-400">
                    Why YOUR app beats them:{" "}
                  </span>
                  {item.whyItWorks}
                </div>
              )}
              {item.impact && (
                <div className="text-gray-300 text-[10px] leading-relaxed">
                  <span className="text-green-400">Impact: </span>
                  {item.impact}
                </div>
              )}
              {showDemand && item.demand !== undefined && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 bg-gray-800 rounded-full h-1">
                    <div
                      className={`${colors.progress} h-1 rounded-full`}
                      style={{ width: `${item.demand}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] text-gray-400">
                    {Math.round(item.demand)}%
                  </span>
                </div>
              )}
              {item.effort && (
                <div className="mt-1">
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                      item.effort === "low"
                        ? "bg-green-500/20 text-green-400"
                        : item.effort === "medium"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-orange-500/20 text-orange-400"
                    }`}
                  >
                    {item.effort.toUpperCase()} EFFORT
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
