import { getCurrentWindow } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/core";
import { updateMediaProgress } from "./media";

//Tauri window management
const appWindow = getCurrentWindow();

document
  .getElementById("titlebar-minimize")
  ?.addEventListener("click", () => appWindow.minimize());
document
  .getElementById("titlebar-close")
  ?.addEventListener("click", () => appWindow.close());

document.getElementById("titlebar")?.addEventListener("mousedown", (e) => {
  if (e.buttons === 1) {
    // Primary (left) button
    e.detail === 2
      ? appWindow.toggleMaximize() // Maximize on double click
      : appWindow.startDragging(); // Else start dragging
  }
});

// DOM elements
const startButton = document.getElementById("btn-start");
const resumeButton = document.getElementById("btn-resume");
const timeDisplay = document.getElementById("time-left");
const pomodoroCycle = document.getElementById(
  "pomodoro-cycle",
) as HTMLParagraphElement;
const nextBreak = document.getElementById("next-break") as HTMLParagraphElement;

//Config Variables
let pomodoroTime = 25 * 60;
let shortBreakTime = 5 * 60;
let longBreakTime = 15 * 60;

// Local variables - Store
let timerInterval: number;
let isPomodoro = true;
let timeLeft = 0;
let pomodoroCount = 0;

window.addEventListener("DOMContentLoaded", () => {
  updateTimeLeft();
  startButton?.addEventListener("click", startTimer);
  resumeButton?.addEventListener("click", resumeTimer);
});

export function tooggleButton(button: HTMLElement | null) {
  if (!button) return;
  if (button.classList.contains("hidden")) {
    button.classList.remove("hidden");
  } else {
    button.classList.add("hidden");
  }
}

function updateTimeLeft() {
  if (isPomodoro) {
    timeLeft = pomodoroTime;
  } else {
    isPomodoro = false;
    if (pomodoroCount > 0 && pomodoroCount % 4 === 0) {
      timeLeft = longBreakTime;
    } else {
      timeLeft = shortBreakTime;
    }
  }
  timeDisplay && (timeDisplay.innerText = formatTime(timeLeft));
}

function updateTimer() {
  if (timeLeft > 0) {
    timeLeft--;
  } else {
    resetTimer();
  }
  timeDisplay && (timeDisplay.innerText = formatTime(timeLeft));
}

function startTimer() {
  tooggleButton(startButton);
  tooggleButton(resumeButton);
  timerInterval = setInterval(updateTimer, 1000);
}

function resumeTimer() {
  clearInterval(timerInterval);
  tooggleButton(startButton);
  tooggleButton(resumeButton);
}

function resetTimer() {
  invoke("play_finished_normal");
  clearInterval(timerInterval);
  tooggleButton(startButton);
  tooggleButton(resumeButton);
  if (isPomodoro) {
    pomodoroCount++;
    isPomodoro = false;
  } else {
    isPomodoro = true;
  }
  pomodoroCycle.innerText = pomodoroCount.toString();
  nextBreak.innerText = (pomodoroCount + 1) % 4 === 0 ? "Long" : "Short";
  updateTimeLeft();
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
}

setInterval(updateMediaProgress, 1000);
