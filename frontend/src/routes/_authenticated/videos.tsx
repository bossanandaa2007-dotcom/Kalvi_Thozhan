import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Clock } from "lucide-react";
import { getLocalItems, SEED_VIDEOS } from "@/lib/mock-data";
import { classesMatch, filterByStudentClass, isStudent } from "@/lib/content-filters";
import { GovIdentity } from "@/components/gov-brand";

export const Route = createFileRoute("/_authenticated/videos")({
  component: VideosPage,
});

function getEmbedUrl(url: string) {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1&rel=0`;
  if (url.includes("youtube.com/embed/")) return url;
  return url;
}

function getThumb(url: string, fallback?: string) {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/);
  if (yt) return `https://img.youtube.com/vi/${yt[1]}/hqdefault.jpg`;
  return fallback ?? "";
}

function VideosPage() {
  const { profile, role } = useAuth();
  const { t, lang } = useLang();
  const student = isStudent(role);
  const [klass, setKlass] = useState<string>(profile?.class ?? "5");
  const [subject, setSubject] = useState<string>("all");
  const [items, setItems] = useState<any[]>([]);
  const [playing, setPlaying] = useState<any | null>(null);

  useEffect(() => { if (profile?.class && student) setKlass(profile.class); }, [profile?.class, student]);

  useEffect(() => {
    let q = supabase.from("videos").select("*").eq("class", student && profile?.class ? profile.class : klass).order("subject");
    if (subject !== "all") q = q.eq("subject", subject);
    q.then(({ data }) => {
      const fallback = filterByStudentClass(getLocalItems("videos", SEED_VIDEOS), profile, role).filter((item) => classesMatch(item.class, klass));
      const rows = (data?.length ? data : fallback).filter((item) => subject === "all" || item.subject === subject);
      setItems(rows);
    });
  }, [klass, subject, profile, role, student]);

  const subjects = Array.from(new Set(items.map((i) => i.subject))).sort();

  return (
    <div>
      <header className="rounded-b-3xl bg-secondary px-5 pb-6 pt-6 text-secondary-foreground">
        <GovIdentity compact className="mb-4" />
        <h1 className="text-2xl font-bold text-primary">{t("videos")}</h1>
        <p className="text-xs opacity-70">{lang === "ta" ? "Kalvi TV மற்றும் வீடியோ பாடங்கள்" : "Kalvi TV & lesson videos"}</p>
      </header>

      <div className="space-y-3 px-5 py-4">
        {!student && (
          <Tabs value={klass} onValueChange={setKlass}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="5">{t("class")} 5</TabsTrigger>
              <TabsTrigger value="10">{t("class")} 10</TabsTrigger>
              <TabsTrigger value="12">{t("class")} 12</TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        <Select value={subject} onValueChange={setSubject}>
          <SelectTrigger><SelectValue placeholder={t("selectSubject")} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{lang === "ta" ? "எல்லா பாடங்கள்" : "All Subjects"}</SelectItem>
            {subjects.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>

        <div className="grid grid-cols-2 gap-3 pt-2">
          {items.length === 0 && <p className="col-span-2 py-8 text-center text-sm text-muted-foreground">{t("noData")}</p>}
          {items.map((v) => (
            <button key={v.id} onClick={() => setPlaying(v)} className="text-left">
              <Card className="overflow-hidden border-0 p-0 shadow-sm">
                <div className="relative aspect-video bg-secondary">
                  {getThumb(v.url, v.thumbnail_url) ? <img src={getThumb(v.url, v.thumbnail_url)} alt="" className="h-full w-full object-cover" /> : null}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Play className="h-5 w-5 fill-current" />
                    </div>
                  </div>
                  {v.duration_minutes && (
                    <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white">
                      <Clock className="h-2.5 w-2.5" />{v.duration_minutes}m
                    </div>
                  )}
                </div>
                <div className="p-2.5">
                  <p className="line-clamp-2 text-xs font-semibold">{lang === "ta" && v.title_ta ? v.title_ta : v.title}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">{v.subject}{v.chapter ? ` · ${v.chapter}` : ""}</p>
                </div>
              </Card>
            </button>
          ))}
        </div>
      </div>

      <Dialog open={!!playing} onOpenChange={(o) => !o && setPlaying(null)}>
        <DialogContent className="max-w-2xl p-0 sm:p-0">
          <DialogTitle className="sr-only">{playing?.title}</DialogTitle>
          {playing && (
            <>
              <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                <iframe
                  src={getEmbedUrl(playing.url)}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold">{lang === "ta" && playing.title_ta ? playing.title_ta : playing.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{playing.subject}{playing.chapter ? ` · ${playing.chapter}` : ""}</p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
