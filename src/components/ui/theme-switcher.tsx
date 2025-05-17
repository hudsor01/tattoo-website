"use client";

import { useState, useEffect } from "react";
import { IconButton, Tooltip, useColorScheme } from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

type ThemeMode = "light" | "dark" | "system";

interface ThemeSwitcherProps {
  size?: "small" | "medium" | "large";
  tooltipPlacement?: "top" | "right" | "bottom" | "left";
}

/**
 * Theme switcher component allowing users to toggle between light, dark and system themes
 */
export function ThemeSwitcher({ 
  size = "medium",
  tooltipPlacement = "bottom"
}: ThemeSwitcherProps) {
  const { mode, setMode } = useColorScheme();
  const [mounted, setMounted] = useState(false);

  // Make sure component is mounted to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Cycle through themes: light -> dark -> system -> light
  const cycleTheme = () => {
    switch (mode) {
      case "light":
        setMode("dark");
        break;
      case "dark":
        setMode("system");
        break;
      default:
        setMode("light");
    }
  };

  // Get the current icon based on theme
  const ThemeIcon = () => {
    if (!mounted) return null;

    switch (mode) {
      case "light":
        return <LightModeIcon />;
      case "dark":
        return <DarkModeIcon />;
      default:
        return <AutoAwesomeIcon />;
    }
  };

  // Get the tooltip label based on current theme
  const getTooltipLabel = () => {
    if (!mounted) return "";

    switch (mode) {
      case "light":
        return "Switch to dark mode";
      case "dark":
        return "Switch to system theme";
      default:
        return "Switch to light mode";
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <Tooltip title={getTooltipLabel()} placement={tooltipPlacement}>
      <IconButton
        onClick={cycleTheme}
        size={size}
        aria-label="Theme switcher"
        color="inherit"
      >
        <ThemeIcon />
      </IconButton>
    </Tooltip>
  );
}

export default ThemeSwitcher;