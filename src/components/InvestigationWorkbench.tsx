"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Background, Controls, ReactFlow, type Edge, type Node, type OnInit, type ReactFlowInstance } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Activity, ArrowDownToLine, Box, ChevronRight, Database, FileText, Fingerprint, Focus, Info, Network, Play, ScanLine, Search, ShieldCheck, Sparkles, X } from "lucide-react";
import { cases, type Candidate, type EvidenceGrade, type InvestigationCase, type TraceNode } from "@/data/cases";

const roleClass: Record<TraceNode["role"], string> = { seed: "seed", intermediary: "intermediary", vasp: "vasp", bridge: "bridge", unknown: "unknown" };
const traceSteps = [
  { title: "Secure case context", detail: "Synthetic incident window and anchor locked", command: "case.lock --simulation", icon: Fingerprint },
  { title: "Retrieve observed transfers", detail: "Indexing the local ledger snapshot", command: "ledger.query --observed-only", icon: Database },
  { title: "Build the fund-flow graph", detail: "Ordering transfers by time and value", command: "graph.compose --temporal", icon: Network },
  { title: "Screen destination endpoints", detail: "Checking the simulated label registry", command: "endpoint.screen --local-registry", icon: ScanLine },
  { title: "Assess unresolved boundaries", detail: "Retaining bridge and attribution uncertainty", command: "boundary.assess --no-inference", icon: Activity },
  { title: "Assemble evidence manifest", detail: "Preparing a reviewable synthetic evidence lead", command: "report.assemble --review-ready", icon: ShieldCheck },
] as const;
const revealAt: Record<TraceNode["role"], number> = { seed: 0, intermediary: 2, vasp: 4, bridge: 4, unknown: 4 };

function Grade({ grade }: { grade: EvidenceGrade }) { return <span className={`grade ${grade.toLowerCase()}`}>{grade}</span>; }

