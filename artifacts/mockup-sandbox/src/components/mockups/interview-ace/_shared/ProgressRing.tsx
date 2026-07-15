/**
 * Radar-style progress ring used across InterviewAce pages for streaks,
 * daily goals, and topic mastery. Import from "./_shared/ProgressRing".
 */
export function ProgressRing({
  value,
  size = 64,
  strokeWidth = 6,
  label,
  sublabel,
  color = "var(--ia-accent-2)",
}: {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--ia-surface-2)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label && (
          <span className="ia-mono font-semibold" style={{ fontSize: size * 0.22, color: "var(--ia-text)" }}>
            {label}
          </span>
        )}
        {sublabel && (
          <span style={{ fontSize: size * 0.14, color: "var(--ia-text-faint)" }}>
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}
