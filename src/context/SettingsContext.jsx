import { createContext, useContext, useEffect, useState } from "react";

const SettingsContext = createContext();

const defaultSettings = {
  notifications: true,
  emailAlerts: true,
  aiRecommendations: true,
  defaultLocation: "Hyderabad",
  planningHorizon: "30 Days",
  serviceLevel: "95%",
  theme:"dark",
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    const storedSettings = localStorage.getItem("appSettings");

    if (storedSettings) {
      return {
        ...defaultSettings,
        ...JSON.parse(storedSettings),
      };
    }

    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem("appSettings", JSON.stringify(settings));
  }, [settings]);

useEffect(() => {
  document.documentElement.setAttribute("data-theme", settings.theme);
}, [settings.theme]);

  const updateSetting = (name, value) => {
    setSettings((current) => ({
      ...current,
      [name]: value,
    }));
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSetting,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}