export default function InvestigationWorkbench() {
  const [activeId, setActiveId] = useState(cases[0].id);
  const [candidateId, setCandidateId] = useState(cases[0].candidates[0].id);
  const [nodeId, setNodeId] = useState<string | null>(null);
  const [stage, setStage] = useState<number>(traceSteps.length);
  const [elapsed, setElapsed] = useState(30);
  const [running, setRunning] = useState(false);
  const [guide, setGuide] = useState(false);
  const [flow, setFlow] = useState<ReactFlowInstance | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeCase = useMemo(() => cases.find((item) => item.id === activeId) ?? cases[0], [activeId]);
  const candidate = activeCase.candidates.find((item) => item.id === candidateId) ?? activeCase.candidates[0];
  const selectedNode = activeCase.nodes.find((item) => item.id === nodeId);
  const path = candidate.path;

  const nodes = useMemo<Node[]>(() => activeCase.nodes.map((item) => {
    const revealed = !running || stage >= revealAt[item.role];
    return {
    id: item.id, position: { x: item.x, y: item.y }, data: { label: <><b>{item.label}</b><small>{item.address}</small></> },
    className: `trace-node ${roleClass[item.role]} ${path.includes(item.id) ? "path-active" : ""} ${running && revealed ? "is-discovered" : ""} ${running && !revealed ? "is-pending" : ""}`, style: { opacity: revealed ? 1 : .12 },
  }; }), [activeCase, path, running, stage]);
  const edges = useMemo<Edge[]>(() => activeCase.edges.map((item, index) => {
    const revealed = !running || stage >= Math.min(4, index + 1);
    return {
    id: item.id, source: item.source, target: item.target, label: item.amount, animated: Boolean(item.active && stage >= 2),
    className: `trace-edge ${path.includes(item.source) && path.includes(item.target) ? "path-active" : ""}`,
    labelStyle: { fill: "#6b6b6b", fontSize: 11, fontWeight: 600 }, labelBgStyle: { fill: "#fafafa", fillOpacity: .92 }, labelBgPadding: [5, 3], style: { opacity: revealed ? 1 : .15 },
  }; }), [activeCase, path, running, stage]);
  const onInit: OnInit = useCallback((instance) => { setFlow(instance); window.setTimeout(() => instance.fitView({ padding: .24 }), 30); }, []);
  const stopTrace = useCallback(() => { if (timer.current) { clearInterval(timer.current); timer.current = null; } }, []);
  useEffect(() => stopTrace, [stopTrace]);
  const chooseCase = (next: InvestigationCase) => { stopTrace(); setRunning(false); setActiveId(next.id); setCandidateId(next.candidates[0].id); setNodeId(null); setStage(traceSteps.length); setElapsed(30); window.setTimeout(() => flow?.fitView({ padding: .24, duration: 300 }), 80); };
  const runTrace = () => { if (running) return; stopTrace(); setRunning(true); setStage(0); setElapsed(0); timer.current = setInterval(() => { setElapsed((current) => { const next = current + 1; setStage(Math.min(traceSteps.length, Math.floor(next / 5))); if (next >= 30) { stopTrace(); setRunning(false); setStage(traceSteps.length); return 30; } return next; }); }, 1000); };
  const download = () => { const data = { generatedAt: new Date().toISOString(), simulated: true, case: activeCase.caseId, network: activeCase.network, asset: activeCase.asset, seed: activeCase.seed, candidate, transfers: activeCase.edges, note: activeCase.note }; const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })); const link = document.createElement("a"); link.href = url; link.download = `${activeCase.caseId.toLowerCase()}-evidence.json`; link.click(); URL.revokeObjectURL(url); };
  return <main className="app-shell">
    <header className="topbar"><div className="brand"><span className="brand-mark">▲</span><span>VASP<br />TRACE</span></div><div className="topbar-center"><span className="demo-badge"><i /> Demo · simulated data</span><span className="workspace-label">Investigation workspace</span></div><button className="guide-trigger" onClick={() => setGuide(true)}><Info size={15} /> How it works</button></header>
    <section className="workspace">
      <aside className="case-rail"><div className="rail-heading"><div><p className="eyebrow">Case queue</p><h2>Active reviews</h2></div><button aria-label="Search cases" className="icon-button"><Search size={17} /></button></div><div className="case-list">{cases.map((item) => <button key={item.id} className={`case-card ${item.id === activeId ? "selected" : ""}`} onClick={() => chooseCase(item)}><div><span>{item.caseId}</span><i className={`dot ${item.status === "Supported endpoint" ? "teal" : item.status === "Mixed outcome" ? "amber" : "slate"}`} /></div><strong>{item.name}</strong><small>{item.network} · {item.asset}</small></button>)}</div><div className="scope-card"><ShieldCheck size={17} /><div><strong>Prototype scope</strong><span>Local synthetic cases only</span></div></div></aside>
      <section className="analysis-area"><div className="case-header"><div><div className="crumb">Cases <ChevronRight size={13} /> {activeCase.caseId}</div><h1>{activeCase.name}</h1><p>{activeCase.description}</p></div><div className="action-row"><button className="secondary-button" onClick={() => flow?.fitView({ padding: .24, duration: 300 })}><Focus size={15} /> Fit path</button><button className="trace-button" onClick={runTrace} disabled={running}><Play size={15} fill="currentColor" /> {running ? "Tracing…" : "Run demo trace"}</button></div></div>
        <div className="context-strip"><div><span>CASE ANCHOR</span><strong>{activeCase.seed}</strong></div><div><span>NETWORK / ASSET</span><strong>{activeCase.network} · {activeCase.asset}</strong></div><div><span>ANALYSIS WINDOW</span><strong>{activeCase.window}</strong></div></div>
        <TraceConsole stage={stage} elapsed={elapsed} running={running} />
        <div className={`graph-shell ${running ? "is-tracing" : ""}`}><div className="graph-label"><i /> FUND-FLOW PATH · {running ? `Live trace · ${String(elapsed).padStart(2, "0")}s` : "Trace loaded"}</div><ReactFlow nodes={nodes} edges={edges} onInit={onInit} onNodeClick={(_, node) => setNodeId(node.id)} nodesDraggable={false} nodesConnectable={false} minZoom={.35} maxZoom={1.7} proOptions={{ hideAttribution: true }}><Background color="#d8d8d8" gap={24} size={1} /><Controls showInteractive={false} /></ReactFlow><div className="graph-key"><span><i className="key seed" />Case anchor</span><span><i className="key intermediary" />Intermediary</span><span><i className="key vasp" />Supported VASP</span><span><i className="key bridge" />Unresolved boundary</span></div></div>
        <div className="case-note"><Sparkles size={16} /><span>{activeCase.note}</span></div></section>
      <aside className="evidence-panel"><div className="panel-heading"><div><p className="eyebrow">Evidence review</p><h2>{selectedNode ? "Path detail" : "Candidate endpoints"}</h2></div><span className="count-pill">{activeCase.candidates.length}</span></div>{selectedNode ? <NodeDetail node={selectedNode} selected={path.includes(selectedNode.id)} close={() => setNodeId(null)} /> : <div className="candidate-list">{activeCase.candidates.map((item) => <CandidateCard key={item.id} item={item} selected={item.id === candidateId} choose={() => setCandidateId(item.id)} />)}</div>}<div className="report-card"><div><FileText size={17} /> Evidence report</div><p>Ready for review · {activeCase.edges.length} observed transfers</p><button onClick={() => window.print()}><FileText size={14} /> Print / save PDF</button><button onClick={download}><ArrowDownToLine size={14} /> Download JSON</button></div></aside>
    </section>{guide && <Guide close={() => setGuide(false)} />}</main>;
}

