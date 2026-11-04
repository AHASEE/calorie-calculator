import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const PREFS_KEY = 'alviva_notification_preferences';
const IDS_KEY = 'alviva_notification_schedule_ids';
const CHANNEL_ID = 'alviva-reminders';

export interface NotificationPreferences {
  water: boolean;
  meals: boolean;
  evening: boolean;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  water: false,
  meals: false,
  evening: false,
};

export async function ensureNotificationChannel() {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync(
    CHANNEL_ID,
    {
      name: 'Alviva reminders',
      description: 'Meal, water and daily wellness reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 180, 120, 180],
    }
  );
}

export async function requestNotificationPermission(): Promise<boolean> {
  await ensureNotificationChannel();

  const existing =
    await Notifications.getPermissionsAsync();

  if (existing.granted) {
    return true;
  }

  const requested =
    await Notifications.requestPermissionsAsync();

  return requested.granted;
}

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  try {
    const raw =
      await AsyncStorage.getItem(PREFS_KEY);

    if (!raw) {
      return DEFAULT_NOTIFICATION_PREFERENCES;
    }

    const parsed = JSON.parse(raw);

    return {
      water: Boolean(parsed?.water),
      meals: Boolean(parsed?.meals),
      evening: Boolean(parsed?.evening),
    };
  } catch {
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }
}

async function getScheduleIds(): Promise<string[]> {
  try {
    const raw =
      await AsyncStorage.getItem(IDS_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed)
      ? parsed.filter(
          (value): value is string =>
            typeof value === 'string'
        )
      : [];
  } catch {
    return [];
  }
}

export async function cancelAlvivaReminders() {
  const ids =
    await getScheduleIds();

  await Promise.all(
    ids.map(async (id) => {
      try {
        await Notifications
          .cancelScheduledNotificationAsync(id);
      } catch {
        // Notification may already have fired.
      }
    })
  );

  await AsyncStorage.removeItem(IDS_KEY);
}

async function scheduleDaily(
  hour: number,
  minute: number,
  title: string,
  body: string,
  destination: 'home' | 'scan'
): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: 'default',
      data: {
        destination,
        source: 'alviva-reminder',
      },
    },
    trigger: {
      type:
        Notifications
          .SchedulableTriggerInputTypes
          .DAILY,
      hour,
      minute,
      channelId:
        Platform.OS === 'android'
          ? CHANNEL_ID
          : undefined,
    },
  });
}

export async function syncNotificationSchedules(
  preferences: NotificationPreferences
): Promise<boolean> {
  await cancelAlvivaReminders();

  const enabled =
    preferences.water ||
    preferences.meals ||
    preferences.evening;

  if (!enabled) {
    return true;
  }

  await ensureNotificationChannel();

  const permission =
    await Notifications.getPermissionsAsync();

  if (!permission.granted) {
    return false;
  }

  const ids: string[] = [];

  if (preferences.water) {
    ids.push(
      await scheduleDaily(
        11,
        0,
        'Water break 💧',
        'A glass of water now can help you stay on track.',
        'home'
      )
    );

    ids.push(
      await scheduleDaily(
        17,
        0,
        'Hydration check 💧',
        'Open Alviva and update today’s water intake.',
        'home'
      )
    );
  }

  if (preferences.meals) {
    ids.push(
      await scheduleDaily(
        9,
        0,
        'Breakfast check-in 🍳',
        'Scan or log your breakfast while it is fresh in your mind.',
        'scan'
      )
    );

    ids.push(
      await scheduleDaily(
        14,
        0,
        'Lunch check-in 🥗',
        'Take a quick meal photo and keep today’s calories updated.',
        'scan'
      )
    );

    ids.push(
      await scheduleDaily(
        20,
        0,
        'Dinner check-in 🍽️',
        'Log dinner and review your daily calorie progress.',
        'scan'
      )
    );
  }

  if (preferences.evening) {
    ids.push(
      await scheduleDaily(
        21,
        0,
        'Daily check-in 🌙',
        'Review today’s progress and keep your Alviva routine going.',
        'home'
      )
    );
  }

  await AsyncStorage.setItem(
    IDS_KEY,
    JSON.stringify(ids)
  );

  return true;
}

export async function saveNotificationPreferences(
  preferences: NotificationPreferences
): Promise<boolean> {
  await AsyncStorage.setItem(
    PREFS_KEY,
    JSON.stringify(preferences)
  );

  return syncNotificationSchedules(
    preferences
  );
}

export async function restoreNotificationSchedules() {
  const preferences =
    await getNotificationPreferences();

  return syncNotificationSchedules(
    preferences
  );
}

export async function sendTestNotification() {
  await ensureNotificationChannel();

  const permission =
    await Notifications.getPermissionsAsync();

  if (!permission.granted) {
    return false;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Alviva reminders are on ✅',
      body: 'Your meal, water and wellness reminders can now appear on this device.',
      sound: 'default',
      data: {
        destination: 'home',
        source: 'alviva-reminder',
      },
    },
    trigger: null,
  });

  return true;
}
