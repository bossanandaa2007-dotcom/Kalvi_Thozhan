import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AlertCircle, Music, Phone, Heart, AlertTriangle, BookOpen, ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLang } from "@/lib/lang-context";
import { useAuth } from "@/lib/auth-context";
import { addLocalItem } from "@/lib/mock-data";
import { FEEDBACK_CATEGORIES, FEEDBACK_ROLES, labelForCategory, labelForRole } from "@/lib/feedback";
import { toast } from "sonner";
import { GovIdentity } from "@/components/gov-brand";

export const Route = createFileRoute("/_authenticated/essentials")({
  component: EssentialsPage,
});

type Section = "tamil" | "anthem" | "emergency" | "safety" | "traffic" | "values" | "feedback";

const TAM_THAI_LYRICS = `நீராருங் கடலுடுத்த நிலமடந்தைக் கெழிலொழுகும்
சீராரும் வதனமெனத் திகழ் பரதக் கண்டமிதில்
தெக்கணமும் அதிற்சிறந்த திராவிட நல் திருநாடும்
தக்கசிறு பிறைநுதலும் தரித்தநறுந் திலகமுமே
அத்திலக வாசனைபோல் அனைத்துலகும் இன்பமுற
எத்திசையும் புகழ் மணக்க இருந்த பெருந் தமிழணங்கே!
தமிழணங்கே!
உன்சீரிளமைத் திறம் வியந்து
செய ல்மறந்து வாழ்த்துதுமே!
வாழ்த்துதுமே!
வாழ்த்துதுமே!`;

const NATIONAL_ANTHEM = `ஜன கண மன அதினாயக ஜய ஹே
பாரத பக்ய விதாதா
பஞ்சாப், சிந்து, குஜராத், மராத்தா
திராவிட, உட்கலா, பங்கா
விந்த்யா, ஹிமாச்சல், யமுனா, கங்கா
உச்சல ஜலதி தரங்கா
தவ சுப நமே ஜாகே
தவ சுப ஆசீஷ் மாஙே
கஹே தவ ஜய கீதா
ஜன கண மங்கள தாயக ஜய ஹே
பாரத பக்ய விதாதா
ஜய ஹே, ஜய ஹே, ஜய ஹே
ஜயை ஜயை ஜய ஹே

-- Roman transliteration --
Jana-gana-mana-adhinayaka, jaya he
Bharata-bhagya-vidhata
Punjab-Sindh-Gujarat-Maratha
Dravida-Utkala-Banga
Vindhya-Himachal-Yamuna-Ganga
Uchchala-jaladhi-taranga
Tava shubha name jage
Tava shubha ashish maange
Gaye tava jaya gatha
Jana-gana-mangala-dayaka jaya he
Bharata-bhagya-vidhata
Jaya he, jaya he, jaya he
Jaya jaya jaya, jaya he`;

const EMERGENCY_CONTACTS = [
  { label: "Police", number: "100", icon: "🚨" },
  { label: "Ambulance", number: "108", icon: "🚑" },
  { label: "Child Helpline", number: "1098", icon: "👧" },
  { label: "Fire Service", number: "101", icon: "🚒" },
];

const SAFETY_TIPS = [
  {
    title: "Anti-Bullying",
    tips: [
      "Tell a teacher or parent if bullied",
      "Don't respond to bullies with violence",
      "Stay with friends, don't be alone",
      "Keep evidence of bullying",
    ],
  },
  {
    title: "Stranger Awareness",
    tips: [
      "Never talk to strangers alone",
      "Don't share personal information",
      "Trust your instincts",
      "Always inform parents about whereabouts",
    ],
  },
  {
    title: "Basic Safety Tips",
    tips: [
      "Know your full address and phone number",
      "Have emergency contact numbers memorized",
      "Don't open doors to strangers",
      "Stay alert in public places",
    ],
  },
];

const TRAFFIC_SAFETY = [
  {
    title: "Traffic Signals",
    info: "Red = Stop, Yellow = Wait/Slow down, Green = Go. Always cross at signals.",
  },
  {
    title: "Zebra Crossing",
    info: "Use zebra crossings to cross roads safely. Look both ways before crossing.",
  },
  {
    title: "Helmet Safety",
    info: "Always wear a helmet when on two-wheelers. It saves lives in accidents.",
  },
  {
    title: "School Bus Safety",
    info: "Sit inside the bus, don't put head/hands out. Follow driver's instructions.",
  },
];

