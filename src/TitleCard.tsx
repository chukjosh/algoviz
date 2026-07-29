import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig } from "remotion";

type Props = {
    title: string;
    subtitle: string;
};

// A short, reusable intro/outro card. Fades and scales in with a spring,
// so it never feels like a static PowerPoint slide dropped into the video.
export const TitleCard: React.FC<Props> = ({ title, subtitle }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const entrance = spring({ frame, fps, config: { damping: 14, stiffness: 120 } });
    const opacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
    const scale = interpolate(entrance, [0, 1], [0.85, 1]);

    return (
        <AbsoluteFill
            style={{
                background: "radial-gradient(circle at 50% 40%, #ffffff 0%, #f3f4f6 75%)",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <div style={{ opacity, transform: `scale(${scale})`, textAlign: "center" }}>
                <div
                    style={{
                        fontFamily: "'SF Pro Display', system-ui, sans-serif",
                        fontSize: 56,
                        fontWeight: 800,
                        color: "#111827",
                        letterSpacing: 0.5,
                    }}
                >
                    {title}
                </div>
                <div
                    style={{
                        marginTop: 16,
                        fontFamily: "'JetBrains Mono', Menlo, monospace",
                        fontSize: 24,
                        color: "#0d9488",
                    }}
                >
                    {subtitle}
                </div>
            </div>
        </AbsoluteFill>
    );
};