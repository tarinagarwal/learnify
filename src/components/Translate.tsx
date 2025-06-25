import React, { useEffect, useState } from "react";
import { useLanguageStore } from "../store/languageStore";
import { translateText } from "../utils/translate";

interface TranslateProps {
  children: string;
  sourceLang?: string;
}

export const Translate: React.FC<TranslateProps> = ({ children, sourceLang = "en" }) => {
  const { language } = useLanguageStore();
  const [translated, setTranslated] = useState(children);

  useEffect(() => {
    let isMounted = true;
    if (language === sourceLang) {
      setTranslated(children);
      return;
    }
    translateText(children, language, sourceLang).then((res) => {
      if (isMounted) setTranslated(res);
    });
    return () => {
      isMounted = false;
    };
  }, [children, language, sourceLang]);

  return <>{translated}</>;
};
