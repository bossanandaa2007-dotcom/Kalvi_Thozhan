import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { addLocalItem } from "@/lib/mock-data";
import { GovIdentity } from "@/components/gov-brand";
import { FEEDBACK_CATEGORIES } from "@/lib/feedback";

export const Route = createFileRoute("/_authenticated/feedback")({
  component: FeedbackPage,
});

function FeedbackPage() {
  const { user, profile } = useAuth();
  const { t, lang } = useLang();
  const nav = useNavigate();
  const [category, setCategory] = useState(FEEDBACK_CATEGORIES[0].key);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user) return;
    setLoading(true);
    const row = {
      id: `feedback-${Date.now()}`,
      student_id: user.id,
      category,
      message: message.trim(),
      district: profile?.district,
      status: "open",
      created_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("feedback").insert(row);
    if (error) addLocalItem("feedback", row);
    setLoading(false);
    toast.success(lang === "ta" ? "கருத்து சமர்ப்பிக்கப்பட்டது" : "Feedback submitted");
    setMessage("");
    nav({ to: "/home" });
  };

  return (
    <div>
      <header className="rounded-b-3xl bg-secondary px-5 pb-6 pt-6 text-secondary-foreground">
        <GovIdentity compact className="mb-4" />
        <Link to="/profile" className="inline-flex items-center text-xs opacity-80"><ArrowLeft className="mr-1 h-3 w-3" />{t("profile")}</Link>
        <h1 className="mt-2 text-2xl font-bold text-primary">{t("feedback")}</h1>
      </header>

      <div className="p-5">
        <Card className="border-0 p-5 shadow-[var(--shadow-card)]">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label className="mb-1.5 block">{lang === "ta" ? "வகை" : "Category"}</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FEEDBACK_CATEGORIES.map((c) => (
                    <SelectItem key={c.key} value={c.key}>{lang === "ta" ? c.ta : c.en}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block">{t("yourMessage")}</Label>
              <Textarea rows={5} value={message} onChange={(e) => setMessage(e.target.value)} maxLength={1000} />
            </div>
            <Button type="submit" className="h-12 w-full font-semibold" disabled={loading || !message.trim()}>
              {loading ? t("loading") : t("submit")}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
