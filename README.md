# VASPTrace

VASPTrace is a frontend-only investigation prototype for Smart India Hackathon problem statement 26182. It demonstrates a focused analyst workflow:

`reported transaction → observed fund-flow path → evidence-supported VASP lead → reviewable report`

## Run locally

```bash
bun install
bun dev
```

Open [http://localhost:3000](http://localhost:3000). For a production check:

```bash
bun run lint
bunx tsc --noEmit
bun run build
```

## What the demo shows

- A two-hop path reaching a supported exchange deposit endpoint.
- A split path with one supported endpoint and one unresolved bridge boundary.
- A no-result case where the interface retains the trace without inventing a provider.
- Case switching, graph pan/zoom, endpoint evidence review, JSON evidence download and print-friendly report output.

The **Run demo trace** control only replays a visual workflow. The prototype does not make network calls, trace real wallets, collect personal data, contact providers, integrate with SAHYOG, or freeze assets.

## Data and evidence model

All addresses, services, transaction hashes, amounts and evidence assertions are synthetic fixtures in `src/data/cases.ts`. “Strong” means the local demo fixture contains role-specific supporting information; it is not a real-world confidence score or legal conclusion.

A downstream VASP endpoint is an investigative lead. It does not prove the owner of the reported wallet, identify a customer, establish an offence, or guarantee asset recovery.

## Future integration points

The UI is deliberately separated from its fixtures so a future version can add chain adapters for indexed transfer history, licensed attribution providers with dated source records, bounded graph traversal, case authentication and governed evidence storage, and authorized agency-request integration.

## Stack

Next.js App Router, TypeScript, Bun, Tailwind CSS, React Flow and Lucide icons.
