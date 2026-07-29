# AlgoViz - Process Guide

## What this is
A data-driven Remotion project that animates algorithms by separating
**algorithm logic** (tracers) from **rendering** (AlgorithmViz). Adding a new
algorithm never touches the video component - you just write a new tracer.

## Setup

```bash
pnpm install
pnpm start        # opens Remotion Studio in the browser, live preview
```

To render an actual MP4:

```bash
npx remotion render src/index.ts BubbleSort out/bubble-sort.mp4
```

To render with a different dataset via CLI:

```bash
npx remotion render src/index.ts BubbleSort out/custom.mp4 \
  --props='{"data":[5,2,9,1,5,6],"framesPerStep":20}'
```

## Architecture

```
algoviz/
├── .gitignore                    
├── package.json                  
├── tsconfig.json                 
├── README.md                     
├── script.md                     
├── script.srt                    
├── public/
│   └── logo.png                  
└── src/
    ├── index.ts                  
    ├── Root.tsx                  
    ├── types.ts                  
    ├── AlgorithmViz.tsx          
    ├── TitleCard.tsx             
    ├── IntroLogo.tsx             
    ├── BubbleSortComposition.tsx 
    ├── generateScript.ts         
    └── tracers/
        └── bubbleSort.ts         
```

## The core pattern (repeat this to add a new algorithm)

1. **Write a tracer** in `src/tracers/yourAlgo.ts` — a pure function
   `(input) => Step[]`. Every meaningful moment (a comparison, a swap, a
   node visit) becomes one `Step` with:
   - `array` — full state snapshot after this step
   - `active` — indices to highlight this step
   - `settled` — indices considered "done"
   - `line` — which pseudocode line to spotlight
   - `caption` — one sentence describing what happened

2. **Never animate inside the tracer.** It just produces data. All motion
   (`interpolate`, `spring`, frame math) lives in `AlgorithmViz.tsx`, driven
   by `useCurrentFrame()`.

3. **Frame math**: `stepIndex = Math.floor(frame / framesPerStep)`. This is
   why duration must be computed, not hardcoded — see `calculateMetadata`
   in `BubbleSortComposition.tsx`, which multiplies `steps.length` by
   `framesPerStep` so any input array length "just works."

4. **New composition per algorithm** (or generalize later): copy
   `BubbleSortComposition.tsx` → `QuickSortComposition.tsx`, swap in the new
   tracer, register it in `Root.tsx` with a new `id`.

## Natural next steps
- Add a tracer registry so one generic `<Composition>` can render any
  algorithm by name via `defaultProps={{ algo: "quickSort" }}`.
- Swap the bar-chart visual for a graph-node visual (reuse the same `Step`
  shape with `array` repurposed as adjacency/weights) to animate Dijkstra
  or A*.
- Point a tracer at an actual gradient descent loop and animate loss-surface
  descent instead of sorting — same architecture, ML content instead.
- Add `@remotion/zod-types` to validate `defaultProps` against a Zod schema
  matching `types.ts`, catching bad CLI `--props` at render time.
