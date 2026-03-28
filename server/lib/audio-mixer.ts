import path from "path";
import { promises as fs } from "fs";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export type MixTrackInput = {
  id: string;
  path: string;
  startTimeSeconds: number | null;
  durationSeconds: number;
};

export type MixTracksOptions = {
  tracks: MixTrackInput[];
  meTrackPath: string;
  outputPath: string;
  sampleRate?: number;
  channels?: number;
  onProgress?: (info: { percent: number; timemark?: string }) => void;
};

export async function generateSilenceTrack(
  outputPath: string,
  durationSeconds: number,
  opts?: { sampleRate?: number; channels?: number }
): Promise<void> {
  const sampleRate = opts?.sampleRate || 44100;
  const channels = opts?.channels || 2;
  const safeDuration = Math.max(0.1, Number(durationSeconds) || 0);
  const layout = channels === 1 ? "mono" : "stereo";
  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  return new Promise<void>((resolve, reject) => {
    ffmpeg()
      .input(`anullsrc=cl=${layout}:r=${sampleRate}`)
      .inputFormat("lavfi")
      .duration(safeDuration)
      .audioFrequency(sampleRate)
      .audioChannels(channels)
      .audioCodec("pcm_s16le")
      .output(outputPath)
      .outputOptions("-y")
      .on("error", reject)
      .on("end", () => resolve())
      .run();
  });
}

export async function mixTracks(options: MixTracksOptions): Promise<void> {
  const sampleRate = options.sampleRate || 44100;
  const channels = options.channels || 2;
  const tracks = options.tracks || [];

  if (tracks.length === 0) {
    throw new Error("Nenhum take informado para mixar");
  }

  await fs.mkdir(path.dirname(options.outputPath), { recursive: true });

  const command = ffmpeg();
  command.input(options.meTrackPath);

  tracks.forEach((track) => {
    const offset = Math.max(0, Number(track.startTimeSeconds) || 0);
    if (offset > 0) {
      command.inputOptions([`-itsoffset ${offset.toFixed(3)}`]);
    }
    command.input(track.path);
  });

  const totalInputs = 1 + tracks.length;
  const inputLabels = Array.from({ length: totalInputs }, (_, index) => `[${index}:a]`);
  const mixFilter = {
    filter: "amix",
    options: { inputs: totalInputs, duration: "longest", normalize: 0 },
    inputs: inputLabels,
    outputs: "mixed_raw",
  } as const;
  const resampleFilter = {
    filter: "aresample",
    options: sampleRate,
    inputs: "mixed_raw",
    outputs: "mixed_final",
  } as const;

  command.complexFilter([mixFilter, resampleFilter], "mixed_final");
  command.outputOptions([
    "-map",
    "[mixed_final]",
    "-ac",
    String(channels),
    "-ar",
    String(sampleRate),
    "-c:a",
    "pcm_s16le",
    "-y",
  ]);
  command.output(options.outputPath);

  return new Promise<void>((resolve, reject) => {
    command
      .on("progress", (progress) => {
        if (options.onProgress) {
          options.onProgress({ percent: progress.percent ?? 0, timemark: progress.timemark });
        }
      })
      .on("error", reject)
      .on("end", () => resolve())
      .run();
  });
}
