import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Calendar, MapPin, Users, ExternalLink, ChevronLeft, ChevronRight, Clock, X } from "lucide-react";
import { getLocalItems, SEED_EVENTS } from "@/lib/mock-data";
import { eventVisibleToProfile } from "@/lib/content-filters";
import { GovIdentity } from "@/components/gov-brand";

export const Route = createFileRoute("/_authenticated/events")({
  component: EventsPage,
});

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

type EventCategory = "academics" | "non-academics" | "sports" | "general" | "all";

type HolidayKind = "govt-holiday" | "tn-festival" | null;

function categorizeEvent(event: any): EventCategory {
  const titleLower = `${event.title} ${event.description || ""} ${event.event_type || ""}`.toLowerCase();
  // Academic keywords (English, Hindi, Tamil)
  if (/exam|test|assignment|study|internal|practical|பரீட்சை|தேர்வு|மாதிரியியல்/i.test(titleLower))
    return "academics";
  // Sports keywords
  if (/tournament|match|practice|sports|athletic|track|field|விளையாட்டு|போட்டி/i.test(titleLower))
    return "sports";
  // General / holiday keywords
  if (/holiday|festival|notice|leave|விடுமுறை|பண்டிகை|திட்டம்|national day/i.test(titleLower))
    return "general";
  // Default to non-academic
  return "non-academics";
}

function getHolidayKind(event: any): HolidayKind {
  const titleLower = `${event.title} ${event.description || ""} ${event.event_type || ""}`.toLowerCase();

  if (
    /pongal|தமிழர் திருநாள்|தைப்பொங்கல்|thai pongal|tamil new year|puthandu|புத்தாண்டு|ayudha puja|ayutha puja|ஆயுத பூஜை|vijayadashami|dussehra|விஜயதசமி|deepavali|diwali|தீபாவளி|thiruvalluvar day|திருவள்ளுவர்|uzhavar thirunal|உழவர் திருநாள்|karthigai deepam|கார்த்திகை தீபம்/i.test(
      titleLower,
    )
  ) {
    return "tn-festival";
  }

  if (
    /republic day|gandhi jayanthi|gandhi jayanti|independence day|may day|labour day|labor day|christmas|new year|new year's day|government holiday|govt holiday|public holiday|அரசு விடுமுறை|பொது விடுமுறை|குடியரசு தினம்|சுதந்திர தினம்|மே தினம்|காந்தி ஜெயந்தி|கிறிஸ்துமஸ்/i.test(
      titleLower,
    )
  ) {
    return "govt-holiday";
  }

  return null;
}

function isRemovedAthleticsEvent(event: any) {
  const titleLower = `${event.title ?? ""} ${event.title_ta ?? ""}`.toLowerCase();
  return /zonal athletics meet|மண்டல தடகளப் போட்டி|athletics meet/i.test(titleLower);
}

const CATEGORY_COLORS: Record<EventCategory, { bg: string; ring: string; text: string }> = {
  academics: { bg: "bg-yellow-50", ring: "ring-yellow-400", text: "text-yellow-700" },
  sports: { bg: "bg-blue-50", ring: "ring-blue-400", text: "text-blue-700" },
  "non-academics": { bg: "bg-purple-50", ring: "ring-purple-400", text: "text-purple-700" },
  general: { bg: "bg-green-50", ring: "ring-green-400", text: "text-green-700" },
  all: { bg: "bg-primary/10", ring: "ring-primary", text: "text-primary" },
};

const HOLIDAY_COLORS: Record<Exclude<HolidayKind, null>, { bg: string; ring: string; text: string; dot: string; labelEn: string; labelTa: string }> = {
  "govt-holiday": {
    bg: "bg-rose-50",
    ring: "ring-rose-400",
    text: "text-rose-700",
    dot: "bg-rose-500",
    labelEn: "Govt Holiday",
    labelTa: "அரசு விடுமுறை",
  },
  "tn-festival": {
    bg: "bg-orange-50",
    ring: "ring-orange-400",
    text: "text-orange-700",
    dot: "bg-orange-500",
    labelEn: "TN Festival",
    labelTa: "தமிழ்நாடு பண்டிகை",
  },
};

