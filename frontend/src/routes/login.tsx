import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLang } from "@/lib/lang-context";
import { supabase } from "@/integrations/supabase/client";
import { mobileToPhone, useAuth, isValidMobile } from "@/lib/auth-context";
import { toast } from "sonner";
import { LangToggle } from "@/components/lang-toggle";
import { GraduationCap, ShieldCheck } from "lucide-react";
import { findMockStaff, findMockStudent, findMockByEmis, logMockActivity } from "@/lib/mock-data";
import { GovFooter, GovIdentity } from "@/components/gov-brand";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { t, lang } = useLang();
  const { setMockAccount } = useAuth();
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const [mobile, setMobile] = useState("");
  const [emisLogin, setEmisLogin] = useState("");
  const [studentPw, setStudentPw] = useState("");
  const [otp, setOtp] = useState("");

  const [email, setEmail] = useState("");
  const [adminPw, setAdminPw] = useState("");

  const logActivity = async (userId: string) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, school_name, district, class")
      .eq("id", userId)
      .maybeSingle();
    if (profile) {
      await supabase.from("activity_logs").insert({
        user_id: userId,
        user_name: profile.full_name,
        school_name: profile.school_name,
        district: profile.district,
        class: profile.class,
        event_type: "login",
      });
    }
  };

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile && !emisLogin) return;
    setLoading(true);
    // try mock by mobile first
    const mockAccount = mobile ? findMockStudent(mobile, studentPw) : undefined;
    // if not found, try by EMIS
    const mockByEmis = !mockAccount && emisLogin ? findMockByEmis(emisLogin, studentPw) : undefined;
    const finalMock = mockAccount ?? mockByEmis;
    if (mockAccount) {
      setMockAccount(mockAccount);
      logMockActivity(mockAccount.profile);
      setLoading(false);
      nav({ to: "/home" });
      return;
    }
    if (mockByEmis) {
      setMockAccount(mockByEmis);
      logMockActivity(mockByEmis.profile);
      setLoading(false);
      nav({ to: "/home" });
      return;
    }
    // If EMIS provided, resolve phone from Supabase profiles
    let phoneToUse = mobile;
    if (!phoneToUse && emisLogin) {
      const { data: p } = await supabase.from("profiles").select("mobile_number").eq("emis_number", emisLogin).maybeSingle();
      if (p?.mobile_number) phoneToUse = p.mobile_number;
    }
    if (!phoneToUse) {
      setLoading(false);
      toast.error(t("invalidCreds"));
      return;
    }

    // Validate mobile (allow EMIS-resolved phone but still validate its digits)
    if (!isValidMobile(phoneToUse)) {
      setLoading(false);
      toast.error(lang === "ta" ? "தொலைபேசி எண்ணை சரியாக உள்ளிடவும்" : "Enter a valid 10-digit mobile number");
      return;
    }

    const phone = mobileToPhone(phoneToUse);
    if (!otpSent) {
      const { error } = await supabase.auth.signInWithOtp({ phone });
      setLoading(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      setOtpSent(true);
      toast.success(lang === "ta" ? "OTP அனுப்பப்பட்டது" : "OTP sent");
      return;
    }

    const { data, error } = await supabase.auth.verifyOtp({ phone, token: otp, type: "sms" });
    setLoading(false);
    if (error) {
      toast.error(t("invalidCreds"));
      return;
    }
    if (data.user) await logActivity(data.user.id);
    nav({ to: "/home" });
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !adminPw) return;
    setLoading(true);
    const mockAccount = findMockStaff(email, adminPw);
    if (mockAccount) {
      setMockAccount(mockAccount);
      logMockActivity(mockAccount.profile, "login", { role: mockAccount.role });
      setLoading(false);
      nav({ to: mockAccount.role === "student" ? "/home" : "/admin" });
      return;
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: adminPw });
    setLoading(false);
    if (error) {
      toast.error(t("invalidCreds"));
      return;
    }
    if (data.user) {
      const { data: role } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id).maybeSingle();
      nav({ to: role?.role === "district_admin" || role?.role === "super_admin" ? "/admin" : "/home" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute right-3 top-3">
        <LangToggle />
      </div>

      <main className="mx-auto flex min-h-screen max-w-md flex-col px-5 py-8">
        <GovIdentity className="mb-6" />

        <div className="mb-6 rounded-md border border-primary/20 bg-card p-5 shadow-sm">
          <p className="text-sm font-semibold text-primary">{t("tagline")}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            {lang === "ta"
              ? "பாடநூல்கள், காணொளிகள், அறிவிப்புகள், நிகழ்வுகள் அனைத்தும் ஒரே இடத்தில்."
              : "Textbooks, videos, alerts, and events in one student-friendly platform."}
          </p>
        </div>

        <Tabs defaultValue="student" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="student">
              <GraduationCap className="mr-1.5 h-4 w-4" />
              {t("studentLogin")}
            </TabsTrigger>
            <TabsTrigger value="admin">
              <ShieldCheck className="mr-1.5 h-4 w-4" />
              {t("adminLogin")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="student">
            <Card className="border-0 p-5 shadow-[var(--shadow-card)]">
              <form onSubmit={handleStudentLogin} className="space-y-4">
                <div>
                  <Label htmlFor="emis">{t("emis")}</Label>
                  <Input id="emis" value={emisLogin} onChange={(e) => { setEmisLogin(e.target.value); setOtpSent(false); }} />
                </div>
                <div>
                  <Label htmlFor="mobile">{t("mobileLogin")}</Label>
                  <Input id="mobile" inputMode="tel" value={mobile} onChange={(e) => { setMobile(e.target.value); setOtpSent(false); }} />
                </div>
                <div>
                  <Label htmlFor="spw">{lang === "ta" ? "Mock கடவுச்சொல்" : "Mock password"}</Label>
                  <Input id="spw" type="password" value={studentPw} onChange={(e) => setStudentPw(e.target.value)} placeholder={lang === "ta" ? "Mock கணக்குகளுக்கு மட்டும்" : "Only for mock accounts"} />
                </div>
                {otpSent && (
                  <div>
                    <Label htmlFor="otp">{t("otp")}</Label>
                    <Input id="otp" inputMode="numeric" value={otp} onChange={(e) => setOtp(e.target.value)} required />
                  </div>
                )}
                <Button type="submit" className="h-12 w-full text-base font-semibold" disabled={loading}>
                  {loading
                    ? t("loading")
                    : otpSent
                      ? t("verifyOtp")
                      : lang === "ta"
                        ? "உள்நுழை"
                        : "Login"}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  {t("noAccount")} <Link to="/signup" className="font-semibold text-primary">{t("signup")}</Link>
                </p>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="admin">
            <Card className="border-0 p-5 shadow-[var(--shadow-card)]">
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <Label htmlFor="email">{t("email")}</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="apw">{t("password")}</Label>
                  <Input id="apw" type="password" value={adminPw} onChange={(e) => setAdminPw(e.target.value)} required />
                </div>
                <Button type="submit" className="h-12 w-full text-base font-semibold" disabled={loading}>
                  {loading ? t("loading") : t("login")}
                </Button>
              </form>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-5 border border-dashed border-border bg-muted/40 p-4 shadow-none">
          <p className="mb-2 text-xs font-bold uppercase text-muted-foreground">Prototype testing credentials</p>
          <div className="grid gap-2 text-xs">
            <p><b>Student:</b> 9876543210 / student123</p>
            <p><b>Admin:</b> admin@mock.test / admin123</p>
            <p><b>Teacher:</b> teacher@mock.test / teacher123</p>
          </div>
        </Card>
      </main>

      <GovFooter />
    </div>
  );
}
