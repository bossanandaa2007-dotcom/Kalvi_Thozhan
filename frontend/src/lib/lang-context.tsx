import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Lang, DictKey } from "./i18n";
import { t as translate } from "./i18n";

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: DictKey) => string;
}

const Ctx = createContext<LangCtx | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ta");

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("lang") : null;
    if (stored === "ta" || stored === "en") setLangState(stored);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("lang", l);
  };

  return (
    <Ctx.Provider value={{ lang, setLang, t: (k) => translate(k, lang) }}>{children}</Ctx.Provider>
  );
}

export function useLang() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useLang must be used inside LangProvider");
  return c;
}
