import { listen } from "@tauri-apps/api/event";
import store from "./store";
import { updateTimeLeft } from "./timer";


export function initConfigSync() {
  listen("config-updated", (event) => {
    const pomodoroStore = store.getState()
    store.setState({
      pomodoroConfig: {
        ...pomodoroStore,
        pomodoroTime: event.payload.pomodoroTime as number,
        autoStart: event.payload.autoStart as boolean,
      } as any,
    });
    updateTimeLeft()
  });
}