import { AppShell } from "./_shared/AppShell";
import { ProgressRing } from "./_shared/ProgressRing";
import { Search, Flame, Target, Play, Lock, CheckCircle2, ChevronRight, Map, GitMerge, Server, Coffee } from "lucide-react";

const MODULES = [
  {
    id: "m1",
    title: "DSA Patterns",
    icon: GitMerge,
    progress: 78,
    color: "var(--ia-accent)",
    topics: [
      { name: "Two Pointers", state: "done" },
      { name: "Sliding Window", state: "current" },
      { name: "Dynamic Programming", state: "locked" },
    ]
  },
  {
    id: "m2",
    title: "Java Core",
    icon: Coffee,
    progress: 45,
    color: "var(--ia-warn)",
    topics: [
      { name: "OOP Principles", state: "done" },
      { name: "Collections Framework", state: "done" },
      { name: "Multithreading", state: "current" },
      { name: "JVM Internals", state: "locked" },
    ]
  },
  {
    id: "m3",
    title: "System Design",
    icon: Server,
    progress: 12,
    color: "var(--ia-accent-2)",
    topics: [
      { name: "Scalability 101", state: "done" },
      { name: "Load Balancing", state: "current" },
      { name: "Data Partitioning", state: "locked" },
    ]
  }
];

