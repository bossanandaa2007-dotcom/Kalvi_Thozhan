import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LangToggle } from "@/components/lang-toggle";
import { LogOut, IdCard, School, MapPin, GraduationCap } from "lucide-react";
import { GovFooter, GovIdentity } from "@/components/gov-brand";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { profile, signOut } = useAuth();
  const { t, lang } = useLang();
  const nav = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    nav({ to: "/login" });
  };

  const initials = profile?.full_name?.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase() ?? "S";

  return (
    <div>
      <header className="rounded-b-3xl bg-secondary px-5 pb-10 pt-6 text-center text-secondary-foreground">
        <GovIdentity compact className="mb-6 text-left" />
        <Avatar className="mx-auto h-20 w-20 border-4 border-primary bg-primary/15">
          <AvatarFallback className="bg-primary/20 text-2xl font-bold text-primary">{initials}</AvatarFallback>
        </Avatar>
        <h1 className="mt-3 text-xl font-bold text-primary">{profile?.full_name}</h1>
        <p className="text-xs opacity-70">{t("mobile")} · {profile?.mobile_number ?? "-"}</p>
      </header>

      <div className="space-y-3 p-5">
        <Card className="divide-y divide-border border-0 p-0 shadow-[var(--shadow-card)]">
          <Row icon={GraduationCap} label={t("class")} value={`${profile?.class ?? "-"}${profile?.section ? ` · ${profile.section}` : ""}`} />
          <Row icon={School} label={t("school")} value={profile?.school_name ?? "-"} />
          <Row icon={MapPin} label={t("district")} value={profile?.district ?? "-"} />
          <Row icon={IdCard} label={t("mobile")} value={profile?.mobile_number ?? "-"} />
        </Card>

        <Card className="flex items-center justify-between border-0 p-4 shadow-sm">
          <span className="text-sm font-medium">{t("language")}</span>
          <LangToggle />
        </Card>

        {/* Feedback moved to Student Essentials page */}

        <Button variant="destructive" className="mt-4 h-12 w-full font-semibold" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" /> {t("logout")}
        </Button>

        <p className="pt-2 text-center text-[10px] text-muted-foreground">
          {lang === "ta" ? "சமச்சீர் கல்வி கற்றல் செயலி · v1.0" : "Samacheer Kalvi Digital Learning Platform · v1.0"}
        </p>
      </div>
      <GovFooter />
    </div>
  );
}

function Row({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <div className="flex-1">
        <p className="text-[11px] uppercase text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
