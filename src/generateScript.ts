// Standalone script (not rendered by Remotion) that turns the tracer's
// captions/explanations into a human-readable narration script and a
// timestamped .srt subtitle file — the actual "script" the video follows.
//
// Run with: npx ts-node src/generateScript.ts
// Outputs:  script.md, script.srt  (in the project root)

import * as fs from "fs";
import { bubbleSortTracer } from "./tracers/bubbleSort";
import { defaultBubbleSortProps } from "./BubbleSortComposition";

const FPS = 30;
const INTRO_SECONDS = 2; // matches INTRO_FRAMES / FPS in BubbleSortComposition

const framesToTimestamp = (frames: number): string => {
    const totalMs = Math.round((frames / FPS) * 1000);
    const h = Math.floor(totalMs / 3600000);
    const m = Math.floor((totalMs % 3600000) / 60000);
    const s = Math.floor((totalMs % 60000) / 1000);
    const ms = totalMs % 1000;
    const pad = (n: number, len = 2) => String(n).padStart(len, "0");
    return `${pad(h)}:${pad(m)}:${pad(s)},${pad(ms, 3)}`;
};

const main = () => {
    const { data, speed } = defaultBubbleSortProps;
    const steps = bubbleSortTracer(data).map((s) => ({
        ...s,
        durationFrames: Math.round(s.durationFrames * speed),
    }));

    let frame = Math.round(INTRO_SECONDS * FPS);
    const srtLines: string[] = [];
    const mdLines: string[] = [
        `# Bubble Sort — Narration Script`,
        ``,
        `Input: [${data.join(", ")}]`,
        `Total steps: ${steps.length}`,
        ``,
        `---`,
        ``,
    ];

    steps.forEach((step, i) => {
        const start = frame;
        const end = frame + step.durationFrames;
        const line = step.explanation ? `${step.caption} — ${step.explanation}` : step.caption;

        srtLines.push(
            String(i + 1),
            `${framesToTimestamp(start)} --> ${framesToTimestamp(end)}`,
            line,
            ""
        );

        mdLines.push(
            `**[${(start / FPS).toFixed(1)}s]** Pass ${step.pass}/${step.totalPasses} — ${step.caption}`
        );
        if (step.explanation) mdLines.push(`> ${step.explanation}`);
        mdLines.push("");

        frame = end;
    });

    fs.writeFileSync("script.srt", srtLines.join("\n"));
    fs.writeFileSync("script.md", mdLines.join("\n"));
    console.log(`Wrote script.srt and script.md — ${steps.length} lines, ${(frame / FPS).toFixed(1)}s of narration.`);
};

main();