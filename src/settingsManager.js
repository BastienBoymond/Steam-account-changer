const SPEED_SETTINGS = {
  fast: {
    nameChangeTimeout: 300,
    avatarChangeTimeout: 300,
    uploadButtonTimeout: 100
  },
  medium: {
    nameChangeTimeout: 500,
    avatarChangeTimeout: 500,
    uploadButtonTimeout: 200
  },
  slow: {
    nameChangeTimeout: 1000,
    avatarChangeTimeout: 1000,
    uploadButtonTimeout: 300
  },
  'really-slow': {
    nameChangeTimeout: 2000,
    avatarChangeTimeout: 2000,
    uploadButtonTimeout: 500
  }
};

const DEFAULT_SETTINGS = {
  speed: 'medium',
  ...SPEED_SETTINGS.medium
};

export async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get('settings');
    return result.settings || DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error loading settings:', error);
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(speed) {
  try {
    const settings = {
      speed,
      ...SPEED_SETTINGS[speed]
    };
    await chrome.storage.sync.set({ settings });
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
} 