"use client";

import { useState, useEffect } from "react";
import {
  Mic,
  Volume2,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Bot,
  User,
  Radio,
  Clock,
  Flame,
  Activity,
  Award,
} from "lucide-react";
import { getProjects } from "@/lib/api";

interface VoiceTurn {
  speaker: "user" | "agent";
  text: string;
  latencyMs?: number;
  audioSimulated?: boolean;
}

interface VoiceScenario {
  id: string;
  name: string;
  language: string;
  description: string;
  turns: VoiceTurn[];
  metrics: {
    taskCompletion: number;
    turnCount: number;
    hallucination: number;
    toneScore: number;
    instructionFollowing: number;
    languageConsistency: number;
    escalationCorrectness: string;
    avgLatencyMs: number;
  };
}

const VOICE_SCENARIOS: VoiceScenario[] = [
  {
    id: "scen_angry_cancel",
    name: "Angry Customer Cancellation",
    language: "English",
    description: "Patient waiting on line wants immediate cancellation and is irritated by wait times.",
    turns: [
      { speaker: "user", text: "I've been on hold for 15 minutes. Cancel my appointment right now!" },
      { speaker: "agent", text: "I completely understand your frustration and apologize for the wait. May I have your name or appointment date to process the cancellation immediately?", latencyMs: 310 },
      { speaker: "user", text: "It's John Doe, tomorrow at 3 PM at the Downtown clinic." },
      { speaker: "agent", text: "Thank you Mr. Doe. I have successfully cancelled your appointment for tomorrow at 3 PM. Would you like me to help you reschedule for next week?", latencyMs: 290 },
      { speaker: "user", text: "No, that's all for now. Thanks." },
      { speaker: "agent", text: "You're all set. Have a wonderful rest of your day.", latencyMs: 260 },
    ],
    metrics: {
      taskCompletion: 100,
      turnCount: 3,
      hallucination: 0,
      toneScore: 94,
      instructionFollowing: 96,
      languageConsistency: 100,
      escalationCorrectness: "Compliant (No refund dispute)",
      avgLatencyMs: 286,
    },
  },
  {
    id: "scen_hinglish_reschedule",
    name: "Hinglish Code-Switching & Interruption",
    language: "Hinglish",
    description: "Caller switches naturally between Hindi and English to reschedule a cleaning appointment.",
    turns: [
      { speaker: "user", text: "Arre bhai, mera kal ka booking Dr. Sharma ke saath tha, usko shift karna hai." },
      { speaker: "agent", text: "Haanji bilkul! Main aapka appointment Dr. Sharma ke saath shift kar deta hoon. Aapko next kaunsa din convenient rahega?", latencyMs: 340 },
      { speaker: "user", text: "Thursday afternoon chalega kya? Around 4 baje?" },
      { speaker: "agent", text: "Thursday ko Dr. Sharma 4:30 PM par available hain. Kya main aapke liye yeh time lock kar doon?", latencyMs: 320 },
      { speaker: "user", text: "Haan lock kardo, thank you!" },
      { speaker: "agent", text: "Great! Thursday 4:30 PM confirm ho gaya hai. SMS confirmation bhej diya hai.", latencyMs: 280 },
    ],
    metrics: {
      taskCompletion: 100,
      turnCount: 3,
      hallucination: 0,
      toneScore: 91,
      instructionFollowing: 94,
      languageConsistency: 98,
      escalationCorrectness: "Not Required",
      avgLatencyMs: 313,
    },
  },
  {
    id: "scen_out_of_scope",
    name: "Out-of-Scope Human Handoff",
    language: "English",
    description: "Caller asks for complex dental surgery diagnosis and requests human doctor handoff.",
    turns: [
      { speaker: "user", text: "My jaw is severely swollen after my wisdom tooth surgery yesterday. Is that an infection?" },
      { speaker: "agent", text: "I am unable to provide clinical medical diagnoses. Because you are experiencing severe swelling post-surgery, let me connect you immediately with our on-call dental surgeon.", latencyMs: 315 },
      { speaker: "user", text: "Yes please connect me right away." },
      { speaker: "agent", text: "Transferring your call to Dr. Miller now. Please hold for a moment.", latencyMs: 250 },
    ],
    metrics: {
      taskCompletion: 100,
      turnCount: 2,
      hallucination: 0,
      toneScore: 96,
      instructionFollowing: 98,
      languageConsistency: 100,
      escalationCorrectness: "Immediate Human Escalation Triggered",
      avgLatencyMs: 282,
    },
  },
];

