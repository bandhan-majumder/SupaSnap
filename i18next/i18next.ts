import React from "react";
import i18n from "i18next";
import { useTranslation, initReactI18next } from "react-i18next";
import { getLocales } from "expo-localization";
import { I18nManager } from "react-native";
import en from "./locales/en";

export const lng = getLocales()[0].languageCode ?? "en";

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    // the translations
    // (tip move them in a JSON file and import them,
    // or even better, manage them via a UI: https://react.i18next.com/guides/multiple-translation-files#manage-your-translations-with-a-management-gui)
    resources: {
      en,
    },
    lng, // if you're using a language detector, do not define the lng option
    fallbackLng: "en",
    supportedLngs: ["en", "es"],

    interpolation: {
      escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
    },
  });

// Right to left and left to right detections
//   export const isRTL = getLocales()[0].textDirection === "rtl";
//   I18nManager.allowRTL(isRTL);
//   I18nManager.forceRTL(isRTL);

export default i18n;
