// The single contract every algorithm tracer must produce.
// Remotion never runs the algorithm itself — it only plays back these steps.

export type Elem = {
  /** Stable identity that persists across swaps, so the renderer can
   *  animate a bar SLIDING to its new position instead of snapping. */
  id: number;
  value: number;
};

export type Step = {
  /** Current arrangement of elements (order = visual position) */
  array: Elem[];
  /** ids being actively compared/touched this step (highlighted) */
  active: number[];
  /** ids that were just swapped this step (used for the slide animation) */
  swapped: number[];
  /** ids already in their final, sorted position (locked/dimmed) */
  settled: number[];
  /** which line of the pseudocode panel to highlight, 0-indexed */
  line: number;
  /** short, top-level statement of what's happening right now */
  caption: string;
  /** the "why" — a second line explaining the reasoning, read at a glance */
  explanation?: string;
  /** how long (in frames, at the composition's fps) this step stays on screen.
   *  Explanatory/decision steps hold longer than simple transitions so the
   *  viewer has time to actually read them. */
  durationFrames: number;
  /** 1-indexed pass number, for the "Pass X of Y" banner */
  pass: number;
  totalPasses: number;
};

export type Tracer = (input: number[]) => Step[];

export const PSEUDOCODE = [
  "for i in range(n):",
  "  for j in range(0, n-i-1):",
  "    if arr[j] > arr[j+1]:",
  "      swap(arr[j], arr[j+1])",
] as const;