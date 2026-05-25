import { useLang } from "@/lib/lang-context";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";

export function LangToggle({ className }: { className?: string }) {
  const { lang, setLang } = useLang();
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLang(lang === "ta" ? "en" : "ta")}
      className={className}
    >
      <Languages className="mr-1 h-4 w-4" />
      {lang === "ta" ? "English" : "தமிழ்"}
    </Button>
  );
}