export function Home() {
  return (
    <AppShell activeTab="home">
      <div className="p-5 pb-10 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[var(--ia-text-dim)] text-xs ia-mono mb-1 uppercase tracking-widest font-semibold">Operator Status</div>
            <div className="text-2xl font-bold tracking-tight">Ready, Engineer.</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-[var(--ia-surface-2)] flex items-center justify-center border border-[var(--ia-border)] ia-mono font-semibold text-sm text-[var(--ia-accent-2)] shadow-[0_0_15px_var(--ia-accent-soft)]">
            AL
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-[var(--ia-text-faint)]" />
          </div>
          <input
            type="text"
            placeholder="Search patterns or topics..."
            className="block w-full bg-[var(--ia-surface)] border border-[var(--ia-border)] rounded-2xl py-3.5 pl-11 pr-4 text-sm text-[var(--ia-text)] placeholder-[var(--ia-text-faint)] focus:outline-none focus:border-[var(--ia-accent)] focus:ring-1 focus:ring-[var(--ia-accent)] transition-all"
          />
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Streak */}
          <div className="bg-[var(--ia-surface)] border border-[var(--ia-border)] rounded-2xl p-4 flex flex-col gap-2 relative overflow-hidden group cursor-pointer hover:border-[var(--ia-warn)] transition-colors">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-[var(--ia-warn)] opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity" />
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-[var(--ia-warn)]" />
              <span className="text-[var(--ia-text-dim)] text-[10px] font-semibold uppercase tracking-wider ia-mono">Streak</span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-semibold ia-mono">14</span>
              <span className="text-[var(--ia-text-dim)] text-xs font-medium">days</span>
            </div>
          </div>

          {/* Daily Goal */}
          <div className="bg-[var(--ia-surface)] border border-[var(--ia-border)] rounded-2xl p-4 flex flex-col gap-2 relative overflow-hidden group cursor-pointer hover:border-[var(--ia-accent-2)] transition-colors">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-[var(--ia-accent-2)] opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity" />
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-[var(--ia-accent-2)]" />
              <span className="text-[var(--ia-text-dim)] text-[10px] font-semibold uppercase tracking-wider ia-mono">Goal</span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <ProgressRing value={75} size={42} strokeWidth={4} color="var(--ia-accent-2)" />
              <div className="flex flex-col">
                <span className="text-xl font-semibold ia-mono leading-none">150</span>
                <span className="text-[var(--ia-text-dim)] text-[10px] font-medium mt-1 uppercase tracking-wider">XP Earned</span>
              </div>
            </div>
          </div>
        </div>

        {/* Continue Learning */}
        <div className="relative rounded-2xl p-5 overflow-hidden group cursor-pointer bg-[var(--ia-surface)] border border-[var(--ia-border-soft)] hover:border-[var(--ia-accent)] transition-colors">
          <div className="absolute -inset-1 bg-[var(--ia-gradient)] opacity-10 blur-xl group-hover:opacity-20 transition-opacity" />
          <div className="absolute top-0 left-0 w-full h-1" style={{ background: "var(--ia-gradient)" }} />
          
          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[var(--ia-accent-2)] shadow-[0_0_8px_var(--ia-accent-2)] animate-pulse" />
                <span className="text-[10px] font-semibold text-[var(--ia-accent-2)] uppercase tracking-widest ia-mono">Current Mission</span>
              </div>
              <div className="text-[10px] font-semibold text-[var(--ia-text-dim)] uppercase tracking-wider ia-mono">
                30 mins left
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-1">Sliding Window</h3>
              <p className="text-xs font-medium text-[var(--ia-text-dim)] flex items-center gap-1.5 uppercase tracking-wide">
                DSA Patterns <ChevronRight className="w-3 h-3" /> Arrays
              </p>
            </div>
            
            <div className="mt-1 flex items-center justify-between bg-[var(--ia-bg)] rounded-xl p-3 border border-[var(--ia-border)] group-hover:border-[var(--ia-border-soft)] transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--ia-accent-soft)] flex items-center justify-center">
                  <Play className="w-4 h-4 text-[var(--ia-accent)] ml-0.5" fill="currentColor" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">Longest Substring</span>
                  <span className="text-[10px] font-medium text-[var(--ia-text-dim)] uppercase tracking-wider mt-0.5">Medium • 15 XP</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[var(--ia-text-faint)] group-hover:text-[var(--ia-accent)] transition-colors" />
            </div>
          </div>
        </div>

        {/* Roadmap */}
        <div className="mt-2">
          <div className="flex items-center gap-2 mb-6 px-1">
            <Map className="w-4 h-4 text-[var(--ia-text-dim)]" />
            <h2 className="text-sm font-semibold uppercase tracking-widest ia-mono text-[var(--ia-text-dim)]">Training Paths</h2>
          </div>

          <div className="relative">
            {/* Vertical Path Line */}
            <div className="absolute left-6 top-6 bottom-8 w-0.5 bg-[var(--ia-border-soft)]" />

            <div className="flex flex-col gap-10">
              {MODULES.map((module, i) => (
                <div key={module.id} className="relative z-10 flex flex-col gap-4">
                  {/* Module Header */}
                  <div className="flex gap-4 items-center">
                    <div 
                      className="w-12 h-12 rounded-full flex shrink-0 items-center justify-center bg-[var(--ia-bg)] border-2 z-10" 
                      style={{ 
                        borderColor: `color-mix(in srgb, ${module.color} 40%, var(--ia-surface-2))`,
                        boxShadow: `0 0 15px color-mix(in srgb, ${module.color} 15%, transparent)`
                      }}
                    >
                      <module.icon className="w-5 h-5" style={{ color: module.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="text-[10px] text-[var(--ia-text-dim)] font-semibold uppercase tracking-widest ia-mono mb-0.5">Module {i + 1}</div>
                      <div className="text-base font-bold text-[var(--ia-text)]">{module.title}</div>
                    </div>
                    <div className="bg-[var(--ia-surface)] rounded-full pr-3 pl-1 py-1 flex items-center gap-2 border border-[var(--ia-border-soft)]">
                      <ProgressRing value={module.progress} size={28} strokeWidth={3} color={module.color} />
                      <span className="text-xs font-semibold ia-mono">{module.progress}%</span>
                    </div>
                  </div>
                  
                  {/* Topics List */}
                  <div className="flex flex-col gap-3">
                    {module.topics.map((topic, j) => {
                      const isDone = topic.state === 'done';
                      const isCurrent = topic.state === 'current';
                      const isLocked = topic.state === 'locked';

                      return (
                        <div key={j} className="flex items-center gap-4 relative group cursor-pointer">
                          {/* Timeline Node */}
                          <div className="w-12 flex justify-center shrink-0 z-10">
                            <div className={`w-3.5 h-3.5 rounded-full border-[2.5px] bg-[var(--ia-bg)] transition-colors ${
                              isDone ? 'border-[var(--ia-good)] bg-[var(--ia-good)]' : 
                              isCurrent ? `border-[var(--ia-accent)] bg-[var(--ia-bg)] shadow-[0_0_10px_var(--ia-accent-soft)]` : 
                              'border-[var(--ia-surface-2)] bg-[var(--ia-surface)]'
                            }`} />
                          </div>
                          
                          {/* Topic Card */}
                          <div className={`flex-1 rounded-xl p-3.5 border flex justify-between items-center transition-all ${
                            isDone ? 'bg-[var(--ia-surface)] border-[var(--ia-border)] hover:border-[var(--ia-border-soft)]' :
                            isCurrent ? 'bg-[var(--ia-surface-2)] border-[var(--ia-accent)] shadow-[0_4px_20px_-10px_var(--ia-accent-soft)]' :
                            'bg-[var(--ia-bg-elevated)] border-[var(--ia-border-soft)] opacity-60 hover:opacity-100'
                          }`}>
                            <div className="flex flex-col">
                              <span className={`text-sm font-bold ${isLocked ? 'text-[var(--ia-text-dim)]' : 'text-[var(--ia-text)]'}`}>
                                {topic.name}
                              </span>
                              {isCurrent && (
                                <span className="text-[10px] text-[var(--ia-accent)] uppercase tracking-widest font-semibold mt-1 ia-mono">Next up</span>
                              )}
                            </div>
                            <div>
                              {isDone && <CheckCircle2 className="w-4 h-4 text-[var(--ia-good)]" />}
                              {isCurrent && (
                                <div className="w-6 h-6 rounded-full bg-[var(--ia-accent-soft)] flex items-center justify-center">
                                  <Play className="w-3 h-3 text-[var(--ia-accent)] ml-0.5" fill="currentColor" />
                                </div>
                              )}
                              {isLocked && <Lock className="w-4 h-4 text-[var(--ia-text-faint)]" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default Home;
