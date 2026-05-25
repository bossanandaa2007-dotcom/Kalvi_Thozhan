import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, ExternalLink } from "lucide-react";
import { getLocalItems, SEED_MATERIALS, type Material } from "@/lib/mock-data";
import { classesMatch, filterByStudentClass, isStudent } from "@/lib/content-filters";
import { GovIdentity } from "@/components/gov-brand";

export const Route = createFileRoute("/_authenticated/materials")({
  component: MaterialsPage,
});

const BOOK_TYPES = new Set(["textbook", "book_back", "guide"]);

function MaterialsPage() {
  const { profile, role } = useAuth();
  const { t, lang } = useLang();
  const student = isStudent(role);
  const [category, setCategory] = useState<"books" | "notes">("books");
  const [klass, setKlass] = useState(profile?.class ?? "5");
  const [items, setItems] = useState<Material[]>([]);

  useEffect(() => {
    if (profile?.class && student) setKlass(profile.class);
  }, [profile?.class, student]);

  useEffect(() => {
    const load = async () => {
      let query = supabase.from("materials").select("*").order("class").order("subject").order("chapter");
      if (student && profile?.class) query = query.eq("class", profile.class);
      else query = query.eq("class", klass);
      const { data } = await query;
      const fallback = filterByStudentClass(getLocalItems("materials", SEED_MATERIALS), profile, role).filter((item) => classesMatch(item.class, klass));
      setItems((data?.length ? data : fallback) as Material[]);
    };
    load();
  }, [klass, profile, role, student]);

  const filtered = useMemo(() => {
    return items.filter((item) => category === "books" ? BOOK_TYPES.has(item.type) : !BOOK_TYPES.has(item.type));
  }, [items, category]);

  const subjects = useMemo(() => {
    return Array.from(new Set(filtered.map((item) => item.subject))).sort();
  }, [filtered]);

  return (
    <div>
      <header className="rounded-b-3xl bg-secondary px-5 pb-6 pt-6 text-secondary-foreground">
        <GovIdentity compact className="mb-4" />
        <h1 className="text-2xl font-bold text-primary">{t("materials")}</h1>
        <p className="text-xs opacity-70">
          {student ? `${t("class")} ${profile?.class}` : lang === "ta" ? "வகுப்பு, பாடம், அத்தியாயம் வாரியாக" : "Organized by class, subject, and chapter"}
        </p>
      </header>

      <div className="space-y-4 p-5">
        <Tabs value={category} onValueChange={(value) => setCategory(value as "books" | "notes")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="books"><BookOpen className="mr-1.5 h-4 w-4" />{t("books")}</TabsTrigger>
            <TabsTrigger value="notes"><FileText className="mr-1.5 h-4 w-4" />{t("subjectNotes")}</TabsTrigger>
          </TabsList>
        </Tabs>

        {!student && (
          <Select value={klass} onValueChange={setKlass}>
            <SelectTrigger><SelectValue placeholder={t("selectClass")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="5">{t("class")} 5</SelectItem>
              <SelectItem value="10">{t("class")} 10</SelectItem>
              <SelectItem value="12">{t("class")} 12</SelectItem>
            </SelectContent>
          </Select>
        )}

        {filtered.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">{t("noData")}</p>}

        <div className="space-y-4">
          {subjects.map((subject) => {
            const rows = filtered.filter((item) => item.subject === subject);
            const chapters = Array.from(new Set(rows.map((item) => item.chapter ?? "General"))).sort();
            return (
              <section key={subject} className="space-y-2">
                <h2 className="text-sm font-bold text-primary">{subject}</h2>
                {chapters.map((chapter) => (
                  <Card key={`${subject}-${chapter}`} className="border-0 p-3 shadow-sm">
                    <p className="mb-2 text-xs font-semibold text-muted-foreground">{chapter}</p>
                    <div className="space-y-2">
                      {rows.filter((item) => (item.chapter ?? "General") === chapter).map((item) => (
                        <div key={item.id} className="flex items-center gap-3 rounded-md bg-muted/60 p-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
                            {BOOK_TYPES.has(item.type) ? <BookOpen className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">{lang === "ta" && item.title_ta ? item.title_ta : item.title}</p>
                            <p className="text-[11px] text-muted-foreground">{t("class")} {item.class} · {item.type} · {item.source}</p>
                          </div>
                          <Button asChild size="sm" variant="ghost" className="h-9 w-9 p-0">
                            <a href={item.url} target="_blank" rel="noreferrer" aria-label={t("openMaterial")}>
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
