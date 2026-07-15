import { useState } from "react";
import { AppShell } from "./_shared/AppShell";
import { ProgressRing } from "./_shared/ProgressRing";
import { Play, ChevronDown, ChevronUp, Lock, Brain, ArrowRight } from "lucide-react";
import "./_shared/tokens.css";

const PATTERNS = [
  { id: 1, name: "Arrays & Hashing", mastery: 92 },
  { id: 2, name: "Two Pointers", mastery: 85 },
  { id: 3, name: "Sliding Window", mastery: 42, expanded: true },
  { id: 4, name: "Stack", mastery: 30 },
  { id: 5, name: "Binary Search", mastery: 60 },
  { id: 6, name: "Linked List", mastery: 55 },
  { id: 7, name: "Trees", mastery: 45 },
  { id: 8, name: "Trie", mastery: 0 },
  { id: 9, name: "Heap / Priority Queue", mastery: 20 },
  { id: 10, name: "Backtracking", mastery: 5 },
  { id: 11, name: "Graphs", mastery: 15 },
  { id: 12, name: "1D Dynamic Programming", mastery: 0 },
  { id: 13, name: "2D Dynamic Programming", mastery: 0 },
  { id: 14, name: "Bit Manipulation", mastery: 0 },
  { id: 15, name: "Math & Geometry", mastery: 0 },
];

