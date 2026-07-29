import React from "react";
import {
    AbsoluteFill,
    Img,
    staticFile,
    interpolate,
    useCurrentFrame,
    spring,
    useVideoConfig,
} from "remotion";

type Props = {
    /** Total frames this component is on screen for (its containing
     *  Sequence's durationInFrames) — needed so the fade-out timing lines
     *  up with the actual end of the intro instead of guessing. */
    durationInFrames: number;
};

// Channel intro card — logo scales/fades in, holds, then fades back out
// before handing off to the next screen (instead of a hard cut).
export const IntroLogo: React.FC<Props> = ({ durationInFrames }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const entrance = spring({ frame, fps, config: { damping: 15, stiffness: 110 } });
    const fadeIn = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
    const fadeOut = interpolate(
        frame,
        [durationInFrames - 18, durationInFrames],
        [1, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );
    const opacity = Math.min(fadeIn, fadeOut);
    const scale = interpolate(entrance, [0, 1], [0.8, 1]);

    // Slow ambient glow pulse behind the logo so it doesn't sit static.
    const glow = interpolate(Math.sin(frame / 12), [-1, 1], [0.08, 0.2]);

    return (
        <AbsoluteFill
            style={{
                background: "radial-gradient(circle at 50% 50%, #ffffff 0%, #f3f4f6 75%)",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <div
                style={{
                    opacity,
                    transform: `scale(${scale})`,
                    filter: `drop-shadow(0 0 ${30 + glow * 50}px rgba(13,148,136,${glow}))`,
                }}
            >
                <Img src={staticFile("RemationTube - 1024 × 738px.png")} style={{ width: 1024, height: 738 }} />
            </div>
        </AbsoluteFill>
    );
};