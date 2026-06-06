import React from "react";

export interface Signal {
  type: "buying_interest" | "objection" | "confusion" | "other";
  quote: string;
  tip: string;
}

interface SignalCardProps {
  signal: Signal;
  index: number;
}

export const SignalCard: React.FC<SignalCardProps> = ({ signal, index }) => {
  const getFriendlyType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const config = {
    buying_interest: {
      borderColor: "border-emerald-100",
      accentColor: "bg-emerald-500",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: "💵",
    },
    objection: {
      borderColor: "border-rose-100",
      accentColor: "bg-rose-500",
      badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
      icon: "⛔",
    },
    confusion: {
      borderColor: "border-amber-100",
      accentColor: "bg-amber-500",
      badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
      icon: "❓",
    },
    other: {
      borderColor: "border-slate-100",
      accentColor: "bg-slate-500",
      badgeClass: "bg-slate-50 text-slate-700 border-slate-200",
      icon: "📝",
    },
  }[signal.type] || {
    borderColor: "border-slate-100",
    accentColor: "bg-slate-500",
    badgeClass: "bg-slate-50 text-slate-700 border-slate-200",
    icon: "📝",
  };

  return (
    <div
      id={`signal-card-${index}`}
      className={`relative bg-white border ${config.borderColor} rounded-xl p-5 shadow-xs transition-all hover:shadow-md flex flex-col gap-4 overflow-hidden animate-[fadeIn_0.3s_ease-out]`}
    >
      {/* Visual Accent Strip */}
      <div className={`absolute top-0 bottom-0 left-0 w-1 ${config.accentColor}`} />

      <div className="flex justify-between items-center pl-1">
        <span
          id={`card-badge-${index}`}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md border ${config.badgeClass}`}
        >
          <span>{config.icon}</span>
          <span>{getFriendlyType(signal.type)}</span>
        </span>
      </div>

      <blockquote
        id={`quote-block-${index}`}
        className="pl-3 border-l-2 border-slate-200 text-slate-700 text-sm italic leading-relaxed pl-1"
      >
        &#34;{signal.quote}&#34;
      </blockquote>

      <div
        id={`tip-block-${index}`}
        className="bg-slate-50 rounded-lg p-3.5 border border-slate-100/50 flex flex-col gap-1 pl-4"
      >
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Coaching Tip
        </span>
        <p className="text-slate-800 text-sm font-medium leading-normal">
          {signal.tip}
        </p>
      </div>
    </div>
  );
};