const VALUES = [
  {
    title: "Good Touch / Bad Touch",
    description: "Understand safe and unsafe touches. Report uncomfortable situations to trusted adults.",
  },
  {
    title: "Respect for Elders",
    description: "Show respect to parents, teachers, and elders. Listen to their guidance.",
  },
  {
    title: "Kindness & Compassion",
    description: "Help others in need. Be kind to classmates and everyone around you.",
  },
  {
    title: "Honesty & Responsibility",
    description: "Be truthful and take responsibility for your actions. Admit mistakes honestly.",
  },
  {
    title: "Cleanliness & Hygiene",
    description: "Maintain personal and environmental cleanliness. Wash hands, keep surroundings clean.",
  },
  {
    title: "Helping Others",
    description: "Volunteer to help friends, family, and community. Make a positive difference.",
  },
];

function EssentialsPage() {
  const { t, lang } = useLang();
  const { profile } = useAuth();
  const [fbCategory, setFbCategory] = useState<string>("other");
  const [fbRole, setFbRole] = useState<string>("student");
  const [fbMessage, setFbMessage] = useState<string>("");
  const [fbSubmitting, setFbSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState<Section>("tamil");

  const sections: { id: Section; label: string; icon: React.ReactNode }[] = [
    { id: "tamil", label: lang === "ta" ? "தமிழ் தாய்" : "Tamil Thai", icon: "🇮🇳" },
    { id: "anthem", label: lang === "ta" ? "தேசிய கீதம்" : "National Anthem", icon: "🎵" },
    { id: "emergency", label: lang === "ta" ? "அவசரம்" : "Emergency", icon: "🆘" },
    { id: "safety", label: lang === "ta" ? "பாதுகாப்பு" : "Safety", icon: "🛡️" },
    { id: "traffic", label: lang === "ta" ? "போக்குவரத்து" : "Traffic", icon: "🚦" },
    { id: "values", label: lang === "ta" ? "மதிப்புகள்" : "Values", icon: "💎" },
    { id: "feedback", label: lang === "ta" ? "கருத்து" : "Feedback", icon: "💬" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="rounded-b-3xl bg-secondary px-5 pb-6 pt-6 text-secondary-foreground">
        <Link
          to="/home"
          className="mb-3 inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground"
        >
          <ArrowLeft className="h-3 w-3" />
          {lang === "ta" ? "முகப்பு" : "Back"}
        </Link>
        <GovIdentity compact className="mb-4" />
        <h1 className="text-2xl font-bold text-primary">
          {lang === "ta" ? "மாணவர் அপরिहार्य" : "Student Essentials"}
        </h1>
        <p className="text-xs opacity-70">
          {lang === "ta"
            ? "பாதுகாப்பு, மதிப்புகள் மற்றும் விழிப்புணர்வு"
            : "Safety, values & awareness information"}
        </p>
      </header>

      {/* Section Tabs */}
      <div className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-sm px-3 py-2">
        <div className="flex gap-1 overflow-x-auto">
          {sections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                activeSection === sec.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <span>{sec.icon}</span>
              {sec.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4 p-5">
        {/* Tamil Thai Valthu */}
        {activeSection === "tamil" && (
          <div className="space-y-3">
            <Card className="border-0 p-4 shadow-[var(--shadow-card)]">
              <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
                <Music className="h-5 w-5 text-primary" />
                {lang === "ta" ? "தமிழ் தாய்" : "Tamil Thai Valthu"}
              </h2>
              <div className="mb-3 flex gap-2">
                <Button size="sm" variant="outline" className="gap-2">
                  <span>▶️</span>
                  {lang === "ta" ? "கேளுக" : "Listen"}
                </Button>
              </div>
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {TAM_THAI_LYRICS}
              </p>
            </Card>
          </div>
        )}

        {/* National Anthem */}
        {activeSection === "anthem" && (
          <div className="space-y-3">
            <Card className="border-0 p-4 shadow-[var(--shadow-card)]">
              <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
                <Music className="h-5 w-5 text-primary" />
                {lang === "ta" ? "தேசிய கீதம்" : "National Anthem"}
              </h2>
              <div className="mb-3 flex gap-2">
                <Button size="sm" variant="outline" className="gap-2">
                  <span>▶️</span>
                  {lang === "ta" ? "கேளுக" : "Listen"}
                </Button>
              </div>
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {NATIONAL_ANTHEM}
              </p>
            </Card>
          </div>
        )}

        {/* Emergency Numbers */}
        {activeSection === "emergency" && (
          <div className="space-y-3">
            {EMERGENCY_CONTACTS.map((contact) => (
              <Card
                key={contact.number}
                className="border-0 p-4 shadow-[var(--shadow-card)] active:scale-95"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{contact.icon}</span>
                  <div className="flex-1">
                    <p className="font-semibold">{contact.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {lang === "ta" ? "அவசர எண்:" : "Emergency Number:"}
                    </p>
                  </div>
                  <a
                    href={`tel:${contact.number}`}
                    className="text-2xl font-bold text-primary"
                  >
                    {contact.number}
                  </a>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Safety Awareness */}
        {activeSection === "safety" && (
          <div className="space-y-3">
            {SAFETY_TIPS.map((section) => (
              <Card key={section.title} className="border-0 p-4 shadow-[var(--shadow-card)]">
                <h3 className="mb-2 flex items-center gap-2 font-bold">
                  <AlertTriangle className="h-4 w-4 text-accent" />
                  {section.title}
                </h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {section.tips.map((tip, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        )}

        {/* Traffic Safety */}
        {activeSection === "traffic" && (
          <div className="space-y-3">
            {TRAFFIC_SAFETY.map((item) => (
              <Card key={item.title} className="border-0 p-4 shadow-[var(--shadow-card)]">
                <h3 className="mb-2 font-bold text-primary">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.info}</p>
              </Card>
            ))}
          </div>
        )}

        {/* Value Education */}
        {activeSection === "values" && (
          <div className="space-y-3">
            {VALUES.map((value) => (
              <Card key={value.title} className="border-0 p-4 shadow-[var(--shadow-card)]">
                <h3 className="mb-2 flex items-center gap-2 font-bold">
                  <Heart className="h-4 w-4 text-accent" />
                  {value.title}
                </h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </Card>
            ))}
          </div>
        )}

        {/* Feedback tab content moved to its own section */}
        {activeSection === "feedback" && (
          <div className="space-y-3">
            <Card className="border-0 p-4 shadow-[var(--shadow-card)]">
              <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
                <AlertCircle className="h-5 w-5 text-primary" />
                {lang === "ta" ? "கருத்து/பின்னூட்டம்" : "Feedback"}
              </h2>
              <div className="mb-3 grid gap-2">
                <div className="flex gap-2">
                  <select value={fbCategory} onChange={(e) => setFbCategory(e.target.value)} className="flex-1 rounded-md border px-2 py-2 text-sm">
                    {FEEDBACK_CATEGORIES.map((c) => (
                      <option key={c.key} value={c.key}>{lang === "ta" ? c.ta : c.en}</option>
                    ))}
                  </select>
                  <select value={fbRole} onChange={(e) => setFbRole(e.target.value)} className="w-36 rounded-md border px-2 py-2 text-sm">
                    {FEEDBACK_ROLES.map((r) => (
                      <option key={r.key} value={r.key}>{lang === "ta" ? r.ta : r.en}</option>
                    ))}
                  </select>
                </div>
                <textarea value={fbMessage} onChange={(e) => setFbMessage(e.target.value)} rows={6} className="w-full resize-none rounded-md border p-2 text-sm" placeholder={lang === "ta" ? "உங்கள் கருத்தை இங்கே எழுதுங்கள்" : "Write your feedback here"} />
                <div className="flex justify-end">
                  <Button size="sm" onClick={async () => {
                    if (!fbMessage.trim()) { toast.error(lang === "ta" ? "கருத்து இல்லை" : "Please enter feedback"); return; }
                    setFbSubmitting(true);
                    const item = {
                      id: `fb-${Date.now()}`,
                      student_id: profile?.id ?? "anonymous",
                      category: fbCategory,
                      role: fbRole,
                      message: fbMessage.trim(),
                      status: "open",
                      created_at: new Date().toISOString(),
                    } as any;
                    addLocalItem("feedback", item);
                    setFbMessage("");
                    setFbCategory("other");
                    setFbRole("student");
                    setFbSubmitting(false);
                    toast.success(lang === "ta" ? "நன்றி — உங்கள் கருத்து சேர்க்கப்பட்டது" : "Thanks — feedback submitted");
                  }} disabled={fbSubmitting}>
                    {fbSubmitting ? (lang === "ta" ? "சமர்ப்பிக்கிறது..." : "Submitting...") : (lang === "ta" ? "சமர்ப்பிக்க" : "Submit")}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

    </div>
  );
}
