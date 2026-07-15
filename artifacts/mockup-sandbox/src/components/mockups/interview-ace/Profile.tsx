import { AppShell } from "./_shared/AppShell";
import { ProgressRing } from "./_shared/ProgressRing";
import { Settings, Flame, Trophy, Star, Brain, Code2, ChevronRight, Target } from "lucide-react";

export function Profile() {
  return (
    <AppShell activeTab="profile">
      <div className="flex flex-col min-h-full pb-8">
        
        {/* Header / Identity */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full border border-[var(--ia-border)] bg-[var(--ia-surface-2)] flex items-center justify-center relative overflow-hidden shadow-[0_0_15px_rgba(124,108,255,0.15)]">
                <span className="text-xl font-bold ia-mono text-[var(--ia-accent)]">AC</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--ia-text)] mb-1">Alex Chen</h1>
                <div className="text-xs text-[var(--ia-text-dim)] flex items-center gap-1.5 font-medium">
                  <Code2 className="w-3.5 h-3.5 text-[var(--ia-accent-2)]" />
                  Backend Engineer
                </div>
              </div>
            </div>
            <button className="w-10 h-10 rounded-full bg-[var(--ia-surface)] border border-[var(--ia-border-soft)] flex items-center justify-center text-[var(--ia-text-dim)] hover:text-[var(--ia-text)] hover:bg-[var(--ia-surface-2)] transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="text-[11px] uppercase tracking-widest text-[var(--ia-text-faint)] font-bold ia-mono">Target Companies</div>
            <div className="flex flex-wrap gap-2">
              <div className="px-3 py-1.5 rounded-md text-xs font-medium border border-[var(--ia-border)] bg-[var(--ia-surface)] text-[var(--ia-text)] flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-[var(--ia-accent-2)]" />
                Amazon
              </div>
              <div className="px-3 py-1.5 rounded-md text-xs font-medium border border-[var(--ia-border)] bg-[var(--ia-surface)] text-[var(--ia-text)] flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-[var(--ia-accent-2)]" />
                Flipkart
              </div>
              <div className="px-3 py-1.5 rounded-md text-xs font-medium border border-[var(--ia-border)] bg-[var(--ia-surface)] text-[var(--ia-text)] flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-[var(--ia-accent-2)]" />
                Razorpay
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="px-6 py-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[var(--ia-surface)] border border-[var(--ia-border-soft)] rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--ia-accent)] opacity-5 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <div className="flex items-center gap-2 mb-4 relative">
                <Star className="w-4 h-4 text-[var(--ia-accent)]" />
                <span className="text-xs text-[var(--ia-text-dim)] font-semibold uppercase tracking-wide">Total XP</span>
              </div>
              <div className="text-2xl font-bold ia-mono text-[var(--ia-text)] relative">14,250</div>
            </div>

            <div className="bg-[var(--ia-surface)] border border-[var(--ia-border-soft)] rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--ia-warn)] opacity-5 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <div className="flex items-center gap-2 mb-4 relative">
                <Flame className="w-4 h-4 text-[var(--ia-warn)]" />
                <span className="text-xs text-[var(--ia-text-dim)] font-semibold uppercase tracking-wide">Streak</span>
              </div>
              <div className="text-2xl font-bold ia-mono text-[var(--ia-text)] relative">
                18 <span className="text-[10px] uppercase text-[var(--ia-text-faint)] tracking-wider">days</span>
              </div>
            </div>

            <div className="bg-[var(--ia-surface)] border border-[var(--ia-border-soft)] rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--ia-accent-2)] opacity-5 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <div className="flex items-center gap-2 mb-4 relative">
                <Brain className="w-4 h-4 text-[var(--ia-accent-2)]" />
                <span className="text-xs text-[var(--ia-text-dim)] font-semibold uppercase tracking-wide">Topics</span>
              </div>
              <div className="text-2xl font-bold ia-mono text-[var(--ia-text)] relative">
                12<span className="text-[13px] text-[var(--ia-text-faint)]">/25</span>
              </div>
            </div>

            <div className="bg-[var(--ia-surface)] border border-[var(--ia-border-soft)] rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--ia-good)] opacity-5 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <div className="flex items-center gap-2 mb-4 relative">
                <Code2 className="w-4 h-4 text-[var(--ia-good)]" />
                <span className="text-xs text-[var(--ia-text-dim)] font-semibold uppercase tracking-wide">Practiced</span>
              </div>
              <div className="text-2xl font-bold ia-mono text-[var(--ia-text)] relative">214</div>
            </div>
          </div>
        </div>

        {/* Consistency Heatmap */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-[var(--ia-text)]">Consistency</h2>
            <span className="text-[10px] uppercase tracking-widest text-[var(--ia-text-dim)] font-bold ia-mono flex items-center gap-1 cursor-pointer hover:text-[var(--ia-text)] transition-colors">
              This Week <ChevronRight className="w-3 h-3" />
            </span>
          </div>
          <div className="bg-[var(--ia-surface)] border border-[var(--ia-border-soft)] rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-end h-[100px] mb-3">
              {[
                { day: 'M', value: 45, current: false },
                { day: 'T', value: 80, current: false },
                { day: 'W', value: 0, current: false },
                { day: 'T', value: 100, current: false },
                { day: 'F', value: 60, current: false },
                { day: 'S', value: 90, current: false },
                { day: 'S', value: 30, current: true }
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-3 w-8">
                  <div className="w-full bg-[var(--ia-surface-2)] rounded-md h-[70px] relative overflow-hidden flex items-end">
                    {item.value > 0 ? (
                      <div 
                        className="w-full rounded-md transition-all duration-500 ease-out"
                        style={{ 
                          height: `${item.value}%`,
                          background: item.value === 100 ? 'var(--ia-good)' : 'var(--ia-accent)',
                          opacity: item.current ? 1 : 0.7,
                          boxShadow: item.value === 100 ? '0 0 10px rgba(61,220,151,0.5)' : 'none'
                        }}
                      />
                    ) : (
                      <div className="w-full h-1 bg-[var(--ia-border-soft)] rounded-md" />
                    )}
                  </div>
                  <span className={`text-[10px] font-medium ia-mono ${item.current ? 'text-[var(--ia-accent-2)]' : 'text-[var(--ia-text-dim)]'}`}>
                    {item.day}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="px-6 py-4 flex-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-[var(--ia-text)]">Achievements</h2>
            <span className="text-[10px] uppercase tracking-widest text-[var(--ia-accent-2)] font-bold ia-mono cursor-pointer">
              View All
            </span>
          </div>
          
          <div className="flex flex-col gap-3">
            {/* Achieved */}
            <div className="flex items-center gap-4 bg-[var(--ia-surface)] border border-[var(--ia-border-soft)] rounded-2xl p-4 shadow-sm relative overflow-hidden group hover:border-[var(--ia-warn)] transition-colors">
              <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 border border-[var(--ia-border-soft)] z-10" style={{ background: "rgba(255, 159, 90, 0.1)" }}>
                <Flame className="w-6 h-6 text-[var(--ia-warn)]" />
              </div>
              <div className="flex-1 z-10">
                <h3 className="text-sm font-bold text-[var(--ia-text)] mb-1">7-Day Streak</h3>
                <p className="text-xs text-[var(--ia-text-dim)] leading-snug">Practice consistently for a full week.</p>
              </div>
              <div className="text-[10px] text-[var(--ia-text-faint)] ia-mono font-bold z-10 tracking-wide">EARNED</div>
              <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[var(--ia-warn)] to-transparent opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity"></div>
            </div>

            {/* Achieved */}
            <div className="flex items-center gap-4 bg-[var(--ia-surface)] border border-[var(--ia-border-soft)] rounded-2xl p-4 shadow-sm relative overflow-hidden group hover:border-[var(--ia-good)] transition-colors">
              <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 border border-[var(--ia-border-soft)] z-10" style={{ background: "rgba(61, 220, 151, 0.1)" }}>
                <Trophy className="w-6 h-6 text-[var(--ia-good)]" />
              </div>
              <div className="flex-1 z-10">
                <h3 className="text-sm font-bold text-[var(--ia-text)] mb-1">Java Master</h3>
                <p className="text-xs text-[var(--ia-text-dim)] leading-snug">Solve 50 hard problems in Java.</p>
              </div>
              <div className="text-[10px] text-[var(--ia-text-faint)] ia-mono font-bold z-10 tracking-wide">EARNED</div>
              <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[var(--ia-good)] to-transparent opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity"></div>
            </div>

            {/* In Progress */}
            <div className="flex items-center gap-4 bg-[var(--ia-surface)] border border-[var(--ia-border-soft)] rounded-2xl p-4 shadow-sm opacity-80 hover:opacity-100 transition-opacity">
              <div className="w-14 h-14 shrink-0 z-10">
                <ProgressRing value={40} size={56} strokeWidth={4} label="10" color="var(--ia-text-dim)" />
              </div>
              <div className="flex-1 z-10">
                <h3 className="text-sm font-bold text-[var(--ia-text)] mb-1">DSA Patterns</h3>
                <p className="text-xs text-[var(--ia-text-dim)] leading-snug">Master all 25 essential patterns.</p>
              </div>
              <div className="text-[10px] text-[var(--ia-text-faint)] ia-mono font-bold z-10 tracking-wide">10/25</div>
            </div>
            
            {/* Locked */}
            <div className="flex items-center gap-4 bg-[var(--ia-surface)] border border-[var(--ia-border-soft)] rounded-2xl p-4 shadow-sm opacity-40">
              <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 border border-[var(--ia-border-soft)] z-10 bg-[var(--ia-surface-2)]">
                <Brain className="w-6 h-6 text-[var(--ia-text-faint)]" />
              </div>
              <div className="flex-1 z-10">
                <h3 className="text-sm font-bold text-[var(--ia-text)] mb-1">System Design Pro</h3>
                <p className="text-xs text-[var(--ia-text-dim)] leading-snug">Complete the scalable systems track.</p>
              </div>
              <div className="text-[10px] text-[var(--ia-text-faint)] ia-mono font-bold z-10 tracking-wide">LOCKED</div>
            </div>
          </div>
        </div>

      </div>
    </AppShell>
  );
}
