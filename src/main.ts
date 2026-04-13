const { getCurrentWindow } = window.__TAURI__.window;
import { invoke } from "@tauri-apps/api/core";
import { updateMediaProgress } from "./media";
import { checkNotificationPermission, showNotification } from "./notification";

//Tauri window management
const appWindow = getCurrentWindow();
let pin = false;
document.getElementById("pin-disabled")?.addEventListener("click", async () => {
  pin = !pin;
  await invoke("set_always_on_top", { alwaysOnTop: pin });
  document.getElementById("pin-disabled")?.classList.add("hidden");
  document.getElementById("pin-activated")?.classList.remove("hidden");
});
document
  .getElementById("pin-activated")
  ?.addEventListener("click", async () => {
    pin = !pin;
    await invoke("set_always_on_top", { alwaysOnTop: pin });
    document.getElementById("pin-activated")?.classList.add("hidden");
    document.getElementById("pin-disabled")?.classList.remove("hidden");
  });

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
let pomodoroTime = 60;
let shortBreakTime = 5;
let longBreakTime = 15 * 60;

// Local variables - Store
let timerInterval: number | null = null;
let isRunning = false;
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

function scheduleTick() {
  timerInterval = window.setTimeout(async () => {
    if (!isRunning) {
      return;
    }

    if (timeLeft > 0) {
      timeLeft--;
      timeDisplay && (timeDisplay.innerText = formatTime(timeLeft));
      scheduleTick();
    } else {
      isRunning = false;
      timerInterval = null;
      await resetTimer();
    }
  }, 1000);
}

function startTimer() {
  if (isRunning) {
    return;
  }

  isRunning = true;
  tooggleButton(startButton);
  tooggleButton(resumeButton);
  scheduleTick();
}

function resumeTimer() {
  if (!isRunning) {
    return;
  }
  isRunning = false;
  if (timerInterval !== null) {
    window.clearTimeout(timerInterval);
    timerInterval = null;
  }

  tooggleButton(startButton);
  tooggleButton(resumeButton);
}

async function resetTimer() {
  if (timerInterval !== null) {
    window.clearTimeout(timerInterval);
    timerInterval = null;
  }
  tooggleButton(startButton);
  tooggleButton(resumeButton);
  if (isPomodoro) {
    pomodoroCount++;
    isPomodoro = false;
    await showNotification("Pomodoro Finished", "Time for a break!");
  } else {
    isPomodoro = true;
    await showNotification("Break Finished", "Time to get back to work!");
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
