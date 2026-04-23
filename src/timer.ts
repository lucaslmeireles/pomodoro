import { showNotification } from "./notification";
import store, { PomodoroConfig } from "./store";

//Config Variables
const getConfig = () => store.getState().pomodoroConfig satisfies PomodoroConfig;

// Local variables - Store
let timerInterval: number | null = null;
let isRunning = false;
let isPomodoro = true;
let timeLeft = 0;
let pomodoroCount = 0;

// DOM elements
const startButton = document.getElementById("btn-start");
const resumeButton = document.getElementById("btn-resume");
const timeDisplay = document.getElementById("time-left");
const pomodoroCycle = document.getElementById(
  "pomodoro-cycle",
) as HTMLParagraphElement;
const nextBreak = document.getElementById("next-break") as HTMLParagraphElement;

export function updateTimeLeft() {
  const config = getConfig();
  if (isPomodoro) {
    timeLeft = config.pomodoroTime;
  } else {
    isPomodoro = false;
    if (pomodoroCount > 0 && pomodoroCount % 4 === 0) {
      timeLeft = config.longBreakTime;
    } else {
      timeLeft = config.shortBreakTime;
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

export function startTimer() {
  if (isRunning) {
    return;
  }

  isRunning = true;
  tooggleButton(startButton);
  tooggleButton(resumeButton);
  scheduleTick();
}

export function resumeTimer() {
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
  const config = getConfig();
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
  if (config.autoStart) {
    scheduleTick()
  }
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function tooggleButton(button: HTMLElement | null) {
  if (!button) return;
  if (button.classList.contains("hidden")) {
    button.classList.remove("hidden");
  } else {
    button.classList.add("hidden");
  }
}
