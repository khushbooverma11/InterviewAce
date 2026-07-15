import React, { useState, useRef, useEffect } from "react";
import { AppShell } from "./_shared/AppShell";
import { ProgressRing } from "./_shared/ProgressRing";
import { 
  BookOpen, Lightbulb, Layers, Building, Zap, 
  MessageSquare, AlertTriangle, Sparkles, Check, ChevronRight,
  ArrowLeft, Terminal, Database, Server, Clock, Lock
} from "lucide-react";

export default function TopicDetail() {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const handleComplete = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps((prev) => [...prev, stepId]);
    }
    if (stepId < 8) {
      setActiveStep(stepId + 1);
    } else {
      setActiveStep(0); // All done
    }
  };

  const steps = [
    { id: 1, title: "Introduction", icon: BookOpen },
    { id: 2, title: "Real-Life Example", icon: Lightbulb },
    { id: 3, title: "Core Concepts", icon: Layers },
    { id: 4, title: "Real Industry Usage", icon: Building },
    { id: 5, title: "Quick Revision Notes", icon: Zap },
    { id: 6, title: "Interview Questions", icon: MessageSquare },
    { id: 7, title: "Common Mistakes", icon: AlertTriangle },
    { id: 8, title: "1-Min Revision Card", icon: Sparkles },
  ];

  const progress = Math.round((completedSteps.length / 8) * 100);

  // Scroll to active step slightly
  const activeRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (activeRef.current) {
      // Small delay to allow expand animation
      setTimeout(() => {
        activeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 150);
    }
  }, [activeStep]);

  return (
    <AppShell activeTab="home">
      {/* Sticky Header */}
      <div 
        className="sticky top-0 z-20 flex items-center gap-4 px-5 py-3 border-b"
        style={{ 
          background: "rgba(11, 13, 20, 0.85)", 
          backdropFilter: "blur(12px)",
          borderColor: "var(--ia-border-soft)"
        }}
      >
        <button className="p-2 -ml-2 rounded-full transition-colors" style={{ color: "var(--ia-text-dim)" }}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-bold text-lg tracking-tight" style={{ color: "var(--ia-text)" }}>HashMap</h1>
          <p className="text-[10px] ia-mono tracking-widest uppercase mt-0.5" style={{ color: "var(--ia-accent-2)" }}>
            Java Collections
          </p>
        </div>
        <ProgressRing 
          value={progress} 
          size={44} 
          strokeWidth={4} 
          label={`${completedSteps.length}/8`}
          color={progress === 100 ? "var(--ia-good)" : "var(--ia-accent-2)"}
        />
      </div>

      <div className="px-5 py-6 flex flex-col gap-4 pb-32">
        {steps.map((step) => {
          const isActive = activeStep === step.id;
          const isCompleted = completedSteps.includes(step.id);
          const Icon = step.icon;

          return (
            <div 
              key={step.id} 
              ref={isActive ? activeRef : null}
              className="rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col relative"
              style={{
                background: isActive ? "var(--ia-surface-2)" : "var(--ia-surface)",
                borderColor: isActive ? "var(--ia-accent)" : isCompleted ? "var(--ia-border-soft)" : "transparent",
                boxShadow: isActive ? "0 0 20px var(--ia-accent-soft)" : "none",
                opacity: !isActive && !isCompleted && step.id > Math.max(1, ...completedSteps) + 1 ? 0.6 : 1
              }}
            >
              {/* Step Header */}
              <button 
                onClick={() => setActiveStep(isActive ? 0 : step.id)}
                className="flex items-center w-full p-4 text-left gap-4"
              >
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors"
                  style={{
                    background: isCompleted ? "rgba(61, 220, 151, 0.15)" : isActive ? "var(--ia-accent-soft)" : "var(--ia-bg-elevated)",
                    color: isCompleted ? "var(--ia-good)" : isActive ? "var(--ia-accent)" : "var(--ia-text-dim)"
                  }}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                
                <div className="flex-1 flex flex-col justify-center">
                  <span className="text-[10px] ia-mono uppercase tracking-wider mb-1" style={{ color: "var(--ia-text-faint)" }}>
                    Step 0{step.id}
                  </span>
                  <span className="font-semibold text-[15px]" style={{ color: isActive || isCompleted ? "var(--ia-text)" : "var(--ia-text-dim)" }}>
                    {step.title}
                  </span>
                </div>

                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300"
                  style={{ transform: isActive ? "rotate(90deg)" : "rotate(0deg)", color: "var(--ia-text-dim)" }}
                >
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>

              {/* Step Content */}
              <div 
                className={`transition-all duration-300 ease-in-out px-4 ${isActive ? "max-h-[1200px] pb-5 opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}
              >
                <div className="w-full h-px mb-5" style={{ background: "var(--ia-border-soft)" }} />
                
                {/* Content Injection based on Step */}
                <div className="text-[14px] leading-relaxed" style={{ color: "var(--ia-text-dim)" }}>
                  {step.id === 1 && <Step1 />}
                  {step.id === 2 && <Step2 />}
                  {step.id === 3 && <Step3 />}
                  {step.id === 4 && <Step4 />}
                  {step.id === 5 && <Step5 />}
                  {step.id === 6 && <Step6 />}
                  {step.id === 7 && <Step7 />}
                  {step.id === 8 && <Step8 />}
                </div>

                {/* Complete Button */}
                <button
                  onClick={() => handleComplete(step.id)}
                  className="w-full mt-6 py-3.5 rounded-xl font-bold tracking-wide transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  style={{
                    background: isCompleted ? "var(--ia-surface)" : "var(--ia-gradient)",
                    color: isCompleted ? "var(--ia-text)" : "#0b0d14",
                    border: isCompleted ? "1px solid var(--ia-border)" : "none"
                  }}
                >
                  {isCompleted ? (
                    <>
                      <Check className="w-4 h-4" style={{ color: "var(--ia-good)" }}/>
                      Completed
                    </>
                  ) : (
                    "Mark Complete"
                  )}
                </button>
              </div>
            </div>
          );
        })}

        {progress === 100 && (
          <div className="mt-8 p-6 rounded-2xl flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4" style={{ background: "var(--ia-surface-2)", border: "1px solid var(--ia-good)" }}>
            <div className="w-12 h-12 rounded-full mb-4 flex items-center justify-center" style={{ background: "rgba(61, 220, 151, 0.2)", color: "var(--ia-good)" }}>
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Module Mastered!</h3>
            <p className="text-[13px] text-ia-text-dim">You've unlocked the HashMap badge. Ready to tackle coding problems?</p>
            <button className="mt-5 px-6 py-3 rounded-xl font-bold" style={{ background: "var(--ia-good)", color: "#000" }}>
              Go to Practice
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
}

// --- Step Contents ---

function Step1() {
  return (
    <div className="space-y-4">
      <p>
        A <strong style={{ color: "var(--ia-text)" }}>HashMap</strong> is a data structure that maps keys to values for highly efficient lookups. It uses a <strong style={{ color: "var(--ia-text)" }}>hash function</strong> to compute an index into an array of buckets.
      </p>
      <div className="p-4 rounded-xl border border-dashed mt-4" style={{ borderColor: "var(--ia-border)", background: "var(--ia-bg)" }}>
        <h4 className="text-[11px] ia-mono uppercase tracking-widest mb-2" style={{ color: "var(--ia-accent-2)" }}>Why Interviewers Ask</h4>
        <p className="text-[13px]">
          It tests your grasp on time vs. space tradeoffs, hashing algorithms, and collision handling. It's the most common data structure used to optimize brute-force O(N²) algorithms to O(N).
        </p>
      </div>
    </div>
  );
}

function Step2() {
  return (
    <div className="space-y-5">
      <p>Think of a HashMap like a <strong style={{ color: "var(--ia-text)" }}>massive library index</strong>.</p>
      
      <div className="flex flex-col gap-2 ia-mono text-[12px]">
        <div className="p-3 rounded-lg flex items-center gap-3" style={{ background: "var(--ia-bg)" }}>
          <div className="w-6 h-6 rounded bg-ia-surface flex items-center justify-center text-ia-text font-bold">1</div>
          <div className="flex-1">Book Title <span style={{ color: "var(--ia-accent-2)" }}>(Key)</span></div>
        </div>
        <div className="px-4 py-1 text-ia-text-faint flex justify-center">
          <ChevronRight className="w-4 h-4 rotate-90" />
        </div>
        <div className="p-3 rounded-lg flex items-center gap-3 border" style={{ background: "var(--ia-surface-2)", borderColor: "var(--ia-accent-soft)" }}>
          <div className="w-6 h-6 rounded bg-ia-surface flex items-center justify-center text-ia-accent font-bold">2</div>
          <div className="flex-1">Librarian's Brain <span style={{ color: "var(--ia-accent)" }}>(Hash Function)</span></div>
        </div>
        <div className="px-4 py-1 text-ia-text-faint flex justify-center">
          <ChevronRight className="w-4 h-4 rotate-90" />
        </div>
        <div className="p-3 rounded-lg flex items-center gap-3" style={{ background: "var(--ia-bg)" }}>
          <div className="w-6 h-6 rounded bg-ia-surface flex items-center justify-center text-ia-good font-bold">3</div>
          <div className="flex-1">Shelf A4 <span style={{ color: "var(--ia-good)" }}>(Value/Bucket)</span></div>
        </div>
      </div>
      
      <p className="text-[13px]">
        Instead of checking every book one by one (O(N)), the librarian instantly knows the exact shelf (O(1)).
      </p>
    </div>
  );
}

function Step3() {
  const concepts = [
    { title: "K-V Pairs", desc: "Data is stored as a Key mapping to a Value." },
    { title: "Hash Function", desc: "Converts the key into a deterministic integer (hash code) to find the array index." },
    { title: "Collisions", desc: "When two different keys compute to the same index. Handled via chaining (LinkedLists)." },
    { title: "Load Factor", desc: "When map is 75% full (0.75), it doubles its size and rehashes everything." },
  ];

  return (
    <div className="grid grid-cols-1 gap-3">
      {concepts.map((c, i) => (
        <div key={i} className="p-3.5 rounded-xl flex gap-3 items-start" style={{ background: "var(--ia-bg)" }}>
          <div className="w-6 h-6 rounded bg-ia-surface-2 flex items-center justify-center ia-mono text-[10px] shrink-0" style={{ color: "var(--ia-accent-2)" }}>
            0{i + 1}
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-1" style={{ color: "var(--ia-text)" }}>{c.title}</h4>
            <p className="text-[13px]">{c.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function Step4() {
  return (
    <div className="space-y-4">
      <p>HashMaps are everywhere in backend systems where fast lookups are required.</p>
      <div className="space-y-3 mt-4">
        <div className="flex items-center gap-4 p-3 rounded-xl border border-ia-border-soft bg-ia-bg">
          <Database className="w-5 h-5 text-ia-warn shrink-0" />
          <div className="flex-1">
            <h4 className="font-medium text-sm text-ia-text">In-Memory Caching</h4>
            <p className="text-[12px] mt-0.5">Redis is essentially a distributed HashMap.</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-3 rounded-xl border border-ia-border-soft bg-ia-bg">
          <Server className="w-5 h-5 text-ia-accent-2 shrink-0" />
          <div className="flex-1">
            <h4 className="font-medium text-sm text-ia-text">Request Routing</h4>
            <p className="text-[12px] mt-0.5">Mapping URL paths to controller functions.</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-3 rounded-xl border border-ia-border-soft bg-ia-bg">
          <Terminal className="w-5 h-5 text-ia-good shrink-0" />
          <div className="flex-1">
            <h4 className="font-medium text-sm text-ia-text">Frequency Counters</h4>
            <p className="text-[12px] mt-0.5">Counting occurrences in data streams or logs.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step5() {
  return (
    <div className="space-y-4">
      <div className="bg-ia-bg rounded-xl border border-ia-border overflow-hidden">
        <div className="grid grid-cols-3 border-b border-ia-border-soft text-[11px] ia-mono uppercase text-ia-text-faint p-2 px-4">
          <div>Operation</div>
          <div>Average</div>
          <div>Worst</div>
        </div>
        <div className="grid grid-cols-3 text-sm p-2 px-4 border-b border-ia-border-soft last:border-0">
          <div className="font-medium text-ia-text">Insert</div>
          <div className="ia-mono text-ia-good">O(1)</div>
          <div className="ia-mono text-ia-danger">O(N)</div>
        </div>
        <div className="grid grid-cols-3 text-sm p-2 px-4 border-b border-ia-border-soft last:border-0 bg-ia-surface">
          <div className="font-medium text-ia-text">Lookup</div>
          <div className="ia-mono text-ia-good">O(1)</div>
          <div className="ia-mono text-ia-danger">O(N)</div>
        </div>
        <div className="grid grid-cols-3 text-sm p-2 px-4 border-b border-ia-border-soft last:border-0">
          <div className="font-medium text-ia-text">Delete</div>
          <div className="ia-mono text-ia-good">O(1)</div>
          <div className="ia-mono text-ia-danger">O(N)</div>
        </div>
      </div>

      <ul className="list-disc pl-5 space-y-2 text-[13px] mt-4 marker:text-ia-accent-2">
        <li>Allows <strong className="text-ia-text">1 null key</strong> and multiple null values (Java).</li>
        <li><strong className="text-ia-danger">Not thread-safe!</strong> Use ConcurrentHashMap for multi-threading.</li>
        <li>Backed by an Array. Collisions handled by LinkedLists.</li>
      </ul>
    </div>
  );
}

function Step6() {
  const qas = [
    { level: "Beginner", q: "How does HashMap handle collisions?", a: "Using Separate Chaining. It stores a LinkedList at the bucket index. In Java 8+, it upgrades to a Red-Black tree if the list exceeds 8 elements.", color: "var(--ia-good)" },
    { level: "Intermediate", q: "Why is the default load factor 0.75?", a: "It's the optimal tradeoff. Higher reduces space overhead but increases collisions (slower lookups). Lower speeds up lookups but wastes memory.", color: "var(--ia-warn)" },
    { level: "Advanced", q: "Why must we override both equals() and hashCode()?", a: "If two objects are equals(), they MUST have the same hashCode(). If you don't override hashCode, they'll land in different buckets and you'll lose the data.", color: "var(--ia-danger)" }
  ];

  return (
    <div className="space-y-4">
      {qas.map((qa, i) => (
        <div key={i} className="rounded-xl border border-ia-border-soft bg-ia-bg overflow-hidden group">
          <div className="p-3 flex items-center justify-between border-b border-ia-border-soft" style={{ background: "rgba(255,255,255,0.02)" }}>
            <span className="text-[10px] ia-mono uppercase tracking-widest px-2 py-0.5 rounded" style={{ background: "var(--ia-surface-2)", color: qa.color }}>
              {qa.level}
            </span>
          </div>
          <div className="p-4 space-y-3">
            <p className="font-medium text-[14px] text-ia-text leading-snug">Q: {qa.q}</p>
            <div className="p-3 rounded-lg text-[13px] leading-relaxed" style={{ background: "var(--ia-surface-2)", borderLeft: `2px solid ${qa.color}` }}>
              A: {qa.a}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Step7() {
  return (
    <div className="space-y-3">
      <div className="p-4 rounded-xl border border-ia-danger/30 bg-ia-danger/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-ia-danger" />
        <h4 className="font-semibold text-ia-danger flex items-center gap-2 mb-2 text-sm">
          <AlertTriangle className="w-4 h-4" /> Custom Keys Object Trap
        </h4>
        <p className="text-[13px]">
          Using a custom object as a key but forgetting to override <code className="ia-mono text-ia-text bg-ia-surface px-1 py-0.5 rounded">equals()</code> and <code className="ia-mono text-ia-text bg-ia-surface px-1 py-0.5 rounded">hashCode()</code>. Lookups will always fail because default implementation uses memory addresses.
        </p>
      </div>

      <div className="p-4 rounded-xl border border-ia-warn/30 bg-ia-warn/5 relative overflow-hidden mt-3">
        <div className="absolute top-0 left-0 w-1 h-full bg-ia-warn" />
        <h4 className="font-semibold text-ia-warn flex items-center gap-2 mb-2 text-sm">
          <Clock className="w-4 h-4" /> Worst-Case Ignorance
        </h4>
        <p className="text-[13px]">
          Telling the interviewer lookup is <em>always</em> O(1). You must mention worst-case is O(N) if many keys hash to the same bucket (though Java 8 optimizes this to O(log N) with trees).
        </p>
      </div>
      
      <div className="p-4 rounded-xl border border-ia-border-soft bg-ia-surface-2 relative overflow-hidden mt-3">
        <div className="absolute top-0 left-0 w-1 h-full bg-ia-accent" />
        <h4 className="font-semibold text-ia-accent flex items-center gap-2 mb-2 text-sm">
          <Lock className="w-4 h-4" /> Threading Disasters
        </h4>
        <p className="text-[13px]">
          Using standard HashMap in multi-threaded environments. This can cause infinite loops during rehashing (pre-Java 8) or data loss. Use <code className="ia-mono text-ia-text">ConcurrentHashMap</code>.
        </p>
      </div>
    </div>
  );
}

function Step8() {
  return (
    <div className="relative p-6 rounded-2xl overflow-hidden mt-2 border border-ia-border" style={{ background: "linear-gradient(180deg, #1e2233 0%, #12141f 100%)" }}>
      {/* Decorative background glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-20" style={{ background: "var(--ia-accent)" }} />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full blur-3xl opacity-20" style={{ background: "var(--ia-accent-2)" }} />
      
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center shadow-lg" style={{ background: "var(--ia-surface)", border: "1px solid var(--ia-border-soft)" }}>
          <Sparkles className="w-6 h-6" style={{ color: "var(--ia-accent-2)" }} />
        </div>
        <h3 className="text-xl font-bold text-ia-text mb-1">HashMap</h3>
        <p className="text-[11px] ia-mono uppercase tracking-widest text-ia-text-dim mb-6">1-Minute Revision</p>
        
        <div className="w-full space-y-2 text-left text-[13px] ia-mono bg-ia-bg/50 p-4 rounded-xl border border-ia-border-soft">
          <div className="flex justify-between items-center">
            <span className="text-ia-text-dim">Time (Avg):</span>
            <span className="text-ia-good font-bold">O(1)</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-ia-text-dim">Time (Worst):</span>
            <span className="text-ia-danger font-bold">O(N)</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-ia-text-dim">Collisions:</span>
            <span className="text-ia-text">Chaining (List/Tree)</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-ia-text-dim">Thread-safe:</span>
            <span className="text-ia-danger">No</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-ia-text-dim">Null Keys:</span>
            <span className="text-ia-text">1 allowed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
