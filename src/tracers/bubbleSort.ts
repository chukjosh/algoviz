import { Step, Tracer, Elem } from "../types";

// Timing budget, in frames at 30fps. Each kind of moment gets a duration
// that matches how much a viewer needs to actually read it — a compare
// with no swap needs less time than a compare that requires an explained
// decision, and a swap gets a beat to let the slide animation land.
const HOLD = {
  compare: 42, // ~1.4s — "here's what we're looking at"
  decisionNoSwap: 60, // ~2.0s — reasoning takes longer to read
  decisionSwap: 48, // ~1.6s — shorter reasoning, swap follows immediately
  swapAnim: 40, // ~1.3s — let the slide/lift animation actually finish
  passComplete: 55, // ~1.8s — beat before starting the next pass
  final: 90, // ~3.0s — hold on "sorted"
};

export const bubbleSortTracer: Tracer = (input) => {
  let arr: Elem[] = input.map((value, id) => ({ id, value }));

  const steps: Step[] = [];
  const n = arr.length;
  const settled: number[] = [];
  const totalPasses = n - 1;

  const push = (partial: Omit<Step, "array" | "settled" | "pass" | "totalPasses">, pass: number) =>
    steps.push({
      array: arr.map((e) => ({ ...e })),
      settled: [...settled],
      pass,
      totalPasses,
      ...partial,
    });

  for (let i = 0; i < n - 1; i++) {
    const pass = i + 1;

    for (let j = 0; j < n - i - 1; j++) {
      const a = arr[j];
      const b = arr[j + 1];

      // 1. Point at the two elements being compared.
      push(
        {
          active: [a.id, b.id],
          swapped: [],
          line: 2,
          caption: `Comparing arr[${j}] and arr[${j + 1}]`,
          explanation: `${a.value} vs ${b.value}`,
          durationFrames: HOLD.compare,
        },
        pass
      );

      const outOfOrder = a.value > b.value;

      // 2. State the decision AND why, before anything moves.
      push(
        {
          active: [a.id, b.id],
          swapped: [],
          line: outOfOrder ? 2 : 1,
          caption: outOfOrder
            ? `${a.value} > ${b.value} → out of order`
            : `${a.value} < ${b.value} → already in order`,
          explanation: outOfOrder
            ? "They need to swap places"
            : "No swap needed, move on",
          durationFrames: outOfOrder ? HOLD.decisionSwap : HOLD.decisionNoSwap,
        },
        pass
      );

      if (outOfOrder) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        // 3. The actual swap, given room for the slide animation to finish.
        push(
          {
            active: [a.id, b.id],
            swapped: [a.id, b.id],
            line: 3,
            caption: `Swapped → ${b.value}, ${a.value}`,
            durationFrames: HOLD.swapAnim,
          },
          pass
        );
      }
    }

    settled.unshift(arr[n - i - 1].id);

    // Beat between passes so the viewer registers one element "locked in".
    push(
      {
        active: [],
        swapped: [],
        line: 0,
        caption: `Pass ${pass} complete`,
        explanation: `arr[${n - i - 1}] = ${arr[n - i - 1].value} is now in its final position`,
        durationFrames: HOLD.passComplete,
      },
      pass
    );
  }

  steps.push({
    array: arr.map((e) => ({ ...e })),
    active: [],
    swapped: [],
    settled: arr.map((e) => e.id),
    line: 0,
    caption: "Sorted!",
    durationFrames: HOLD.final,
    pass: totalPasses,
    totalPasses,
  });

  return steps;
};