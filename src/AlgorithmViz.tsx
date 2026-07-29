import React, { useMemo } from "react";
import {
  AbsoluteFill,
  interpolate,
  Easing,
  useCurrentFrame,
  spring,
  useVideoConfig,
} from "remotion";
import { Step } from "./types";
import { PSEUDOCODE } from "./types";

type Props = {
  steps: Step[];
};

const STAGE_WIDTH = 904;
const STAGE_LEFT = 60;
const STAGE_BOTTOM = 150;
const STAGE_HEIGHT = 220; // kept well clear of the code panel above it
const CODE_TOP = 128;

// How long (in frames) the position-slide animation itself takes.
const SLIDE_FRAMES = 18;

// --- Code reveal phase (plays once, before any comparisons start) ---
const TOPIC_FADE_FRAMES = 24; // header fades in first
const LINE_TYPE_FRAMES = 22; // how long each line takes to type out
const LINE_GAP_FRAMES = 8; // pause between finishing one line and starting next
const HOLD_AFTER_REVEAL = 22; // beat once all code is visible, before bars appear
const REVEAL_FRAMES =
  TOPIC_FADE_FRAMES + PSEUDOCODE.length * (LINE_TYPE_FRAMES + LINE_GAP_FRAMES) + HOLD_AFTER_REVEAL;

// One-time staggered entrance for the bars: each bar starts growing a
// little after the previous one, left to right.
const BAR_STAGGER_FRAMES = 3;
const BAR_ENTRANCE_FRAMES = 14;

