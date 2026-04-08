import { invoke } from "@tauri-apps/api/core";

interface MediaInfo {
  title: string;
  artist: string;
  status: "playing" | "paused" | "changing" | "none";
  position_seconds: number;
  duration_seconds: number;
  last_updated_at: number;
}

type MediaControlCommand = "play" | "pause" | "forward" | "rewind";

// DOM elements
const statistics = document.getElementById("statistics") as HTMLDivElement;
const progressBar = document.getElementById("progress-bar") as HTMLDivElement;
const progressBarTime = document.getElementById(
  "progress-bar-time",
) as HTMLParagraphElement;
const progressBarDuration = document.getElementById(
  "progress-bar-duration",
) as HTMLParagraphElement;
const trackTitle = document.getElementById("track-title") as HTMLSpanElement;
const trackArtist = document.getElementById("track-artist") as HTMLSpanElement;
const mediaWidget = document.getElementById("media-widget") as HTMLDivElement;
const rewind = document.getElementById("rewind") as HTMLElement;
const play = document.getElementById("play") as HTMLElement;
const pause = document.getElementById("pause") as HTMLElement;
const forward = document.getElementById("forward") as HTMLElement;

window.addEventListener("DOMContentLoaded", () => {
  rewind?.addEventListener("click", async () => {
    await controlMedia("rewind");
  });
  play?.addEventListener("click", async () => {
    await controlMedia("play");
  });
  pause?.addEventListener("click", async () => {
    await controlMedia("pause");
  });
  forward?.addEventListener("click", async () => {
    await controlMedia("forward");
  });
});

// Local variables - Store
let localAnchorTimeMs: number | null = null;
let localAnchorPositionSeconds = 0;
let currentPosition = 0;
let previousDuration = 0;

export async function updateMediaProgress() {
  const info = await invoke<MediaInfo | null>("get_media_info");
  if (!info || info.status === "none") {
    statistics.classList.remove("hidden");
    mediaWidget.classList.add("hidden");
    currentPosition = 0;
    return;
  }
  statistics.classList.add("hidden");
  mediaWidget.classList.remove("hidden");
  localAnchorTimeMs = info.last_updated_at;
  localAnchorPositionSeconds = info.position_seconds;
  trackTitle.textContent = info.title;
  trackArtist.textContent = info.artist;
  if (previousDuration !== info.duration_seconds) {
    previousDuration = info.duration_seconds;
    currentPosition = 0;
  }

  const anchorMs = localAnchorTimeMs ?? Date.now(); //last_updated from Rust or Date,now()

  if (currentPosition > info.duration_seconds) {
    progressBarTime.textContent = "";
    progressBarDuration.textContent = "LIVE";
  } else {
    progressBarDuration.textContent = formatClock(info.duration_seconds);
    if (info.status !== "paused") {
      const elapsedSeconds = (Date.now() - anchorMs) / 1000; // calculate the seconds elapsed from the last_updated to now
      currentPosition =
        localAnchorPositionSeconds + Math.max(0, elapsedSeconds); // calculate the current position based on, the last anchor position plus the seconds elapsed
      const percent = (currentPosition / info.duration_seconds) * 100;
      progressBar.style.width = `${Math.min(percent, 100)}%`;
      progressBarTime.textContent = formatClock(currentPosition);
      pause.classList.remove("hidden");
      play.classList.add("hidden");
    } else {
      pause.classList.add("hidden");
      play.classList.remove("hidden");
    }
  }
}

async function controlMedia(command: MediaControlCommand) {
  if (command === "play") {
    pause.classList.remove("hidden");
    play.classList.add("hidden");
  } else if (command === "pause") {
    pause.classList.add("hidden");
    play.classList.remove("hidden");
  }
  await invoke("media_controls", { command: command });
}

function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}
