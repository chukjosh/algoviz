import React from "react";
import { CalculateMetadataFunction, Sequence, AbsoluteFill, staticFile } from "remotion";
import { AlgorithmViz, REVEAL_FRAMES } from "./AlgorithmViz";
import { TitleCard } from "./TitleCard";
import { IntroLogo } from "./IntroLogo";
import { bubbleSortTracer } from "./tracers/bubbleSort";
import { Audio } from "@remotion/media";

export type BubbleSortProps = {
  data: number[];
  /** Multiplies every step's built-in hold time. 1 = as authored,
   *  1.5 = 50% slower/more readable, 0.75 = faster/snappier. */
  speed: number;
};

export const defaultBubbleSortProps: BubbleSortProps = {
  data: [8, 3, 9, 1, 6, 4, 2, 7, 5],
  speed: 1,
};

const INTRO_FRAMES = 60; // channel logo
const TOPIC_FRAMES = 70; // "How the Bubble Sort algorithm works" title card
const OUTRO_FRAMES = 60;

const scaledSteps = (data: number[], speed: number) =>
  bubbleSortTracer(data).map((s) => ({
    ...s,
    durationFrames: Math.round(s.durationFrames * speed),
  }));

const totalStepFrames = (data: number[], speed: number) =>
  scaledSteps(data, speed).reduce((sum, s) => sum + s.durationFrames, 0);

// Duration = channel intro + topic card + (code typing reveal + every
// step's own hold time) + outro. Nothing here is a guessed fixed number —
// it's the sum of what's actually on screen.
export const calculateMetadata: CalculateMetadataFunction<BubbleSortProps> = ({
  props,
}) => ({
  durationInFrames:
    INTRO_FRAMES +
    TOPIC_FRAMES +
    REVEAL_FRAMES +
    totalStepFrames(props.data, props.speed) +
    OUTRO_FRAMES,
});

export const BubbleSortComposition: React.FC<BubbleSortProps> = ({
  data,
  speed,
}) => {
  const steps = scaledSteps(data, speed);
  const stepFrames = steps.reduce((sum, s) => sum + s.durationFrames, 0);
  const mainFrames = REVEAL_FRAMES + stepFrames;

  return (
    <AbsoluteFill style={{ backgroundColor: "#ffffff" }}>
      <Sequence durationInFrames={INTRO_FRAMES}>
        <IntroLogo durationInFrames={INTRO_FRAMES} />
      </Sequence>
      <Sequence from={INTRO_FRAMES} durationInFrames={TOPIC_FRAMES}>
        <TitleCard
          title="How Bubble Sort Works"
          subtitle="A step-by-step visual walkthrough"
        />
      </Sequence>
      <Sequence from={INTRO_FRAMES + TOPIC_FRAMES} durationInFrames={mainFrames}>
        <AlgorithmViz steps={steps} />
      </Sequence>
      <Sequence
        from={INTRO_FRAMES + TOPIC_FRAMES + mainFrames}
        durationInFrames={OUTRO_FRAMES}
      >
        <TitleCard
          title="Thanks for Watching!"
          subtitle=""
        // subtitle={`${data.length} elements · ${steps.length} steps`}
        />
      </Sequence>
      <Audio
        src={staticFile("Beach House - Space Song (Official Instrumental).m4a")}
        durationInFrames={9640.23}
        volume={0.05}
        loop
      />
    </AbsoluteFill>
  );
};