const CodePanel: React.FC<{ line: number; revealFrame?: number }> = ({
  line,
  revealFrame,
}) => (
  <div
    style={{
      position: "absolute",
      top: CODE_TOP,
      left: STAGE_LEFT,
      fontFamily: "'JetBrains Mono', Menlo, monospace",
      fontSize: 17,
    }}
  >
    {PSEUDOCODE.map((full, i) => {
      const isCurrent = i === line;
      let text = full;

      // During the reveal phase, type each line out character by character
      // in sequence; lines not yet reached stay blank.
      if (revealFrame !== undefined) {
        const lineStart = TOPIC_FADE_FRAMES + i * (LINE_TYPE_FRAMES + LINE_GAP_FRAMES);
        const charsShown = Math.round(
          interpolate(revealFrame, [lineStart, lineStart + LINE_TYPE_FRAMES], [0, full.length], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        );
        text = full.slice(0, charsShown);
        const isTypingThisLine = charsShown > 0 && charsShown < full.length;
        const cursor = isTypingThisLine && Math.floor(revealFrame / 8) % 2 === 0 ? "▍" : "";
        text = text + cursor;
      }

      return (
        <div
          key={i}
          style={{
            padding: "3px 14px",
            borderRadius: 8,
            marginBottom: 2,
            minHeight: "1.3em",
            color: isCurrent ? "#0a0c12" : "#9ca3af",
            backgroundColor: isCurrent ? "#5eead4" : "transparent",
            fontWeight: isCurrent ? 700 : 400,
            boxShadow: isCurrent ? "0 0 24px rgba(94,234,212,0.45)" : "none",
            whiteSpace: "pre",
          }}
        >
          {text}
        </div>
      );
    })}
  </div>
);

export const AlgorithmViz: React.FC<Props> = ({ steps }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isRevealPhase = frame < REVEAL_FRAMES;
  const mainFrame = Math.max(0, frame - REVEAL_FRAMES);

  const starts = useMemo(() => {
    const out: number[] = [];
    let acc = 0;
    for (const s of steps) {
      out.push(acc);
      acc += s.durationFrames;
    }
    return out;
  }, [steps]);

  let stepIndex = starts.length - 1;
  for (let i = 0; i < starts.length; i++) {
    if (mainFrame < starts[i]) {
      stepIndex = i - 1;
      break;
    }
  }
  stepIndex = Math.max(0, Math.min(stepIndex, steps.length - 1));

  const step = steps[stepIndex];
  const prevStep = steps[Math.max(stepIndex - 1, 0)];
  const frameWithinStep = mainFrame - starts[stepIndex];

  const progress = interpolate(
    frameWithinStep,
    [0, Math.min(SLIDE_FRAMES, step.durationFrames)],
    [0, 1],
    { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  const maxVal = Math.max(...step.array.map((e) => e.value));
  const n = step.array.length;
  const colWidth = STAGE_WIDTH / n;
  const barWidth = colWidth - 10;

  const posInStep = (s: Step, id: number) => s.array.findIndex((e) => e.id === id);

  const pulse = spring({
    frame: frameWithinStep,
    fps,
    config: { damping: 10, stiffness: 140 },
  });

  const overallProgress = interpolate(
    mainFrame,
    [0, starts[starts.length - 1] + steps[steps.length - 1].durationFrames],
    [0, 1],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );

  const textOpacity = interpolate(frameWithinStep, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Header fades in first, during the reveal phase; stays fully visible
  // for the rest of the video.
  const headerOpacity = interpolate(frame, [0, TOPIC_FADE_FRAMES], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Stage/pass/progress fade in together right as the reveal phase ends,
  // so the transition into "now let's trace through it" feels intentional.
  const postRevealOpacity = interpolate(
    frame,
    [REVEAL_FRAMES - 14, REVEAL_FRAMES + 4],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(circle at 50% 0%, #ffffff 0%, #f3f4f6 70%)",
      }}
    >
      {/* Header — appears once, first, then stays for the whole video */}
      <div
        style={{
          position: "absolute",
          top: 36,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: "'SF Pro Display', system-ui, sans-serif",
          fontSize: 30,
          fontWeight: 700,
          letterSpacing: 0.5,
          color: "#111827",
          opacity: headerOpacity,
        }}
      >
        Bubble Sort
      </div>

      {isRevealPhase ? (
        // --- Reveal phase: header already shown above, code types in ---
        <CodePanel line={-1} revealFrame={frame} />
      ) : (
        <>
          {/* Pass indicator */}
          <div
            style={{
              position: "absolute",
              top: 74,
              left: 0,
              right: 0,
              textAlign: "center",
              fontFamily: "'JetBrains Mono', Menlo, monospace",
              fontSize: 16,
              color: "#0d9488",
              fontWeight: 700,
              letterSpacing: 1,
              opacity: postRevealOpacity,
            }}
          >
            PASS {step.pass} / {step.totalPasses}
          </div>

          {/* Progress bar */}
          <div
            style={{
              position: "absolute",
              top: 104,
              left: STAGE_LEFT,
              width: STAGE_WIDTH,
              height: 5,
              borderRadius: 3,
              backgroundColor: "#e5e7eb",
              overflow: "hidden",
              opacity: postRevealOpacity,
            }}
          >
            <div
              style={{
                width: `${overallProgress * 100}%`,
                height: "100%",
                background: "linear-gradient(90deg, #38bdf8, #34d399)",
                borderRadius: 3,
              }}
            />
          </div>

          <CodePanel line={step.line} />

          {/* Bars stage */}
          <div
            style={{
              position: "absolute",
              bottom: STAGE_BOTTOM,
              left: STAGE_LEFT,
              width: STAGE_WIDTH,
              height: STAGE_HEIGHT,
              opacity: postRevealOpacity,
            }}
          >
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                width: "100%",
                height: 2,
                backgroundColor: "#d1d5db",
              }}
            />

            {step.array.map((elem) => {
              const isActive = step.active.includes(elem.id);
              const isSwapped = step.swapped.includes(elem.id);
              const isSettled = step.settled.includes(elem.id);

              const currIdx = posInStep(step, elem.id);
              const prevIdx = posInStep(prevStep, elem.id);
              const fromIdx = prevIdx === -1 ? currIdx : prevIdx;

              // One-time staggered grow-in when the bars first appear, keyed
              // off the absolute (never-resetting) frame so it plays exactly
              // once at the start and stays fully grown afterward.
              const entranceStart = REVEAL_FRAMES + currIdx * BAR_STAGGER_FRAMES;
              const barEntrance = interpolate(
                frame,
                [entranceStart, entranceStart + BAR_ENTRANCE_FRAMES],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
              );

              const x = interpolate(progress, [0, 1], [fromIdx * colWidth, currIdx * colWidth]);

              const height = interpolate(elem.value, [0, maxVal], [24, STAGE_HEIGHT - 20]);
              const lift = isSwapped ? interpolate(progress, [0, 0.5, 1], [0, -18, 0]) : 0;
              const scale = isActive ? 1 + 0.05 * pulse : 1;

              const color = isSettled ? "#34d399" : isActive ? "#fb923c" : "#3b82f6";
              const glow = isActive
                ? `0 0 ${18 + pulse * 14}px rgba(251,146,60,${0.35 + pulse * 0.25})`
                : isSettled
                  ? "0 0 14px rgba(52,211,153,0.25)"
                  : "none";

              return (
                <div
                  key={elem.id}
                  style={{
                    position: "absolute",
                    left: x + 5,
                    bottom: 0,
                    width: barWidth,
                    height,
                    opacity: barEntrance,
                    transform: `translateY(${lift}px) scale(${scale}) scaleY(${barEntrance})`,
                    transformOrigin: "bottom center",
                    backgroundColor: color,
                    boxShadow: glow,
                    borderRadius: "8px 8px 3px 3px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    paddingTop: 8,
                    color: "#0a0c12",
                    fontFamily: "'JetBrains Mono', Menlo, monospace",
                    fontSize: 18,
                    fontWeight: 700,
                  }}
                >
                  {elem.value}
                </div>
              );
            })}
          </div>

          {/* Caption + explanation — the "narration" of the video */}
          <div
            style={{
              position: "absolute",
              bottom: 44,
              width: "100%",
              textAlign: "center",
              opacity: Math.min(textOpacity, postRevealOpacity),
            }}
          >
            <div
              style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: 27,
                fontWeight: 700,
                color: "#111827",
              }}
            >
              {step.caption}
            </div>
            {step.explanation && (
              <div
                style={{
                  marginTop: 6,
                  fontFamily: "system-ui, sans-serif",
                  fontSize: 19,
                  fontWeight: 400,
                  color: "#6b7280",
                }}
              >
                {step.explanation}
              </div>
            )}
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};

// Exported so the composition can size its Sequence to include this phase.
export { REVEAL_FRAMES };