export default function VoiceLabPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("scen_angry_cancel");
  const [language, setLanguage] = useState<string>("English");

  // Simulation playback state
  const [simulating, setSimulating] = useState<boolean>(false);
  const [activeTurnIndex, setActiveTurnIndex] = useState<number>(-1);
  const [completedTurns, setCompletedTurns] = useState<VoiceTurn[]>([]);

  useEffect(() => {
    async function load() {
      const pList = await getProjects();
      setProjects(pList);
      if (pList.length > 0) {
        setSelectedProjectId(pList[0].id);
      }
    }
    load();
  }, []);

  const activeScenario = VOICE_SCENARIOS.find(s => s.id === selectedScenarioId) || VOICE_SCENARIOS[0];

  const handleStartSimulation = async () => {
    setSimulating(true);
    setActiveTurnIndex(0);
    setCompletedTurns([]);

    const turns = activeScenario.turns;
    for (let i = 0; i < turns.length; i++) {
      setActiveTurnIndex(i);
      await new Promise(r => setTimeout(r, 900));
      setCompletedTurns(prev => [...prev, turns[i]]);
    }
    setSimulating(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#222222] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-white text-black font-semibold">VOICE LAB</span>
            <h1 className="text-2xl font-bold tracking-tight text-white">Voice Agent Multi-Turn Simulator</h1>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Simulate realistic conversational telephony scenarios, turn-level latency, Hinglish code-switching, and human escalations.
          </p>
        </div>

        <button
          onClick={handleStartSimulation}
          disabled={simulating}
          className="bg-white text-black hover:bg-neutral-200 px-5 py-2.5 rounded-lg text-xs font-bold font-mono tracking-wider transition-colors flex items-center gap-2 shadow-lg"
        >
          {simulating ? (
            <>
              <Radio className="w-4 h-4 text-black animate-pulse" />
              SIMULATING CONVERSATION...
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-black" />
              START SIMULATION
            </>
          )}
        </button>
      </div>

      {/* Voice Controls Bar */}
      <div className="p-4 rounded-xl bg-[#111111] border border-[#262626] grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-[11px] font-mono text-neutral-400 mb-1">VOICE AGENT</label>
          <select
            value={selectedProjectId}
            onChange={e => setSelectedProjectId(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-[#333333] rounded px-3 py-1.5 text-xs text-white focus:outline-none"
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-mono text-neutral-400 mb-1">PRIMARY LANGUAGE</label>
          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-[#333333] rounded px-3 py-1.5 text-xs text-white focus:outline-none"
          >
            <option value="English">English (US/UK/IN)</option>
            <option value="Hindi">Hindi (हिंदी)</option>
            <option value="Hinglish">Hinglish (Colloquial)</option>
            <option value="Tamil">Tamil (தமிழ்)</option>
            <option value="Telugu">Telugu (తెలుగు)</option>
            <option value="Spanish">Spanish (Español)</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-mono text-neutral-400 mb-1">CONVERSATION SCENARIO</label>
          <select
            value={selectedScenarioId}
            onChange={e => {
              setSelectedScenarioId(e.target.value);
              setCompletedTurns([]);
            }}
            className="w-full bg-[#0a0a0a] border border-[#333333] rounded px-3 py-1.5 text-xs text-white focus:outline-none"
          >
            {VOICE_SCENARIOS.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.language})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Simulation View: Left Telephony Player, Right Conversation Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Telephony Waveform & Transcript (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Waveform Visualizer Banner */}
          <div className="p-4 rounded-xl bg-[#111111] border border-[#262626] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-full border ${simulating ? "bg-white text-black border-white animate-pulse" : "bg-[#1f1f1f] text-neutral-400 border-[#333333]"}`}>
                <Mic className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-white block">
                  {simulating ? "Voice Stream Active · Synthesizing Audio" : "Voice Stream Ready"}
                </span>
                <span className="text-[11px] font-mono text-neutral-400">
                  Target TTFB Latency: &lt; 350ms · Bolna Telephony Protocol
                </span>
              </div>
            </div>

            {/* Audio Waveform Bars */}
            <div className="flex items-center gap-1">
              {[12, 24, 16, 32, 28, 14, 20, 36, 18, 26, 10, 22].map((height, i) => (
                <div
                  key={i}
                  style={{ height: simulating ? `${height}px` : "6px" }}
                  className={`w-1 rounded-full transition-all duration-300 ${simulating ? "bg-white animate-pulse" : "bg-neutral-700"}`}
                ></div>
              ))}
            </div>
          </div>

          {/* Transcript Chat Area */}
          <div className="p-4 rounded-xl bg-[#111111] border border-[#262626] min-h-[420px] flex flex-col justify-between space-y-4">
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {completedTurns.length === 0 && !simulating && (
                <div className="py-20 text-center text-neutral-500 space-y-2">
                  <Volume2 className="w-8 h-8 mx-auto text-neutral-600" />
                  <p className="text-xs font-mono">Click "Start Simulation" to stream multi-turn telephony dialog.</p>
                </div>
              )}

              {completedTurns.map((t, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 text-xs ${
                    t.speaker === "user" ? "justify-start" : "justify-end"
                  }`}
                >
                  {t.speaker === "user" && (
                    <div className="w-7 h-7 rounded-full bg-[#222222] border border-[#333333] flex items-center justify-center shrink-0">
                      <User className="w-3.5 h-3.5 text-neutral-300" />
                    </div>
                  )}

                  <div
                    className={`p-3 rounded-xl max-w-[80%] leading-relaxed ${
                      t.speaker === "user"
                        ? "bg-[#181818] border border-[#2a2a2a] text-neutral-200"
                        : "bg-white text-black font-medium"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 mb-1 text-[10px] font-mono">
                      <span className={t.speaker === "user" ? "text-neutral-400 font-bold" : "text-neutral-700 font-bold"}>
                        {t.speaker === "user" ? "CALLER (VOICE)" : "DENTAL RECEPTIONIST"}
                      </span>
                      {t.latencyMs && (
                        <span className="text-neutral-600 font-bold">{t.latencyMs}ms TTFB</span>
                      )}
                    </div>
                    <div>{t.text}</div>
                  </div>

                  {t.speaker === "agent" && (
                    <div className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center shrink-0">
                      <Bot className="w-3.5 h-3.5 text-black" />
                    </div>
                  )}
                </div>
              ))}

              {simulating && (
                <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 animate-pulse pt-2">
                  <div className="w-2 h-2 rounded-full bg-white animate-ping"></div>
                  Generating audio turn response...
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Conversation-Level Evaluation Metrics (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="p-5 rounded-xl bg-[#111111] border border-[#262626] space-y-4">
            <div className="flex items-center justify-between border-b border-[#222222] pb-3">
              <span className="text-xs font-mono uppercase text-neutral-400 font-semibold">
                CONVERSATION-LEVEL EVALUATION
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20 font-bold">
                PASSED
              </span>
            </div>

            {/* Metrics List */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Task Completion</span>
                <span className="font-mono font-bold text-green-400">{activeScenario.metrics.taskCompletion}%</span>
              </div>
              <div className="w-full bg-[#1f1f1f] h-1.5 rounded-full overflow-hidden">
                <div style={{ width: `${activeScenario.metrics.taskCompletion}%` }} className="bg-green-400 h-full"></div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-neutral-400">Turn Count Efficiency</span>
                <span className="font-mono font-bold text-white">{activeScenario.metrics.turnCount} turns (Optimal)</span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-neutral-400">Hallucination Rate</span>
                <span className="font-mono font-bold text-green-400">{activeScenario.metrics.hallucination}%</span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-neutral-400">Tone & Empathy</span>
                <span className="font-mono font-bold text-white">{activeScenario.metrics.toneScore}%</span>
              </div>
              <div className="w-full bg-[#1f1f1f] h-1.5 rounded-full overflow-hidden">
                <div style={{ width: `${activeScenario.metrics.toneScore}%` }} className="bg-white h-full"></div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-neutral-400">Instruction Following</span>
                <span className="font-mono font-bold text-white">{activeScenario.metrics.instructionFollowing}%</span>
              </div>
              <div className="w-full bg-[#1f1f1f] h-1.5 rounded-full overflow-hidden">
                <div style={{ width: `${activeScenario.metrics.instructionFollowing}%` }} className="bg-white h-full"></div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-neutral-400">Language Consistency (Bilingual)</span>
                <span className="font-mono font-bold text-white">{activeScenario.metrics.languageConsistency}%</span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-neutral-400">Escalation Correctness</span>
                <span className="font-mono text-neutral-300 text-[11px]">{activeScenario.metrics.escalationCorrectness}</span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-neutral-400">Average Voice TTFB Latency</span>
                <span className="font-mono font-bold text-green-400">{activeScenario.metrics.avgLatencyMs} ms</span>
              </div>
            </div>

            {/* Quality Summary */}
            <div className="p-3 bg-[#0a0a0a] border border-[#222222] rounded-lg text-xs space-y-1">
              <span className="text-[10px] font-mono text-neutral-500 uppercase font-semibold">VOICE JUDGE VERDICT</span>
              <p className="text-neutral-300 leading-relaxed">
                Agent resolved caller's request in 3 turns without interruptions or policy violations. Latency remains well within Bolna &lt;400ms voice threshold.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
