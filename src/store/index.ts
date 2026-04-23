import { invoke } from "@tauri-apps/api/core";
import { createStore } from "zustand/vanilla";

export interface PomodoroConfig {
  pomodoroTime: number;
  shortBreakTime: number;
  longBreakTime: number;
  autoStart: boolean;
}

type Store = {
  pomodoroConfig: PomodoroConfig;
  setConfig: (config: Partial<PomodoroConfig>) => Promise<void>;
};


const store = createStore<Store>((set, get) => ({
  pomodoroConfig: {
    pomodoroTime: 25 * 60,
    shortBreakTime: 5 * 60,
    longBreakTime: 15 * 60,
    autoStart: false,
  },
   setConfig: async (config) => {
    const current = get().pomodoroConfig;

    const updated = await invoke("update_config", {
      newConfig: { ...current, ...config },
    });

    set({ pomodoroConfig: updated as PomodoroConfig });
  },
}));

export default store;
