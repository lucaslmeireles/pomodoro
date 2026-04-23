import { 
  isPermissionGranted, 
  requestPermission, 
  sendNotification 
} from '@tauri-apps/plugin-notification';

let permissionGranted = false;

export async function checkNotificationPermission() {
  permissionGranted = await isPermissionGranted();

  if (!permissionGranted) {
    const permission = await requestPermission();
    permissionGranted = permission === "granted";
  }

  return permissionGranted;
}

// Once permission has been granted we can send the notification
export async function showNotification(title: string, body: string) {
  const granted = await checkNotificationPermission();
  if (!granted) {
    console.warn("Notification permission not granted");
    return;
  }
  sendNotification({ title, body });
}