function CandidateCard({ item, selected, choose }: { item: Candidate; selected: boolean; choose: () => void }) { return <button className={`candidate-card ${selected ? "selected" : ""}`} onClick={choose}><div><div><strong>{item.name}</strong><span>{item.role}</span></div><Grade grade={item.grade} /></div><p>{item.summary}</p><footer><span>{item.hops === null ? "—" : `${item.hops} hops`}</span><code>{item.endpoint}</code></footer></button>; }
function TraceConsole({ stage, elapsed, running }: { stage: number; elapsed: number; running: boolean }) {
  const activeStep = Math.min(traceSteps.length - 1, stage);
  const command = running ? traceSteps[activeStep].command : "trace.ready --synthetic-fixtures";
  return <section className={`trace-console ${running ? "is-running" : ""}`} aria-label="Demo trace sequence">
    <header><div><span className="console-pulse" /> <strong>LIVE DEMO SEQUENCE</strong><small>SIMULATED SOURCE CHECKS</small></div><code>{running ? `00:${String(elapsed).padStart(2, "0")} / 00:30` : "READY"}</code></header>
    <div className="trace-progress">{traceSteps.map((item, index) => { const Icon = item.icon; const complete = stage > index || !running; const current = running && stage === index; return <div key={item.title} className={`${complete ? "complete" : ""} ${current ? "current" : ""}`}><span>{complete ? "✓" : <Icon size={13} />}</span><div><strong>{item.title}</strong><small>{item.detail}</small></div></div>; })}</div>
    <footer aria-live="polite"><span>▲</span><code>{command}</code><em>{running ? "PROCESSING" : "DEMO READY"}</em></footer>
  </section>;
}
function NodeDetail({ node, selected, close }: { node: TraceNode; selected: boolean; close: () => void }) { return <div className="node-detail"><button className="close-detail" onClick={close}><X size={15} /> Close</button><div className={`detail-node-icon ${roleClass[node.role]}`}><Box size={18} /></div><h3>{node.label}</h3><code>{node.address}</code><p>{node.detail}</p><div className="detail-grid"><span>ROLE<strong>{node.role}</strong></span><span>PATH<strong>{selected ? "Selected" : "Observed"}</strong></span></div></div>; }
function Guide({ close }: { close: () => void }) { return <div className="modal-backdrop" onMouseDown={close}><section className="guide-modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}><button className="modal-close" aria-label="Close guide" onClick={close}><X size={18} /></button><p className="eyebrow">What this prototype demonstrates</p><h2>A supported lead, with the reason visible.</h2><div className="guide-flow"><div><span>1</span><strong>Anchor</strong><p>Start from a reported transaction or address.</p></div><div><span>2</span><strong>Trace</strong><p>Follow time-consistent, observed transfers.</p></div><div><span>3</span><strong>Assess</strong><p>Show endpoint evidence and uncertainty.</p></div></div><div className="guide-callout"><Info size={18} /><p>A downstream VASP connection is an investigative lead. It does not identify the owner of the reported wallet or guarantee asset recovery.</p></div><button className="trace-button full" onClick={close}>Got it</button></section></div>; }