export function Practice() {
  const [expandedId, setExpandedId] = useState<number>(3);

  const getMasteryColor = (val: number) => {
    if (val === 0) return "var(--ia-border)";
    if (val >= 80) return "var(--ia-good)";
    if (val >= 40) return "var(--ia-warn)";
    return "var(--ia-danger)";
  };

  return (
    <AppShell activeTab="practice">
      {/* Header */}
      <div className="px-6 pt-10 pb-6 relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--ia-accent)] opacity-[0.05] blur-3xl rounded-full"></div>
        <h1 className="text-3xl font-bold mb-2 tracking-tight text-[var(--ia-text)]">
          Core Patterns
        </h1>
        <p className="text-sm text-[var(--ia-text-dim)] max-w-[240px] leading-relaxed">
          Master the structure. Destroy the problem. No more memorizing solutions.
        </p>
      </div>

      {/* Progress Overview */}
      <div className="px-6 mb-8">
        <div className="bg-[var(--ia-bg-elevated)] border border-[var(--ia-border-soft)] rounded-2xl p-5 flex items-center justify-between relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
            <Brain size={120} />
          </div>
          <div className="relative z-10">
            <div className="text-[10px] text-[var(--ia-text-dim)] uppercase tracking-wider mb-2 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--ia-accent-2)] animate-pulse"></span>
              Combat Readiness
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold ia-mono text-[var(--ia-text)]">38</span>
              <span className="text-sm text-[var(--ia-text-dim)] ia-mono">%</span>
            </div>
          </div>
          <div className="relative z-10 drop-shadow-[0_0_15px_rgba(79,216,232,0.2)]">
            <ProgressRing value={38} size={64} strokeWidth={5} color="var(--ia-accent-2)" />
          </div>
        </div>
      </div>

      {/* Pattern List */}
      <div className="px-6 pb-12 space-y-3">
        {PATTERNS.map((p, i) => {
          const isExpanded = expandedId === p.id;
          const color = getMasteryColor(p.mastery);
          const isLocked = p.mastery === 0 && p.id > 11; // just mock some locked state

          return (
            <div
              key={p.id}
              onClick={() => !isLocked && setExpandedId(isExpanded ? 0 : p.id)}
              className={`
                border rounded-2xl transition-all duration-300 relative overflow-hidden
                ${isLocked ? 'opacity-50 grayscale' : 'cursor-pointer'}
                ${isExpanded 
                  ? 'bg-[var(--ia-surface-2)] border-[var(--ia-accent)] shadow-[0_0_20px_var(--ia-accent-soft)]' 
                  : 'bg-[var(--ia-surface)] border-[var(--ia-border-soft)] hover:border-[var(--ia-border)]'}
              `}
            >
              {/* Highlight strip for expanded */}
              {isExpanded && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[var(--ia-accent)] to-[var(--ia-accent-2)]"></div>
              )}

              <div className="p-4 flex items-center gap-4">
                <div 
                  className={`
                    ia-mono text-[10px] w-8 h-8 flex items-center justify-center rounded-full shrink-0 border
                    ${isExpanded 
                      ? 'bg-[var(--ia-accent-soft)] text-[var(--ia-accent-2)] border-[var(--ia-accent)]' 
                      : 'bg-[var(--ia-bg)] text-[var(--ia-text-faint)] border-[var(--ia-border-soft)]'}
                  `}
                >
                  {i.toString().padStart(2, "0")}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[15px] text-[var(--ia-text)] truncate">
                    {p.name}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {isLocked ? (
                    <Lock size={16} className="text-[var(--ia-text-faint)]" />
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="ia-mono text-[11px] font-medium" style={{ color }}>
                          {p.mastery}%
                        </span>
                        <ProgressRing value={p.mastery} size={22} strokeWidth={3} color={color} />
                      </div>
                      <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180 text-[var(--ia-accent-2)]' : 'text-[var(--ia-text-dim)]'}`}>
                        <ChevronDown size={18} />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Expanded Content Area */}
              <div 
                className={`
                  overflow-hidden transition-all duration-300 ease-in-out
                  ${isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}
                `}
              >
                <div className="p-5 pt-1 border-t border-[var(--ia-border-soft)] flex flex-col gap-6">
                  
                  {/* Clues */}
                  <div>
                    <h4 className="text-[10px] uppercase tracking-widest text-[var(--ia-text-dim)] font-semibold mb-3">Recognition Signature</h4>
                    <ul className="text-[13px] text-[var(--ia-text)] space-y-2.5">
                      <li className="flex gap-3 items-start">
                        <span className="text-[var(--ia-accent)] ia-mono text-[10px] mt-0.5">01</span>
                        <span className="leading-snug">Input is a sequential data structure (Array or String)</span>
                      </li>
                      <li className="flex gap-3 items-start">
                        <span className="text-[var(--ia-accent)] ia-mono text-[10px] mt-0.5">02</span>
                        <span className="leading-snug">Asked to find the "longest", "shortest", or "optimal" continuous segment</span>
                      </li>
                      <li className="flex gap-3 items-start">
                        <span className="text-[var(--ia-accent)] ia-mono text-[10px] mt-0.5">03</span>
                        <span className="leading-snug">Requires calculating a running value over a contiguous subarray</span>
                      </li>
                    </ul>
                  </div>

                  {/* Complexity */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[var(--ia-bg)] rounded-xl p-3 border border-[var(--ia-border-soft)] flex items-center justify-between">
                      <span className="text-[11px] text-[var(--ia-text-dim)] font-medium">Time</span>
                      <span className="ia-mono text-[13px] text-[var(--ia-good)] font-bold">O(N)</span>
                    </div>
                    <div className="bg-[var(--ia-bg)] rounded-xl p-3 border border-[var(--ia-border-soft)] flex items-center justify-between">
                      <span className="text-[11px] text-[var(--ia-text-dim)] font-medium">Space</span>
                      <span className="ia-mono text-[13px] text-[var(--ia-accent-2)] font-bold">O(1)</span>
                    </div>
                  </div>

                  {/* Engagements */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-[10px] uppercase tracking-widest text-[var(--ia-text-dim)] font-semibold">Live Targets</h4>
                      <span className="text-[10px] text-[var(--ia-accent-2)] cursor-pointer hover:underline">View All</span>
                    </div>
                    
                    <div className="space-y-2.5">
                      {/* Q1 */}
                      <div className="bg-[var(--ia-bg)] rounded-xl p-3.5 border border-[var(--ia-border-soft)] group hover:border-[var(--ia-accent)] transition-colors cursor-pointer">
                        <div className="flex justify-between items-start mb-2.5">
                          <h5 className="text-[13px] font-medium leading-snug w-[75%] text-[var(--ia-text)]">
                            Longest Substring Without Repeating Characters
                          </h5>
                          <button className="text-[var(--ia-bg)] bg-[var(--ia-accent-2)] w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(79,216,232,0.3)]">
                            <Play size={12} fill="currentColor" className="ml-0.5" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] uppercase font-bold text-[var(--ia-warn)] bg-[#ff9f5a15] px-1.5 py-0.5 rounded border border-[#ff9f5a30]">
                            Med
                          </span>
                          <span className="text-[9px] ia-mono text-[var(--ia-text-dim)] bg-[var(--ia-surface)] px-1.5 py-0.5 rounded border border-[var(--ia-border-soft)]">
                            AMAZON
                          </span>
                        </div>
                      </div>

                      {/* Q2 */}
                      <div className="bg-[var(--ia-bg)] rounded-xl p-3.5 border border-[var(--ia-border-soft)] group hover:border-[var(--ia-accent)] transition-colors cursor-pointer">
                        <div className="flex justify-between items-start mb-2.5">
                          <h5 className="text-[13px] font-medium leading-snug w-[75%] text-[var(--ia-text)]">
                            Minimum Window Substring
                          </h5>
                          <button className="text-[var(--ia-bg)] bg-[var(--ia-accent-2)] w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(79,216,232,0.3)]">
                            <Play size={12} fill="currentColor" className="ml-0.5" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] uppercase font-bold text-[var(--ia-danger)] bg-[#ff6b8115] px-1.5 py-0.5 rounded border border-[#ff6b8130]">
                            Hard
                          </span>
                          <span className="text-[9px] ia-mono text-[var(--ia-text-dim)] bg-[var(--ia-surface)] px-1.5 py-0.5 rounded border border-[var(--ia-border-soft)]">
                            GOOGLE
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Learn mode link */}
                  <button className="w-full mt-2 py-3 bg-[var(--ia-surface)] hover:bg-[var(--ia-surface-2)] border border-[var(--ia-border-soft)] rounded-xl text-[12px] font-semibold text-[var(--ia-text)] flex items-center justify-center gap-2 transition-colors">
                    Review Pattern Theory
                    <ArrowRight size={14} className="text-[var(--ia-text-dim)]" />
                  </button>

                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
