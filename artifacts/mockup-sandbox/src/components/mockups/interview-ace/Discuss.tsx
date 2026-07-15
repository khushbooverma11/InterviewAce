import React, { useState, useRef, useEffect } from "react";
import { AppShell } from "./_shared/AppShell";
import { 
  MessageSquare, 
  ThumbsUp, 
  Share2, 
  Plus,
  MoreHorizontal,
  TrendingUp,
  Search,
  Filter,
  Trophy,
  Users,
  ChevronDown,
  Shield,
  Mic,
  X,
  Send,
  Phone,
  AlertTriangle,
  Ban,
  Terminal
} from "lucide-react";
import "./_shared/tokens.css";

const ANONYMOUS_USERS = [
  "CuriousCoder42", "BinaryWizard", "AlgoNinja", "ByteBender",
  "RecursiveRaven", "StackSmasher", "O_of_N_Enjoyer", "HashMapper"
];

const TOPICS = ["All", "DSA", "System Design", "Behavioral", "Offers", "Mock Interview", "Frontend", "Backend"];
const MATCH_TOPICS = ["DSA", "System Design", "Frontend", "Backend", "Java", "Python", "ML", "Career"];
const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced"];
const DURATIONS = ["15 min", "30 min", "1 hr"];
const LANGUAGES = ["English", "Hindi", "Spanish", "Mandarin"];
const CHAT_TYPES = ["Text", "Voice"];

const INITIAL_POSTS = [
  {
    id: 1,
    type: "question",
    author: {
      name: "O_of_N_Enjoyer",
      role: "Lvl 43 • 150 Solved",
      avatar: "OE"
    },
    timestamp: "2h ago",
    title: "How would you explain your approach to a Sliding Window problem in an interview?",
    content: "I always struggle with explaining the 'why' behind using a sliding window rather than just diving into the implementation. What are the key signals interviewers look for when you're setting up this pattern?",
    tags: ["DSA", "Arrays"],
    upvotes: 42,
    comments: 15,
  },
  {
    id: 2,
    type: "success",
    author: {
      name: "SystemArchitect99",
      role: "Lvl 89 • Offer Secured",
      avatar: "SA"
    },
    timestamp: "5h ago",
    title: "Finally cleared the loop! Here's my breakdown.",
    content: "After 3 months of grinding, I finally made it. The biggest game-changer was the system design deep-dive. They really cared about my API design choices over just drawing boxes.",
    tags: ["Offers", "System Design"],
    upvotes: 187,
    comments: 54,
  },
  {
    id: 3,
    type: "partner",
    author: {
      name: "BehavioralBoss",
      role: "Lvl 21 • Prep Phase",
      avatar: "BB"
    },
    timestamp: "1d ago",
    title: "Looking for a mock interview partner for Leadership Principles",
    content: "Hey everyone, I have an onsite next week and want to run through some STAR method stories. Anyone available this weekend for a 45-minute swap?",
    tags: ["Behavioral", "Mock Interview"],
    upvotes: 12,
    comments: 8,
  },
  {
    id: 4,
    type: "question",
    author: {
      name: "ByteBender",
      role: "Lvl 55 • Frontend Focus",
      avatar: "BB"
    },
    timestamp: "1d ago",
    title: "Struggled with LRU Cache today — my mistake was...",
    content: "I tried to implement it using just an array and a map. Obviously timed out on large inputs. Reminder to always use a Doubly Linked List for O(1) removals. Anyone have a good mental model for wiring up the pointers without bugs?",
    tags: ["DSA", "Frontend"],
    upvotes: 89,
    comments: 31,
  },
  {
    id: 5,
    type: "discussion",
    author: {
      name: "StackSmasher",
      role: "Lvl 99 • Interviewer",
      avatar: "SS"
    },
    timestamp: "2d ago",
    title: "Unpopular opinion: Stop memorizing hard solutions",
    content: "As someone who conducts interviews, I can instantly tell when a candidate has memorized a solution versus actually understanding the underlying pattern. Focus on the core patterns.",
    tags: ["Advice", "General"],
    upvotes: 342,
    comments: 112,
  }
];

const PRE_SEEDED_MESSAGES = [
  { id: 1, sender: 'them', text: 'Hey! I saw you wanted to practice System Design. Looking at rate limiters?', type: 'text', time: '10:00 AM' },
  { id: 2, sender: 'me', text: 'Yes exactly. I get the basic token bucket concept but struggling with Redis implementation details.', type: 'text', time: '10:01 AM' },
  { id: 3, sender: 'them', text: 'Ah yeah, the tricky part is ensuring atomicity. You need a Lua script for that.', type: 'text', time: '10:02 AM' },
  { id: 4, sender: 'them', text: `local tokens_key = KEYS[1]\nlocal timestamp_key = KEYS[2]\nlocal rate = tonumber(ARGV[1])\nlocal capacity = tonumber(ARGV[2])\nlocal now = tonumber(ARGV[3])\nlocal requested = tonumber(ARGV[4])`, type: 'code', time: '10:02 AM' },
];

