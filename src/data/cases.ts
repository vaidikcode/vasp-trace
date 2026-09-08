export type EvidenceGrade = "Strong" | "Moderate" | "Unresolved";
export type TraceNode = { id: string; label: string; role: "seed" | "intermediary" | "vasp" | "bridge" | "unknown"; address: string; detail: string; x: number; y: number };
export type TraceEdge = { id: string; source: string; target: string; amount: string; tx: string; active?: boolean };
export type Candidate = { id: string; name: string; role: string; grade: EvidenceGrade; hops: number | null; endpoint: string; summary: string; path: string[] };
export type InvestigationCase = { id: string; caseId: string; name: string; status: "Supported endpoint" | "Mixed outcome" | "Insufficient evidence"; description: string; seed: string; network: string; asset: string; window: string; nodes: TraceNode[]; edges: TraceEdge[]; candidates: Candidate[]; note: string };

export const cases: InvestigationCase[] = [
  { id: "case-001", caseId: "VC-24-0081", name: "Direct cash-out path", status: "Supported endpoint", description: "A two-hop transfer sequence reaches a supported custodial deposit endpoint.", seed: "0x3bA…91E4", network: "Ethereum", asset: "USDC", window: "14 Feb 2026 · 09:20–11:05 IST",
    nodes: [
      { id: "seed", label: "Reported wallet", role: "seed", address: "0x3bA…91E4", detail: "Case anchor · reported incident receipt", x: 40, y: 210 },
      { id: "relay", label: "Intermediate A", role: "intermediary", address: "0x7F2…C2D1", detail: "Single-hop relay · no service attribution", x: 310, y: 210 },
      { id: "deposit", label: "Aster Exchange", role: "vasp", address: "0xAc4…E91B", detail: "Supported deposit endpoint · Aster Exchange", x: 590, y: 210 },
    ], edges: [
      { id: "e1", source: "seed", target: "relay", amount: "10,000 USDC", tx: "0x9c7…2af1", active: true }, { id: "e2", source: "relay", target: "deposit", amount: "9,980 USDC", tx: "0x0d4…8b21", active: true },
    ], candidates: [
      { id: "aster", name: "Aster Exchange", role: "Deposit endpoint", grade: "Strong", hops: 2, endpoint: "0xAc4…E91B", summary: "Role-specific label and dated source record support a deposit endpoint at the terminal address.", path: ["seed", "relay", "deposit"] },
    ], note: "The path supports contacting Aster Exchange. It does not identify who controls the reported wallet or confirm asset availability." },
  { id: "case-002", caseId: "VC-24-0116", name: "Split path at bridge", status: "Mixed outcome", description: "One branch reaches a supported service endpoint; the other stops at an unresolved bridge boundary.", seed: "TQf…3Jk8", network: "TRON", asset: "USDT", window: "18 Feb 2026 · 15:02–16:12 IST",
    nodes: [
      { id: "seed", label: "Reported wallet", role: "seed", address: "TQf…3Jk8", detail: "Case anchor · victim-reported address", x: 40, y: 240 },
      { id: "split", label: "Distribution wallet", role: "intermediary", address: "TE9…Lk20", detail: "Receives reported asset, then distributes value", x: 270, y: 240 },
      { id: "deposit", label: "Northstar VASP", role: "vasp", address: "TY8…Qw71", detail: "Supported deposit endpoint · Northstar VASP", x: 570, y: 110 },
      { id: "bridge", label: "Bridge boundary", role: "bridge", address: "TXb…kP14", detail: "Unsupported cross-chain continuation", x: 570, y: 380 },
    ], edges: [
      { id: "e1", source: "seed", target: "split", amount: "12,500 USDT", tx: "5b6…e8c", active: true }, { id: "e2", source: "split", target: "deposit", amount: "7,500 USDT", tx: "f1d…11b", active: true }, { id: "e3", source: "split", target: "bridge", amount: "4,980 USDT", tx: "b77…ef4" },
    ], candidates: [
      { id: "northstar", name: "Northstar VASP", role: "Deposit endpoint", grade: "Strong", hops: 2, endpoint: "TY8…Qw71", summary: "A reviewed endpoint record supports the Northstar deposit role on this chain.", path: ["seed", "split", "deposit"] },
      { id: "bridge", name: "Cross-chain boundary", role: "Unresolved branch", grade: "Unresolved", hops: 2, endpoint: "TXb…kP14", summary: "The observed transfer reaches a bridge contract. No destination-side linkage is included in this demo.", path: ["seed", "split", "bridge"] },
    ], note: "The Northstar branch is actionable. The bridge branch remains explicitly unresolved; the prototype does not infer a destination from timing or amount." },
  { id: "case-003", caseId: "VC-24-0134", name: "Insufficient attribution", status: "Insufficient evidence", description: "Observed transfers exist, but no endpoint meets the evidence threshold within the defined scope.", seed: "bc1q…4mv7", network: "Bitcoin", asset: "BTC", window: "21 Feb 2026 · 08:10–20:00 IST",
    nodes: [
      { id: "seed", label: "Reported wallet", role: "seed", address: "bc1q…4mv7", detail: "Case anchor · transaction reference supplied", x: 40, y: 210 }, { id: "hop1", label: "Observed output", role: "intermediary", address: "bc1q…xx93", detail: "Unlabeled transaction output", x: 300, y: 210 }, { id: "unknown", label: "Unknown endpoint", role: "unknown", address: "bc1q…66zq", detail: "No supported provider attribution in local fixture", x: 570, y: 210 },
    ], edges: [
      { id: "e1", source: "seed", target: "hop1", amount: "0.142 BTC", tx: "6ca…a3f", active: true }, { id: "e2", source: "hop1", target: "unknown", amount: "0.139 BTC", tx: "c81…002" },
    ], candidates: [
      { id: "unresolved", name: "No supported provider found", role: "Incomplete attribution", grade: "Unresolved", hops: null, endpoint: "bc1q…66zq", summary: "The trace is preserved, but the local evidence fixture contains no qualifying service endpoint.", path: ["seed", "hop1", "unknown"] },
    ], note: "A no-result is a valid investigative output. This case should be escalated for additional intelligence or monitored for later activity." },
];
