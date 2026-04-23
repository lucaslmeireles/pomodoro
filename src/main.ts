import { invoke } from "@tauri-apps/api/core";
import { updateMediaProgress } from "./media";
import { toggleFocus } from "./focus";
import { resumeTimer, startTimer, updateTimeLeft } from "./timer";
import store, { PomodoroConfig } from "./store";
import { initConfigSync } from "./context-menu";
import { getCurrentWindow } from "@tauri-apps/api/window";

const appWindow = getCurrentWindow();

//Tauri window management
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

//Focus mode toggle
window.addEventListener("dblclick", toggleFocus);

// Titlebar buttons
document
  .getElementById("titlebar-minimize")
  ?.addEventListener("click", () => appWindow.minimize());
document
  .getElementById("titlebar-close")
  ?.addEventListener("click", () => appWindow.close());

document.getElementById("titlebar")?.addEventListener("mousedown", (e) => {
  const target = e.target as HTMLElement;

  if (target?.closest("button")) {
    return; 
  }
  if (e.buttons === 1) {
    // Primary (left) button
    e.detail === 2
      ? appWindow.toggleMaximize() // Maximize on double click
      : appWindow.startDragging(); // Else start dragging
  }
});

const startButton = document.getElementById("btn-start");
const resumeButton = document.getElementById("btn-resume");
initConfigSync()
window.addEventListener("DOMContentLoaded", async () => {
  const config = await invoke("get_config_timer") as PomodoroConfig;
  store.setState({ pomodoroConfig: config });
  updateTimeLeft();
  startButton?.addEventListener("click", startTimer);
  resumeButton?.addEventListener("click", resumeTimer);
  setInterval(updateMediaProgress, 1000);
});
