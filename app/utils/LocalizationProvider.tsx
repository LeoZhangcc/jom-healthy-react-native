import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { SupportedLanguage, supportedLanguages, TranslationKey, translations } from "./i18n";

const STORAGE_KEY = "appLanguage";

type LocalizationContextValue = {
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => Promise<void>;
  t: (key: TranslationKey) => string;
  availableLanguages: typeof supportedLanguages;
};

const LocalizationContext = createContext<LocalizationContextValue | null>(null);

export function LocalizationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>("en");

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === "zh" || stored === "ms" || stored === "en") {
        setLanguageState(stored);
      }
    });
  }, []);

  const setLanguage = async (newLanguage: SupportedLanguage) => {
    setLanguageState(newLanguage);
    await AsyncStorage.setItem(STORAGE_KEY, newLanguage);
  };

  const t = useMemo(
    () => (key: TranslationKey) => translations[language][key] ?? key,
    [language]
  );

  return (
    <LocalizationContext.Provider
      value={{ language, setLanguage, t, availableLanguages: supportedLanguages }}
    >
      {children}
    </LocalizationContext.Provider>
  );
}

export function useLocalization() {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error("useLocalization must be used within LocalizationProvider");
  }
  return context;
}
