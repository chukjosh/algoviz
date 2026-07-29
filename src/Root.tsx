import React from "react";
import { Composition } from "remotion";
import {
  BubbleSortComposition,
  calculateMetadata,
  defaultBubbleSortProps,
} from "./BubbleSortComposition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="BubbleSort"
        component={BubbleSortComposition}
        durationInFrames={300} // overridden by calculateMetadata at render time
        fps={30}
        width={1024}
        height={738}
        defaultProps={defaultBubbleSortProps}
        calculateMetadata={calculateMetadata}
      />
    </>
  );
};