function EventsPage() {
  const { profile, role } = useAuth();
  const { t, lang } = useLang();
  const today = new Date();
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [events, setEvents] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<EventCategory>("all");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    supabase.from("events").select("*").order("event_date").then(({ data }) => {
      const fallback = getLocalItems("events", SEED_EVENTS);
      setEvents(
        (data?.length ? data : fallback)
          .filter((item) => eventVisibleToProfile(item, profile, role))
          .filter((item) => !isRemovedAthleticsEvent(item)),
      );
    });
  }, [profile, role]);

  const calendarDays = useMemo(() => {
    const start = new Date(month.getFullYear(), month.getMonth(), 1);
    const firstDay = start.getDay();
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const cells: (Date | null)[] = Array(firstDay).fill(null);
    for (let day = 1; day <= daysInMonth; day += 1) cells.push(new Date(month.getFullYear(), month.getMonth(), day));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [month]);

  const filteredEvents = events.filter((event) => {
    const cat = categorizeEvent(event);
    const isHoliday = !!getHolidayKind(event);
    // Only show holiday details when the user has selected the "general" tab
    if (isHoliday && selectedCategory !== "general") return false;
    if (selectedCategory === "all") return true;
    return cat === selectedCategory;
  });

  function parseISODate(s: any) {
    if (!s) return null;
    const d = new Date(s);
    if (isNaN(d.getTime())) return null;
    return d;
  }

  function getEventRange(event: any): [Date, Date] {
    const possibleEndKeys = [
      "end_date",
      "event_end_date",
      "endDate",
      "to_date",
      "date_to",
      "end",
    ];

    let start = parseISODate(event.event_date) || parseISODate(event.date) || null;
    let end: Date | null = null;
    if (!start) start = new Date();

    for (const k of possibleEndKeys) {
      if (event[k]) {
        const d = parseISODate(event[k]);
        if (d) {
          end = d;
          break;
        }
      }
    }

    // If no explicit end found, try to parse two ISO dates from description
    if (!end && typeof event.description === "string") {
      const matches = event.description.match(/\d{4}-\d{2}-\d{2}/g);
      if (matches && matches.length >= 2) {
        const s = parseISODate(matches[0]);
        const e = parseISODate(matches[1]);
        if (s && e) {
          start = s;
          end = e;
        }
      }
    }

    if (!end) end = start;

    return [start as Date, end as Date];
  }

  function eventOccursOn(event: any, date: Date) {
    const [start, end] = getEventRange(event);
    // normalize to date-only
    const dOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const sOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const eOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    return dOnly.getTime() >= sOnly.getTime() && dOnly.getTime() <= eOnly.getTime();
  }

  const eventsForDay = (date: Date) =>
    filteredEvents.filter((event) => eventOccursOn(event, date));

  return (
    <div>
      <header className="rounded-b-3xl bg-secondary px-5 pb-6 pt-6 text-secondary-foreground">
        <GovIdentity compact className="mb-4" />
        <h1 className="text-2xl font-bold text-primary">{t("events")}</h1>
        <p className="text-xs opacity-70">{lang === "ta" ? "பள்ளி நிகழ்வுகள், போட்டிகள், தேர்வுகள்" : "School events, contests, exams"}</p>
      </header>

      <div className="space-y-4 p-5">
        {/* Legend removed per UX: holiday names are shown under calendar dates */}

        {/* Category Filter Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-2">
          {(
            [
              { id: "all", label: lang === "ta" ? "அனைத்து" : "All" },
              { id: "academics", label: lang === "ta" ? "கல்வி" : "Academics" },
              { id: "non-academics", label: lang === "ta" ? "கல்வி அல்லாதவை" : "Non-Acad" },
              { id: "sports", label: lang === "ta" ? "விளையாட்டு" : "Sports" },
              { id: "general", label: lang === "ta" ? "பொதுவ" : "General" },
            ] as const
          ).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                selectedCategory === cat.id
                  ? `${CATEGORY_COLORS[cat.id].bg} ${CATEGORY_COLORS[cat.id].text} ring-2 ${CATEGORY_COLORS[cat.id].ring}`
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Calendar */}
        <Card className="border-0 p-3 shadow-[var(--shadow-card)]">
          <div className="mb-3 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-center">
              <p className="text-sm font-bold">{month.toLocaleDateString(lang === "ta" ? "ta-IN" : "en-IN", { month: "long", year: "numeric" })}</p>
              <p className="text-[10px] text-muted-foreground">{lang === "ta" ? "சாதன உள்ளூர் நேரத்துடன் ஒத்திசைவு" : "Synced with device local date"}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-muted-foreground">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <span key={day}>{day}</span>)}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
              const dayEvents = day ? eventsForDay(day) : [];
              const dayHolidayKinds = dayEvents.map((event) => getHolidayKind(event)).filter(Boolean) as Exclude<HolidayKind, null>[];
              const hasAcademic = dayEvents.some((e) => categorizeEvent(e) === "academics");
              const hasSports = dayEvents.some((e) => categorizeEvent(e) === "sports");
              const hasNonAcad = dayEvents.some((e) => categorizeEvent(e) === "non-academics");
              const hasGeneral = dayEvents.some((e) => categorizeEvent(e) === "general");
              const hasGovtHoliday = dayHolidayKinds.includes("govt-holiday");
              const hasTnFestival = dayHolidayKinds.includes("tn-festival");
              
              let bgColor = "bg-card";
              let borderColor = "border-border";
              let borderWidth = "border";
              
              // Apply holiday-specific colors only when NOT viewing the General tab.
              if (selectedCategory !== "general") {
                if (hasGovtHoliday) {
                  borderColor = HOLIDAY_COLORS["govt-holiday"].ring.replace("ring-", "border-");
                  bgColor = HOLIDAY_COLORS["govt-holiday"].bg;
                } else if (hasTnFestival) {
                  borderColor = HOLIDAY_COLORS["tn-festival"].ring.replace("ring-", "border-");
                  bgColor = HOLIDAY_COLORS["tn-festival"].bg;
                }
              }

              // Determine border color based on filter
              if (selectedCategory === "academics" && hasAcademic) borderColor = "border-yellow-500";
              else if (selectedCategory === "sports" && hasSports) borderColor = "border-blue-500";
              else if (selectedCategory === "non-academics" && hasNonAcad) borderColor = "border-purple-500";
              else if (selectedCategory === "general" && hasGeneral) borderColor = "border-green-500";
              else if (selectedCategory === "all" && dayEvents.length) {
                if (hasAcademic) borderColor = "border-yellow-500";
                else if (hasSports) borderColor = "border-blue-500";
                else if (hasNonAcad) borderColor = "border-purple-500";
                else if (hasGeneral) borderColor = "border-green-500";
              }
              
              // Bold border for dates with events
              if (dayEvents.length) borderWidth = "border-2";
              
              if (hasAcademic) bgColor = "bg-yellow-50";
              else if (hasSports) bgColor = "bg-blue-50";
              else if (hasNonAcad) bgColor = "bg-purple-50";
              else if (hasGeneral) bgColor = "bg-green-50";
              // If viewing General tab and this date has general events, prefer the general color theme
              if (selectedCategory === "general" && hasGeneral) {
                borderColor = "border-green-500";
                bgColor = CATEGORY_COLORS.general.bg;
              }
              
              return (
                <button
                  onClick={() => day && dayEvents.length > 0 && setSelectedDate(day)}
                  disabled={!day || dayEvents.length === 0}
                  key={day?.toISOString() ?? `blank-${index}`}
                  className={[
                      "flex aspect-square flex-col items-center justify-center rounded-md text-xs font-medium transition-all cursor-pointer",
                      day ? `${borderWidth} ${borderColor} ${bgColor}` : "border border-transparent",
                      // Selected date should use the General green accent when in General view
                      day && selectedDate && sameDay(day, selectedDate)
                        ? (selectedCategory === "general" ? "ring-2 ring-green-500 ring-inset" : "ring-2 ring-primary ring-inset")
                        : day && sameDay(day, today)
                          ? (selectedCategory === "general" ? "ring-2 ring-green-500 ring-inset" : "ring-2 ring-primary ring-inset")
                          : "",
                      dayEvents.length && (selectedCategory === "all" || dayEvents.some((e) => categorizeEvent(e) === selectedCategory)) ? "hover:shadow-md" : "",
                      !day || dayEvents.length === 0 ? "cursor-default" : "",
                    ].join(" ")}
                >
                  {day?.getDate()}
                    {/* Minimal cell: only the date number and visual highlight; no labels or dots */}
                </button>
              );
            })}
          </div>
        </Card>

        {filteredEvents.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">{t("noData")}</p>}
        {filteredEvents.filter((e) => !getHolidayKind(e)).map((e) => {
          const d = new Date(e.event_date);
          const category = categorizeEvent(e);
          const holidayKind = getHolidayKind(e);
          const colors = CATEGORY_COLORS[category];
          const bgGradient =
            holidayKind === "govt-holiday"
              ? "bg-gradient-to-r from-rose-500 to-rose-600"
              : holidayKind === "tn-festival"
                ? "bg-gradient-to-r from-orange-500 to-orange-600"
                : category === "academics"
              ? "bg-gradient-to-r from-yellow-500 to-yellow-600"
              : category === "sports"
                ? "bg-gradient-to-r from-blue-500 to-blue-600"
                : category === "non-academics"
                  ? "bg-gradient-to-r from-purple-500 to-purple-600"
                  : "bg-gradient-to-r from-green-500 to-green-600";
          return (
            <Card key={e.id} className="overflow-hidden border-0 p-0 shadow-[var(--shadow-card)]">
              <div className="flex">
                <div className={`flex w-20 flex-col items-center justify-center py-4 text-primary-foreground ${bgGradient}`}>
                  <span className="text-[10px] font-bold uppercase opacity-90">{d.toLocaleDateString(lang === "ta" ? "ta-IN" : "en-IN", { month: "short" })}</span>
                  <span className="text-2xl font-bold leading-none">{d.getDate()}</span>
                  <span className="mt-1 text-[10px] opacity-90">{e.event_time}</span>
                </div>
                <div className="flex-1 p-3">
                  <div className="flex items-start gap-2">
                    <h3 className="flex-1 text-sm font-bold">{lang === "ta" && e.title_ta ? e.title_ta : e.title}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${colors.bg} ${colors.text}`}>
                      {holidayKind === "govt-holiday"
                        ? lang === "ta"
                          ? HOLIDAY_COLORS["govt-holiday"].labelTa
                          : HOLIDAY_COLORS["govt-holiday"].labelEn
                        : holidayKind === "tn-festival"
                          ? lang === "ta"
                            ? HOLIDAY_COLORS["tn-festival"].labelTa
                            : HOLIDAY_COLORS["tn-festival"].labelEn
                          : category === "academics"
                        ? lang === "ta"
                          ? "கல்வி"
                          : "Acad"
                        : category === "sports"
                          ? lang === "ta"
                            ? "விளையாட்டு"
                            : "Sport"
                          : category === "non-academics"
                            ? lang === "ta"
                              ? "கல்வி அல்லாதவை"
                              : "NonAcad"
                            : lang === "ta"
                              ? "பொதுவ"
                              : "Gen"}
                    </span>
                  </div>
                  {e.description && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{e.description}</p>}
                  <div className="mt-2 space-y-1 text-[11px] text-muted-foreground">
                    {e.venue && <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3" />{e.venue}</div>}
                    {e.target_class && <div className="flex items-center gap-1.5"><Users className="h-3 w-3" />{t("class")} {e.target_class}</div>}
                  </div>
                  {e.registration_url && (
                    <a href={e.registration_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                      {lang === "ta" ? "பதிவு செய்க" : "Register"} <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Date Details Modal */}
      {selectedDate && (
        <Dialog open={!!selectedDate} onOpenChange={(open) => !open && setSelectedDate(null)}>
          <DialogContent className="max-w-md">
            <DialogTitle className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">
                  {lang === "ta" ? "நிகழ்வுகள்" : "Events"}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedDate.toLocaleDateString(lang === "ta" ? "ta-IN" : "en-IN", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </DialogTitle>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {selectedDate ? (
                (() => {
                  const modalEvents = events.filter((ev) => {
                    if (!selectedDate) return false;
                    if (!eventOccursOn(ev, selectedDate)) return false;
                    const isHoliday = !!getHolidayKind(ev);
                    if (isHoliday) return selectedCategory === "general";
                    if (selectedCategory === "all") return true;
                    return categorizeEvent(ev) === selectedCategory;
                  });

                  if (modalEvents.length === 0) {
                    return (
                      <p className="text-center text-sm text-muted-foreground py-4">
                        {lang === "ta" ? "இந்த தேதிக்கு நிகழ்வுகள் இல்லை" : "No events for this date"}
                      </p>
                    );
                  }

                  return modalEvents.map((event) => {
                    const category = categorizeEvent(event);
                    const holidayKind = getHolidayKind(event);
                    const colors = CATEGORY_COLORS[category];
                    const d = new Date(event.event_date);
                    const bgGradient =
                      holidayKind === "govt-holiday"
                        ? "bg-gradient-to-r from-rose-500 to-rose-600"
                        : holidayKind === "tn-festival"
                          ? "bg-gradient-to-r from-orange-500 to-orange-600"
                          : category === "academics"
                        ? "bg-gradient-to-r from-yellow-500 to-yellow-600"
                        : category === "sports"
                          ? "bg-gradient-to-r from-blue-500 to-blue-600"
                          : category === "non-academics"
                            ? "bg-gradient-to-r from-purple-500 to-purple-600"
                            : "bg-gradient-to-r from-green-500 to-green-600";

                    return (
                      <div key={event.id} className="rounded-lg border border-border overflow-hidden">
                        <div className={`flex items-center gap-3 p-3 text-white ${bgGradient}`}>
                          <div className="flex-1">
                            <h3 className="font-bold text-sm">{lang === "ta" && event.title_ta ? event.title_ta : event.title}</h3>
                            <p className="text-xs opacity-90">{event.event_time}</p>
                          </div>
                          <span className="rounded-full px-2 py-1 bg-white/20 text-xs font-semibold">
                            {holidayKind === "govt-holiday"
                              ? lang === "ta"
                                ? HOLIDAY_COLORS["govt-holiday"].labelTa
                                : HOLIDAY_COLORS["govt-holiday"].labelEn
                              : holidayKind === "tn-festival"
                                ? lang === "ta"
                                  ? HOLIDAY_COLORS["tn-festival"].labelTa
                                  : HOLIDAY_COLORS["tn-festival"].labelEn
                                : category === "academics"
                              ? lang === "ta"
                                ? "கல்வி"
                                : "Acad"
                              : category === "sports"
                                ? lang === "ta"
                                  ? "விளையாட்டு"
                                  : "Sport"
                                : category === "non-academics"
                                  ? lang === "ta"
                                    ? "கல்வி அல்லாதவை"
                                    : "NonAcad"
                                  : lang === "ta"
                                    ? "பொதுவ"
                                    : "Gen"}
                          </span>
                        </div>
                        <div className="p-3 space-y-2">
                          {event.description && (
                            <p className="text-xs text-muted-foreground leading-relaxed">{event.description}</p>
                          )}
                          <div className="space-y-1 text-xs text-muted-foreground">
                            {event.venue && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                                <span>{event.venue}</span>
                              </div>
                            )}
                            {event.target_class && (
                              <div className="flex items-center gap-2">
                                <Users className="h-3.5 w-3.5 flex-shrink-0" />
                                <span>{t("class")} {event.target_class}</span>
                              </div>
                            )}
                            {event.event_time && (
                              <div className="flex items-center gap-2">
                                <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                                <span>{event.event_time}</span>
                              </div>
                            )}
                          </div>
                          {event.registration_url && (
                            <a
                              href={event.registration_url}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                            >
                              {lang === "ta" ? "பதிவு செய்க" : "Register"} <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()
              ) : null}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
