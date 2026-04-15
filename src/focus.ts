import { invoke } from "@tauri-apps/api/core";

export function toggleFocus() {
  const isActive = document.body.classList.toggle("focus-mode");
  invoke("toggle_focus_mode", { isActive: isActive });
}
