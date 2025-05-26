'use client';

import { useState, useEffect } from 'react';

interface SidebarSettings {
  isFixed: boolean;
  defaultOpen: boolean;
}

const SIDEBAR_SETTINGS_KEY = 'sidebar-settings';

const defaultSettings: SidebarSettings = {
  isFixed: false,
  defaultOpen: true,
};

export function useSidebarSettings() {
  const [settings, setSettings] = useState<SidebarSettings>(defaultSettings);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({ ...defaultSettings, ...parsed });
      }
    } catch (error) {
      void console.warn('Failed to load sidebar settings:', error);
    }
  }, []);

  // Save settings to localStorage when they change
  const updateSettings = (newSettings: Partial<SidebarSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    try {
      void localStorage.setItem(SIDEBAR_SETTINGS_KEY, JSON.stringify(updated));
    } catch (error) {
      void console.warn('Failed to save sidebar settings:', error);
    }
  };

  return {
    settings,
    updateSettings,
    toggleFixed: () => updateSettings({ isFixed: !settings.isFixed }),
    toggleDefaultOpen: () => updateSettings({ defaultOpen: !settings.defaultOpen }),
  };
}