export default function Discuss() {
  const [activeTopic, setActiveTopic] = useState("All");
  const [posts, setPosts] = useState(INITIAL_POSTS);

  // Form State
  const [matchTopic, setMatchTopic] = useState("System Design");
  const [matchSkill, setMatchSkill] = useState("Intermediate");
  const [matchDuration, setMatchDuration] = useState("30 min");
  const [matchLanguage, setMatchLanguage] = useState("English");
  const [matchType, setMatchType] = useState("Text");
  
  // App State
  const [isMatching, setIsMatching] = useState(false);
  const [activeChat, setActiveChat] = useState<{ id: string, user: any, topic: string, online: boolean, messages: any[] } | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showChatMenu, setShowChatMenu] = useState(false);
  
  const [activeSessions, setActiveSessions] = useState([
    { 
      id: 'sess_1', 
      user: { name: 'AlgoNinja', avatar: 'AN', role: 'Lvl 42 • 120 Solved' }, 
      topic: 'System Design',
      lastMessage: 'Let me know when you want to start mock.', 
      online: true,
      messages: [
        { id: 1, sender: 'them', text: 'Hi, want to do a mock interview?', type: 'text', time: '09:00 AM' },
        { id: 2, sender: 'me', text: 'Sure, I am free in 10 mins.', type: 'text', time: '09:05 AM' },
        { id: 3, sender: 'them', text: 'Let me know when you want to start mock.', type: 'text', time: '09:06 AM' },
      ]
    },
    { 
      id: 'sess_2', 
      user: { name: 'RecursiveRaven', avatar: 'RR', role: 'Lvl 19 • 45 Solved' }, 
      topic: 'DSA',
      lastMessage: 'I still get stuck on DP state transitions.', 
      online: false,
      messages: [
        { id: 1, sender: 'them', text: 'I still get stuck on DP state transitions.', type: 'text', time: 'Yesterday' }
      ]
    }
  ]);

  // Modal State
  const [showNewDiscussion, setShowNewDiscussion] = useState(false);
  const [newDiscTitle, setNewDiscTitle] = useState("");
  const [newDiscContent, setNewDiscContent] = useState("");
  const [newDiscTopic, setNewDiscTopic] = useState("DSA");
  const [newDiscAnon, setNewDiscAnon] = useState(true);

  // Refs
  const matchingCardRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const scrollToMatching = () => {
    matchingCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleStartMatching = () => {
    setIsMatching(true);
    setTimeout(() => {
      setIsMatching(false);
      const randomUser = ANONYMOUS_USERS[Math.floor(Math.random() * ANONYMOUS_USERS.length)];
      const newSession = {
        id: `sess_${Date.now()}`,
        user: { 
          name: randomUser, 
          avatar: randomUser.substring(0, 2).toUpperCase(), 
          role: `Lvl ${Math.floor(Math.random() * 50) + 10} • ${matchSkill}` 
        },
        topic: matchTopic,
        lastMessage: 'Matched just now',
        online: true,
        messages: [...PRE_SEEDED_MESSAGES]
      };
      setActiveSessions(prev => [newSession, ...prev]);
      setActiveChat(newSession);
    }, 2500);
  };

  const handleSendMessage = () => {
    if (!chatInput.trim() || !activeChat) return;
    
    const newMsg = {
      id: Date.now(),
      sender: 'me',
      text: chatInput,
      type: 'text',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setActiveChat(prev => prev ? {
      ...prev,
      messages: [...prev.messages, newMsg]
    } : null);
    
    setChatInput("");
    
    // Simulate reply
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const replyMsg = {
        id: Date.now() + 1,
        sender: 'them',
        text: 'Makes sense! Let me review that approach.',
        type: 'text',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setActiveChat(prev => prev ? {
        ...prev,
        messages: [...prev.messages, replyMsg]
      } : null);
    }, 2000);
  };

  useEffect(() => {
    if (activeChat && chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [activeChat?.messages, isTyping]);

  const handleCreateDiscussion = () => {
    if (!newDiscTitle.trim() || !newDiscContent.trim()) return;
    
    const newPost = {
      id: Date.now(),
      type: "discussion",
      author: {
        name: newDiscAnon ? "AnonymousLearner" : "You",
        role: "Just now",
        avatar: newDiscAnon ? "AL" : "Y"
      },
      timestamp: "Just now",
      title: newDiscTitle,
      content: newDiscContent,
      tags: [newDiscTopic],
      upvotes: 0,
      comments: 0
    };
    
    setPosts([newPost, ...posts]);
    setShowNewDiscussion(false);
    setNewDiscTitle("");
    setNewDiscContent("");
    setActiveTopic(newDiscTopic);
  };

  const filteredPosts = posts.filter(p => activeTopic === "All" || p.tags.includes(activeTopic));

  const renderMessageText = (msg: any, isMe: boolean) => {
    if (msg.type === 'code') {
      return (
        <pre 
          className="text-[11px] ia-mono p-3 rounded-lg overflow-x-auto mt-1 border"
          style={{ 
            backgroundColor: isMe ? "rgba(0,0,0,0.2)" : "var(--ia-bg)", 
            borderColor: isMe ? "rgba(0,0,0,0.1)" : "var(--ia-border-soft)",
            color: isMe ? "#111" : "var(--ia-text-dim)" 
          }}
        >
          <code>
            {msg.text.split('\n').map((line: string, i: number) => {
              const highlighted = line
                .replace(/\b(local|function|return|if|else|end)\b/g, `<span style="color: ${isMe ? '#444' : 'var(--ia-accent-2)'}">$1</span>`)
                .replace(/\b(tonumber|KEYS|ARGV)\b/g, `<span style="color: ${isMe ? '#222' : 'var(--ia-good)'}">$1</span>`);
              return <div key={i} dangerouslySetInnerHTML={{ __html: highlighted }} />;
            })}
          </code>
        </pre>
      );
    }
    return <p className="text-[15px] leading-relaxed font-medium">{msg.text}</p>;
  };

  return (
    <AppShell activeTab="discuss">
      <div 
        className="relative flex flex-col h-full ia-scope overflow-hidden"
        style={{ backgroundColor: "var(--ia-bg)", color: "var(--ia-text)" }}
      >
        <div className="flex-1 overflow-y-auto pb-24 flex flex-col relative scroll-smooth">
          
          {/* Header */}
          <div 
            className="px-4 pt-6 pb-4 flex flex-col gap-4 sticky top-0 z-10"
            style={{ 
              backgroundColor: "rgba(11, 13, 20, 0.85)", 
              backdropFilter: "blur(12px)",
              borderBottom: "1px solid var(--ia-border)"
            }}
          >
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold tracking-tight">Discuss</h1>
              <div className="flex gap-2">
                <button 
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                  style={{ backgroundColor: "var(--ia-surface)", border: "1px solid var(--ia-border)" }}
                >
                  <Search size={18} style={{ color: "var(--ia-text)" }} />
                </button>
              </div>
            </div>

            {/* Topic Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
              {TOPICS.map((topic) => (
                <button
                  key={topic}
                  onClick={() => setActiveTopic(topic)}
                  className="px-4 py-1.5 rounded-full whitespace-nowrap text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: activeTopic === topic ? "var(--ia-accent-soft)" : "var(--ia-surface)",
                    color: activeTopic === topic ? "var(--ia-accent)" : "var(--ia-text-dim)",
                    border: `1px solid ${activeTopic === topic ? "var(--ia-accent)" : "var(--ia-border-soft)"}`
                  }}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          {/* Hero Section */}
          <div className="px-4 py-6 border-b" style={{ borderColor: "var(--ia-border-soft)" }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs ia-mono font-medium mb-4" style={{ backgroundColor: "var(--ia-surface-2)", color: "var(--ia-accent-2)", border: "1px solid var(--ia-border)" }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "var(--ia-accent-2)" }}></span>
              Live Anonymous Sessions
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-3 leading-tight">Discuss with<br/>Learners</h1>
            <p className="text-[15px] leading-relaxed mb-6" style={{ color: "var(--ia-text-dim)" }}>
              Find a study partner, ask questions, or collaborate anonymously with learners preparing for similar goals.
            </p>
            <button 
              onClick={scrollToMatching}
              className="w-full py-3.5 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-[0.98]"
              style={{ background: "var(--ia-gradient)", color: "#000" }}
            >
              <Search size={18} strokeWidth={2.5} />
              Find a Co-Learner
            </button>
          </div>

          {/* Matching Card */}
          <div 
            id="matching-card"
            ref={matchingCardRef}
            className="mx-4 mt-6 rounded-2xl p-5 shadow-2xl relative overflow-hidden group"
            style={{ backgroundColor: "var(--ia-surface)", border: "1px solid var(--ia-border)" }}
          >
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none transition-opacity group-hover:opacity-[0.05]" style={{ background: "radial-gradient(circle at top right, var(--ia-accent), transparent 60%)" }}></div>
            
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner" style={{ backgroundColor: "var(--ia-bg)", border: "1px solid var(--ia-border-soft)" }}>
                <Users size={20} style={{ color: "var(--ia-accent)" }} />
              </div>
              <div>
                <h2 className="text-lg font-bold" style={{ color: "var(--ia-text)" }}>Anonymous Co-Learner</h2>
                <p className="text-xs mt-0.5" style={{ color: "var(--ia-text-dim)" }}>Match for a 1-on-1 prep session</p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold ia-mono uppercase tracking-wider" style={{ color: "var(--ia-text-faint)" }}>Topic</label>
                <div className="flex flex-wrap gap-2">
                  {MATCH_TOPICS.slice(0,6).map(topic => (
                    <button 
                      key={topic}
                      onClick={() => setMatchTopic(topic)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{ 
                        backgroundColor: matchTopic === topic ? "var(--ia-accent-soft)" : "var(--ia-surface-2)",
                        color: matchTopic === topic ? "var(--ia-accent)" : "var(--ia-text-dim)",
                        border: `1px solid ${matchTopic === topic ? "var(--ia-accent)" : "var(--ia-border-soft)"}`
                      }}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                 <div className="flex flex-col gap-2">
                   <label className="text-[11px] font-bold ia-mono uppercase tracking-wider" style={{ color: "var(--ia-text-faint)" }}>Skill Level</label>
                   <div className="relative">
                     <select 
                       value={matchSkill}
                       onChange={e => setMatchSkill(e.target.value)}
                       className="w-full appearance-none bg-transparent px-3 py-2.5 rounded-xl text-sm font-medium focus:outline-none"
                       style={{ backgroundColor: "var(--ia-surface-2)", border: "1px solid var(--ia-border-soft)", color: "var(--ia-text)" }}
                     >
                       {SKILL_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                     </select>
                     <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--ia-text-dim)" }} />
                   </div>
                 </div>

                 <div className="flex flex-col gap-2">
                   <label className="text-[11px] font-bold ia-mono uppercase tracking-wider" style={{ color: "var(--ia-text-faint)" }}>Duration</label>
                   <div className="relative">
                     <select 
                       value={matchDuration}
                       onChange={e => setMatchDuration(e.target.value)}
                       className="w-full appearance-none bg-transparent px-3 py-2.5 rounded-xl text-sm font-medium focus:outline-none"
                       style={{ backgroundColor: "var(--ia-surface-2)", border: "1px solid var(--ia-border-soft)", color: "var(--ia-text)" }}
                     >
                       {DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                     </select>
                     <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--ia-text-dim)" }} />
                   </div>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-1">
                 <div className="flex flex-col gap-2">
                   <label className="text-[11px] font-bold ia-mono uppercase tracking-wider" style={{ color: "var(--ia-text-faint)" }}>Session Type</label>
                   <div className="flex rounded-xl p-1" style={{ backgroundColor: "var(--ia-surface-2)", border: "1px solid var(--ia-border-soft)" }}>
                      {CHAT_TYPES.map(type => (
                        <button 
                          key={type}
                          onClick={() => setMatchType(type)}
                          className="flex-1 py-1.5 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                          style={{ 
                            backgroundColor: matchType === type ? "var(--ia-bg-elevated)" : "transparent",
                            color: matchType === type ? "var(--ia-text)" : "var(--ia-text-dim)",
                            boxShadow: matchType === type ? "0 2px 4px rgba(0,0,0,0.2)" : "none"
                          }}
                        >
                          {type === "Text" ? <MessageSquare size={12} /> : <Mic size={12} />}
                          {type}
                        </button>
                      ))}
                   </div>
                 </div>

                 <div className="flex flex-col gap-2">
                   <label className="text-[11px] font-bold ia-mono uppercase tracking-wider" style={{ color: "var(--ia-text-faint)" }}>Language</label>
                   <div className="relative">
                     <select 
                       value={matchLanguage}
                       onChange={e => setMatchLanguage(e.target.value)}
                       className="w-full appearance-none bg-transparent px-3 py-2.5 rounded-xl text-sm font-medium focus:outline-none"
                       style={{ backgroundColor: "var(--ia-surface-2)", border: "1px solid var(--ia-border-soft)", color: "var(--ia-text)" }}
                     >
                       {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                     </select>
                     <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--ia-text-dim)" }} />
                   </div>
                 </div>
              </div>
              
              <button 
                onClick={handleStartMatching}
                className="w-full py-3.5 mt-2 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 shadow-lg transition-colors hover:opacity-90 active:scale-[0.98]"
                style={{ backgroundColor: "var(--ia-accent)", color: "#000" }}
              >
                Start Matching
              </button>
            </div>
          </div>

          {/* Active Sessions */}
          {activeSessions.length > 0 && (
            <div className="mx-4 mt-8 mb-2">
              <h3 className="text-[11px] font-bold ia-mono uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: "var(--ia-text-faint)" }}>
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "var(--ia-accent)" }}></div>
                Active Sessions
              </h3>
              <div className="flex flex-col gap-2.5">
                {activeSessions.map(session => (
                  <button 
                    key={session.id}
                    onClick={() => setActiveChat(session)}
                    className="w-full text-left rounded-xl p-3 flex items-center gap-3 transition-colors active:scale-[0.99]"
                    style={{ backgroundColor: "var(--ia-surface)", border: "1px solid var(--ia-border)" }}
                  >
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold ia-mono shadow-inner" style={{ backgroundColor: "var(--ia-bg-elevated)", color: "var(--ia-accent-2)", border: "1px solid var(--ia-border-soft)" }}>
                        {session.user.avatar}
                      </div>
                      {session.online && (
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2" style={{ backgroundColor: "var(--ia-good)", borderColor: "var(--ia-surface)" }}></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-semibold text-[15px] truncate pr-2" style={{ color: "var(--ia-text)" }}>{session.user.name}</span>
                        <span className="text-[10px] ia-mono px-1.5 py-0.5 rounded-md shrink-0" style={{ backgroundColor: "var(--ia-surface-2)", color: "var(--ia-text-dim)" }}>{session.topic}</span>
                      </div>
                      <p className="text-xs truncate" style={{ color: "var(--ia-text-dim)" }}>{session.lastMessage}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Community Guidelines Banner */}
          <div className="mx-4 mt-8 mb-4 p-3 rounded-xl flex items-start gap-3" style={{ backgroundColor: "var(--ia-surface-2)", border: "1px solid var(--ia-border-soft)" }}>
            <Shield size={16} className="shrink-0 mt-0.5" style={{ color: "var(--ia-accent)" }} />
            <p className="text-xs leading-relaxed" style={{ color: "var(--ia-text-dim)" }}>
                Be respectful. Harassment and doxxing are not tolerated — all posts are <span style={{ color: "var(--ia-text)" }}>AI-moderated</span>.
            </p>
          </div>

          <div className="px-4 pb-4 flex flex-col gap-4">
            {/* Trending Banner */}
            <div className="rounded-xl p-4 flex items-center gap-3" style={{ backgroundColor: "var(--ia-surface-2)", border: "1px solid var(--ia-border)" }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "var(--ia-accent-soft)" }}>
                <TrendingUp size={16} style={{ color: "var(--ia-accent)" }} />
              </div>
              <div>
                <div className="text-sm font-semibold" style={{ color: "var(--ia-text)" }}>Trending: System Design for Staff</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--ia-text-faint)" }}>24 active discussions today</div>
              </div>
            </div>

            {/* Posts Feed */}
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <div 
                  key={post.id}
                  className="rounded-xl p-4 flex flex-col gap-3"
                  style={{ backgroundColor: "var(--ia-surface)", border: "1px solid var(--ia-border-soft)", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3 items-center">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ia-mono"
                        style={{ 
                          backgroundColor: post.type === "success" ? "rgba(61, 220, 151, 0.15)" : 
                                           post.type === "partner" ? "rgba(79, 216, 232, 0.15)" : "var(--ia-bg-elevated)",
                          color: post.type === "success" ? "var(--ia-good)" : 
                                 post.type === "partner" ? "var(--ia-accent-2)" : "var(--ia-text-dim)",
                          border: "1px solid var(--ia-border)"
                        }}
                      >
                        {post.type === "success" ? <Trophy size={16} /> : 
                         post.type === "partner" ? <Users size={16} /> : post.author.avatar}
                      </div>
                      <div>
                        <div className="text-sm font-semibold flex items-center gap-1.5" style={{ color: "var(--ia-text)" }}>
                          {post.author.name}
                          {post.author.name !== "You" && <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--ia-accent)", opacity: 0.8 }}></span>}
                        </div>
                        <div className="text-xs ia-mono mt-0.5" style={{ color: "var(--ia-accent-2)" }}>{post.author.role}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs ia-mono" style={{ color: "var(--ia-text-faint)" }}>{post.timestamp}</span>
                      <button style={{ color: "var(--ia-text-faint)" }}>
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-[15px] mb-1.5 leading-snug" style={{ color: "var(--ia-text)" }}>{post.title}</h3>
                    <p className="text-sm leading-relaxed line-clamp-3" style={{ color: "var(--ia-text-dim)" }}>{post.content}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-1">
                    {post.tags.map(tag => (
                      <span 
                        key={tag}
                        className="text-[11px] px-2 py-0.5 rounded-md ia-mono"
                        style={{ backgroundColor: "var(--ia-bg)", color: "var(--ia-text-dim)", border: "1px solid var(--ia-border)" }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-1" style={{ borderTop: "1px solid var(--ia-border-soft)" }}>
                    <div className="flex gap-4">
                      <button className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "var(--ia-text-dim)" }}>
                        <ThumbsUp size={14} />
                        <span className="ia-mono">{post.upvotes}</span>
                      </button>
                      <button className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "var(--ia-text-dim)" }}>
                        <MessageSquare size={14} />
                        <span className="ia-mono">{post.comments}</span>
                      </button>
                    </div>
                    <button className="flex items-center gap-1 text-xs font-medium" style={{ color: "var(--ia-text-faint)" }}>
                      <Share2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center gap-4 rounded-xl border border-dashed" style={{ borderColor: "var(--ia-border)", backgroundColor: "var(--ia-surface)" }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-inner" style={{ backgroundColor: "var(--ia-bg)", border: "1px solid var(--ia-border-soft)" }}>
                  <MessageSquare size={20} style={{ color: "var(--ia-text-dim)" }} />
                </div>
                <div>
                  <h3 className="font-semibold text-[15px]" style={{ color: "var(--ia-text)" }}>No discussions found</h3>
                  <p className="text-xs mt-1.5 max-w-[220px] leading-relaxed mx-auto" style={{ color: "var(--ia-text-dim)" }}>
                    Be the first learner to start an anonymous conversation about {activeTopic}!
                  </p>
                </div>
                <button 
                  onClick={() => { setNewDiscTopic(activeTopic === "All" ? "DSA" : activeTopic); setShowNewDiscussion(true); }} 
                  className="mt-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-colors flex items-center gap-2" 
                  style={{ backgroundColor: "var(--ia-accent-soft)", color: "var(--ia-accent)", border: "1px solid var(--ia-accent)" }}
                >
                  <Plus size={14} /> Start Discussion
                </button>
              </div>
            )}
          </div>
        </div>

        {/* FAB */}
        <button 
          onClick={() => setShowNewDiscussion(true)}
          className="absolute bottom-24 right-4 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-transform hover:scale-105 active:scale-95 z-40"
          style={{ background: "var(--ia-gradient)", color: "#000" }}
        >
          <Plus size={24} className="font-bold" />
        </button>

        {/* Matching Overlay */}
        {isMatching && (
          <div className="absolute inset-0 z-[70] flex flex-col items-center justify-center animate-in fade-in duration-300" style={{ backgroundColor: "rgba(11, 13, 20, 0.95)", backdropFilter: "blur(12px)" }}>
            <div className="relative flex items-center justify-center w-32 h-32 mb-8">
               <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ backgroundColor: "var(--ia-accent)" }}></div>
               <div className="absolute inset-4 rounded-full animate-ping opacity-40" style={{ backgroundColor: "var(--ia-accent)", animationDelay: "0.2s" }}></div>
               <div className="absolute inset-8 rounded-full animate-ping opacity-60" style={{ backgroundColor: "var(--ia-accent)", animationDelay: "0.4s" }}></div>
               <div className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: "var(--ia-accent)", color: "#000" }}>
                 <Search size={24} className="animate-pulse" />
               </div>
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">Finding Match</h3>
            <p className="text-sm ia-mono text-center px-8" style={{ color: "var(--ia-text-dim)" }}>
              Looking for an anonymous learner interested in<br/>
              <span style={{ color: "var(--ia-accent-2)" }}>{matchTopic}</span> ({matchSkill})
            </p>
          </div>
        )}

        {/* Chat Overlay */}
        {activeChat && (
          <div 
            className="absolute inset-0 z-50 flex flex-col ia-scope animate-in slide-in-from-bottom-8 duration-300"
            style={{ backgroundColor: "var(--ia-bg)", color: "var(--ia-text)" }}
          >
            <div className="px-4 py-3 flex items-center justify-between border-b" style={{ backgroundColor: "rgba(11, 13, 20, 0.85)", backdropFilter: "blur(12px)", borderColor: "var(--ia-border)" }}>
               <div className="flex items-center gap-3">
                  <button onClick={() => setActiveChat(null)} className="p-2 -ml-2 rounded-full hover:bg-white/5 active:bg-white/10 transition-colors">
                    <ChevronDown size={20} className="rotate-90" style={{ color: "var(--ia-text-dim)" }} />
                  </button>
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ia-mono shadow-inner" style={{ backgroundColor: "var(--ia-bg-elevated)", color: "var(--ia-accent-2)", border: "1px solid var(--ia-border-soft)" }}>
                        {activeChat.user.avatar}
                      </div>
                      {activeChat.online && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2" style={{ backgroundColor: "var(--ia-good)", borderColor: "var(--ia-bg)" }}></div>}
                    </div>
                    <div>
                      <div className="text-sm font-semibold flex items-center gap-1.5 leading-tight">
                        {activeChat.user.name}
                        <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-white/5 ia-mono" style={{ color: "var(--ia-text-dim)" }}>{activeChat.topic}</span>
                      </div>
                      <div className="text-[11px] mt-0.5 ia-mono" style={{ color: "var(--ia-text-faint)" }}>{activeChat.user.role}</div>
                    </div>
                  </div>
               </div>
               <div className="flex items-center gap-1">
                  <button className="p-2 rounded-full hover:bg-white/5 active:bg-white/10 transition-colors">
                    <Phone size={18} style={{ color: "var(--ia-text-dim)" }} />
                  </button>
                  <div className="relative">
                    <button onClick={() => setShowChatMenu(!showChatMenu)} className="p-2 rounded-full hover:bg-white/5 active:bg-white/10 transition-colors">
                      <MoreHorizontal size={18} style={{ color: "var(--ia-text-dim)" }} />
                    </button>
                    {showChatMenu && (
                      <div className="absolute right-0 top-full mt-1 w-40 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200" style={{ backgroundColor: "var(--ia-surface-2)", border: "1px solid var(--ia-border)" }}>
                        <button className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 hover:bg-white/5 transition-colors" style={{ color: "var(--ia-text)" }}>
                          <X size={14} /> End Session
                        </button>
                        <div className="h-px w-full" style={{ backgroundColor: "var(--ia-border-soft)" }}></div>
                        <button className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 hover:bg-white/5 transition-colors" style={{ color: "var(--ia-warn)" }}>
                          <AlertTriangle size={14} /> Report User
                        </button>
                        <button className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 hover:bg-white/5 transition-colors" style={{ color: "var(--ia-danger)" }}>
                          <Ban size={14} /> Block User
                        </button>
                      </div>
                    )}
                  </div>
               </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4" ref={chatScrollRef}>
              <div className="text-center mb-4 flex flex-col items-center">
                 <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2 shadow-inner" style={{ backgroundColor: "var(--ia-bg)", border: "1px solid var(--ia-border)" }}>
                    <Shield size={20} style={{ color: "var(--ia-accent)" }} />
                 </div>
                 <p className="text-[11px] text-balance max-w-[250px] ia-mono" style={{ color: "var(--ia-text-dim)" }}>
                   This is an anonymous session. Harassment is not tolerated and may result in a ban.
                 </p>
              </div>

              {activeChat.messages.map((msg, i) => {
                const isMe = msg.sender === 'me';
                return (
                  <div key={i} className={`flex flex-col max-w-[85%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                    <div 
                      className={`px-4 py-2.5 rounded-2xl ${isMe ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
                      style={{ 
                        backgroundColor: isMe ? "var(--ia-accent)" : "var(--ia-surface)",
                        color: isMe ? "#000" : "var(--ia-text)",
                        border: isMe ? "none" : "1px solid var(--ia-border)"
                      }}
                    >
                      {renderMessageText(msg, isMe)}
                    </div>
                    <span className="text-[10px] mt-1 ia-mono mx-1" style={{ color: "var(--ia-text-faint)" }}>{msg.time}</span>
                  </div>
                );
              })}
              
              {isTyping && (
                <div className="self-start flex flex-col max-w-[85%]">
                   <div className="px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5 shadow-sm" style={{ backgroundColor: "var(--ia-surface)", border: "1px solid var(--ia-border)" }}>
                     <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: "var(--ia-text-faint)", animationDelay: "0ms" }}></div>
                     <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: "var(--ia-text-faint)", animationDelay: "150ms" }}></div>
                     <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: "var(--ia-text-faint)", animationDelay: "300ms" }}></div>
                   </div>
                   <span className="text-[10px] mt-1 ia-mono mx-1" style={{ color: "var(--ia-text-faint)" }}>{activeChat.user.name} is typing...</span>
                </div>
              )}
            </div>

            <div className="p-3 pb-5 border-t" style={{ backgroundColor: "var(--ia-surface)", borderColor: "var(--ia-border)" }}>
               <div className="flex items-end gap-2 p-1.5 rounded-2xl" style={{ backgroundColor: "var(--ia-bg)", border: "1px solid var(--ia-border-soft)" }}>
                  <button className="p-2.5 shrink-0 rounded-xl hover:bg-white/5 transition-colors" style={{ color: "var(--ia-text-dim)" }}>
                    <Terminal size={20} />
                  </button>
                  <textarea 
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    placeholder="Message anonymously..."
                    className="flex-1 max-h-32 min-h-[44px] py-3 bg-transparent resize-none text-[15px] focus:outline-none"
                    style={{ color: "var(--ia-text)" }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={!chatInput.trim()}
                    className="p-2.5 shrink-0 rounded-xl transition-all disabled:opacity-50"
                    style={{ backgroundColor: chatInput.trim() ? "var(--ia-accent)" : "transparent", color: chatInput.trim() ? "#000" : "var(--ia-text-dim)" }}
                  >
                    <Send size={18} className={chatInput.trim() ? "ml-0.5" : ""} />
                  </button>
               </div>
            </div>
          </div>
        )}

        {/* Start Discussion Modal */}
        {showNewDiscussion && (
          <div className="absolute inset-0 z-[60] flex items-end justify-center animate-in fade-in duration-200" style={{ backgroundColor: "rgba(11, 13, 20, 0.8)", backdropFilter: "blur(4px)" }}>
            <div className="absolute inset-0" onClick={() => setShowNewDiscussion(false)}></div>
            <div 
              className="relative w-full rounded-t-[2rem] p-6 flex flex-col gap-5 animate-in slide-in-from-bottom-8 duration-300 shadow-2xl"
              style={{ backgroundColor: "var(--ia-surface)", borderTop: "1px solid var(--ia-border)" }}
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-xl font-bold">New Discussion</h3>
                <button onClick={() => setShowNewDiscussion(false)} className="p-2 rounded-full bg-white/5 active:bg-white/10 transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <input 
                  type="text" 
                  placeholder="Discussion Title"
                  value={newDiscTitle}
                  onChange={e => setNewDiscTitle(e.target.value)}
                  className="w-full bg-transparent border-b px-2 py-3 text-lg font-semibold focus:outline-none"
                  style={{ borderColor: "var(--ia-border)", color: "var(--ia-text)" }}
                />
                
                <textarea 
                  placeholder="What's on your mind? Feel free to share code or questions..."
                  value={newDiscContent}
                  onChange={e => setNewDiscContent(e.target.value)}
                  className="w-full bg-transparent px-2 py-2 min-h-[100px] resize-none text-[15px] focus:outline-none"
                  style={{ color: "var(--ia-text)" }}
                />

                <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-4">
                  {MATCH_TOPICS.map(topic => (
                    <button
                      key={topic}
                      onClick={() => setNewDiscTopic(topic)}
                      className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-colors"
                      style={{
                        backgroundColor: newDiscTopic === topic ? "var(--ia-accent-soft)" : "var(--ia-surface-2)",
                        color: newDiscTopic === topic ? "var(--ia-accent)" : "var(--ia-text-dim)",
                        border: `1px solid ${newDiscTopic === topic ? "var(--ia-accent)" : "var(--ia-border-soft)"}`
                      }}
                    >
                      {topic}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-2 p-3 rounded-xl shadow-inner" style={{ backgroundColor: "var(--ia-bg-elevated)", border: "1px solid var(--ia-border-soft)" }}>
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--ia-surface)", border: "1px solid var(--ia-border)" }}>
                        {newDiscAnon ? <Shield size={14} style={{ color: "var(--ia-accent)" }} /> : <Users size={14} style={{ color: "var(--ia-text-dim)" }} />}
                     </div>
                     <div>
                       <div className="text-sm font-semibold">Post Anonymously</div>
                       <div className="text-[10px] ia-mono mt-0.5" style={{ color: "var(--ia-text-dim)" }}>Hide your real identity</div>
                     </div>
                  </div>
                  <button 
                    onClick={() => setNewDiscAnon(!newDiscAnon)}
                    className={`w-11 h-6 rounded-full relative transition-colors ${newDiscAnon ? 'bg-[var(--ia-accent)]' : 'bg-[var(--ia-surface)] border border-[var(--ia-border)]'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-black transition-transform ${newDiscAnon ? 'left-6' : 'left-1 bg-white/50'}`}></div>
                  </button>
                </div>

                <button 
                  onClick={handleCreateDiscussion}
                  disabled={!newDiscTitle.trim() || !newDiscContent.trim()}
                  className="w-full py-4 mt-2 rounded-xl font-bold text-[15px] flex items-center justify-center shadow-lg transition-colors disabled:opacity-50"
                  style={{ backgroundColor: "var(--ia-accent)", color: "#000" }}
                >
                  Post Discussion
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AppShell>
  );
}
