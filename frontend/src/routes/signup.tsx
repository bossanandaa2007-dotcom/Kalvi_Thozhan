import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLang } from "@/lib/lang-context";
import { supabase } from "@/integrations/supabase/client";
import { mobileToEmail, useAuth, isValidMobile } from "@/lib/auth-context";
import { toast } from "sonner";
import { LangToggle } from "@/components/lang-toggle";
import { ArrowLeft, Loader2, MapPin, Search } from "lucide-react";
import { MOCK_SCHOOLS, type MockAccount } from "@/lib/mock-data";
import { GovFooter, GovIdentity } from "@/components/gov-brand";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

const TN_DISTRICTS = [
  "Ariyalur",
  "Chengalpattu",
  "Chennai",
  "Coimbatore",
  "Cuddalore",
  "Dharmapuri",
  "Dindigul",
  "Erode",
  "Kallakurichi",
  "Kanchipuram",
  "Kanyakumari",
  "Karur",
  "Krishnagiri",
  "Madurai",
  "Mayiladuthurai",
  "Nagapattinam",
  "Namakkal",
  "Nilgiris",
  "Perambalur",
  "Pudukkottai",
  "Ramanathapuram",
  "Ranipet",
  "Salem",
  "Sivaganga",
  "Tenkasi",
  "Thanjavur",
  "Theni",
  "Thoothukudi",
  "Tiruchirappalli",
  "Tirunelveli",
  "Tirupathur",
  "Tiruppur",
  "Tiruvallur",
  "Tiruvannamalai",
  "Tiruvarur",
  "Vellore",
  "Viluppuram",
  "Virudhunagar",
];

type MapLocation = {
  label: string;
  latitude: number;
  longitude: number;
  placeId?: string;
};

const TAMIL_NADU_BOUNDS = {
  north: 13.5,
  south: 8.0,
  west: 76.0,
  east: 80.6,
};

const GOOGLE_MAPS_API_KEY =
  (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined) ||
  "AIzaSyAGAG7T0dACGFf6vRNEb6TSHlb9TPpSmFs";

function SignupPage() {
  const { t, lang } = useLang();
  const { setMockAccount } = useAuth();
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [emis, setEmis] = useState("");
  const [district, setDistrict] = useState("");
  const [schoolType, setSchoolType] = useState<"Government" | "Aided">("Government");
  const [school, setSchool] = useState("");
  const [manualSchool, setManualSchool] = useState("");
  const [klass, setKlass] = useState("");
  const [section, setSection] = useState("");
  const [location, setLocation] = useState<MapLocation | null>(null);
  const [schools, setSchools] = useState<{ id: string; name: string; type?: string }[]>([]);

  useEffect(() => {
    if (!district) {
      setSchools([]);
      return;
    }
    supabase
      .from("schools")
      .select("id,name,type")
      .eq("district", district)
      .order("name")
      .then(({ data }) => {
        const fallback = MOCK_SCHOOLS.filter(
          (s) => s.district === district && ["Government", "Aided"].includes(s.type),
        );
        setSchools(
          ((data?.length ? data : fallback) ?? []) as { id: string; name: string; type?: string }[],
        );
      });
  }, [district]);

  const schoolOptions = schools.filter((s) => s.type === schoolType);
  const selectedSchool = manualSchool.trim() || school;

  const isValidClass = (classValue: string): boolean => {
    if (!classValue) return false;
    const lowerClass = classValue.toLowerCase().trim();
    if (lowerClass === 'lkg') return true;
    const num = parseInt(classValue, 10);
    return !isNaN(num) && num >= 1 && num <= 12;
  };

  const createMockAccount = () => {
    const account: MockAccount = {
      key: mobile,
      email: mobileToEmail(mobile),
      password: password || "student123",
      role: "student",
      profile: {
        id: `local-student-${Date.now()}`,
        full_name: name,
        emis_number: emis || null,
        mobile_number: mobile,
        district,
        school_name: selectedSchool,
        class: klass,
        section,
        language_preference: lang,
          location_label: location?.label ?? null,
          location_latitude: location?.latitude ?? null,
          location_longitude: location?.longitude ?? null,
          location_place_id: location?.placeId ?? null,
      },
    };
    setMockAccount(account);
    toast.success(lang === "ta" ? "மாதிரி கணக்கு உருவாக்கப்பட்டது" : "Mock account created");
    nav({ to: "/home" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !mobile || !district || !selectedSchool || !klass) {
      toast.error(
        lang === "ta" ? "அனைத்து தேவையான புலங்களையும் நிரப்பவும்" : "Fill all required fields",
      );
      return;
    }

    if (!isValidClass(klass)) {
      toast.error(
        lang === "ta" 
          ? "வகுப்பு LKG அல்லது 1 முதல் 12 வரை இருக்க வேண்டும்" 
          : "Class must be LKG or 1-12"
      );
      return;
    }

    // Validate mobile format (allow spaces/plus/dashes but require 10 digits or 91+10)
    if (!isValidMobile(mobile)) {
      toast.error(lang === "ta" ? "தொலைபேசி எண்ணை சரியாக உள்ளிடவும்" : "Enter a valid 10-digit mobile number");
      return;
    }

    const authPassword = password.trim();
    if (authPassword && authPassword.toLowerCase().startsWith("mock")) {
      createMockAccount();
      return;
    }

    if (authPassword.length < 6) {
      toast.error(
        lang === "ta"
          ? "கடவுச்சொல் குறைந்தது 6 எழுத்துகள் இருக்க வேண்டும்"
          : "Password must be at least 6 characters",
      );
      return;
    }

    setLoading(true);
    const email = mobileToEmail(mobile);
    const { data, error } = await supabase.auth.signUp({
      email,
      password: authPassword,
      options: {
        data: {
          full_name: name,
          emis_number: emis || null,
          mobile_number: mobile,
          district,
          school_name: selectedSchool,
          class: klass,
          section,
          language_preference: lang,
          role: "student",
          location_label: location?.label ?? null,
          location_latitude: location?.latitude ?? null,
          location_longitude: location?.longitude ?? null,
          location_place_id: location?.placeId ?? null,
        },
      },
    });

    if (error || !data.user) {
      setLoading(false);
      toast.error(error?.message ?? t("invalidCreds"));
      return;
    }

    const profileRow = {
      id: data.user.id,
      full_name: name,
      emis_number: emis || null,
      mobile_number: mobile,
      district,
      school_name: selectedSchool,
      class: klass,
      section,
      language_preference: lang,
      email: mobileToEmail(mobile),
      location_label: location?.label ?? null,
      location_latitude: location?.latitude ?? null,
      location_longitude: location?.longitude ?? null,
      location_place_id: location?.placeId ?? null,
    };
    const roleRow = {
      user_id: data.user.id,
      role: "student",
      district,
    };

    await supabase.from("profiles").upsert(profileRow);
    await supabase.from("user_roles").upsert(roleRow, { onConflict: "user_id,role" });
    setLoading(false);
    toast.success(
      data.session
        ? t("signupSuccess")
        : lang === "ta"
          ? "கணக்கு உருவாக்கப்பட்டது. உள்நுழைவதற்கு முன் மின்னஞ்சல் உறுதிப்படுத்தல் தேவைப்படலாம்."
          : "Account created. Email confirmation may be required before login.",
    );
    nav({ to: "/home" });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute right-3 top-3">
        <LangToggle />
      </div>

      <main className="mx-auto max-w-md px-5 py-6">
        <Link to="/login" className="mb-4 inline-flex items-center text-sm text-muted-foreground">
          <ArrowLeft className="mr-1 h-4 w-4" /> {t("login")}
        </Link>

        <GovIdentity className="mb-5" />
        <h1 className="mb-4 text-2xl font-bold">{t("signup")}</h1>

        <Card className="border-0 p-5 shadow-[var(--shadow-card)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label={t("fullName")} required>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label={t("mobile")} required>
              <Input
                inputMode="tel"
                value={mobile}
                onChange={(e) => {
                  setMobile(e.target.value);
                }}
              />
            </Field>
            <Field label={t("password")} required>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
              />
            </Field>
            <Field label={t("emis")}>
              <Input value={emis} onChange={(e) => setEmis(e.target.value)} />
            </Field>

            <Field label={t("district")} required>
              <Select
                value={district}
                onValueChange={(value) => {
                  setDistrict(value);
                  setSchool("");
                  setManualSchool("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("district")} />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {TN_DISTRICTS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label={lang === "ta" ? "துல்லிய இடம்" : "Precise location"}>
              <MapLocationPicker
                apiKey={GOOGLE_MAPS_API_KEY}
                value={location}
                onChange={setLocation}
                district={district}
                lang={lang}
              />
            </Field>

            <Field label={lang === "ta" ? "பள்ளி வகை" : "School type"} required>
              <Select
                value={schoolType}
                onValueChange={(value) => {
                  setSchoolType(value as "Government" | "Aided");
                  setSchool("");
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Government">
                    {lang === "ta" ? "அரசு பள்ளி" : "Government school"}
                  </SelectItem>
                  <SelectItem value="Aided">
                    {lang === "ta" ? "உதவி பெறும் பள்ளி" : "Aided school"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field label={t("school")} required>
              <Select
                value={school}
                onValueChange={(value) => {
                  setSchool(value);
                  setManualSchool("");
                }}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={lang === "ta" ? "பள்ளியைத் தேர்வு செய்க" : "Select school"}
                  />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {schoolOptions.map((s) => (
                    <SelectItem key={s.id} value={s.name}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                className="mt-2"
                value={manualSchool}
                onChange={(e) => setManualSchool(e.target.value)}
                placeholder={
                  lang === "ta"
                    ? "பள்ளி இல்லை என்றால் இங்கே உள்ளிடுக"
                    : "If unavailable, enter school manually"
                }
              />
            </Field>

            <Field label={t("class")} required>
              <Input 
                value={klass} 
                onChange={(e) => setKlass(e.target.value)}
                placeholder={lang === "ta" ? "LKG / 1-12" : "LKG / 1-12"}
              />
            </Field>

            <Button
              type="submit"
              className="h-12 w-full text-base font-semibold"
              disabled={loading}
            >
              {loading ? t("loading") : lang === "ta" ? "பதிவு செய்க" : "Register"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              {t("alreadyAccount")}{" "}
              <Link to="/login" className="font-semibold text-primary">
                {t("login")}
              </Link>
            </p>
          </form>
        </Card>
      </main>
      <GovFooter />
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="mb-1.5 block">
        {label}
        {required && <span className="ml-0.5 text-accent">*</span>}
      </Label>
      {children}
    </div>
  );
}

function MapLocationPicker({
  apiKey,
  value,
  onChange,
  district,
  lang,
}: {
  apiKey?: string;
  value: MapLocation | null;
  onChange: (location: MapLocation | null) => void;
  district: string;
  lang: string;
}) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);
  const placesServiceRef = useRef<any>(null);
  const [query, setQuery] = useState(value?.label ?? "");
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    setQuery(value?.label ?? "");
  }, [value?.label]);

  useEffect(() => {
    if (!ready || !district || !geocoderRef.current || !mapRef.current || !markerRef.current) return;

    const focusDistrict = async () => {
      setLoading(true);
      try {
        const result = await new Promise<any>((resolve, reject) => {
          geocoderRef.current.geocode(
            { address: `${district}, Tamil Nadu, India` },
            (results: any, status: string) => {
              if (status === "OK" && results?.[0]) resolve(results[0]);
              else reject(new Error(status));
            },
          );
        });

        const locationResult = result.geometry?.location;
        if (locationResult) {
          const lat = locationResult.lat();
          const lng = locationResult.lng();
          markerRef.current.setPosition({ lat, lng });
          mapRef.current.panTo({ lat, lng });
          mapRef.current.setZoom(10);
          onChange({
            label: result.formatted_address || `${district}, Tamil Nadu`,
            latitude: lat,
            longitude: lng,
            placeId: result.place_id,
          });
          setQuery(result.formatted_address || `${district}, Tamil Nadu`);
          setMessage(
            lang === "ta"
              ? `${district} மாவட்டம் மையப்படுத்தப்பட்டது`
              : `${district} district centered`,
          );
        }
      } catch {
        setMessage(lang === "ta" ? "மாவட்டத்தை மையப்படுத்த முடியவில்லை" : "Unable to center district");
      } finally {
        setLoading(false);
      }
    };

    void focusDistrict();
  }, [district, lang, onChange, ready]);

  useEffect(() => {
    if (!ready || !query.trim()) return;
    if (value?.label && query.trim() === value.label.trim()) return;

    const timer = window.setTimeout(() => {
      void searchLocation(query.trim());
    }, 700);

    return () => window.clearTimeout(timer);
  }, [query, ready]);

  useEffect(() => {
    if (!apiKey || typeof window === "undefined") return;

    const initMap = () => {
      const maps = (window as Window & { google?: any }).google?.maps;
      if (!maps || !mapContainerRef.current || mapRef.current) return;

      geocoderRef.current = new maps.Geocoder();
      const center = { lat: 11.1271, lng: 78.6569 };
      mapRef.current = new maps.Map(mapContainerRef.current, {
        center,
        zoom: 6,
        clickableIcons: false,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        restriction: {
          latLngBounds: TAMIL_NADU_BOUNDS,
          strictBounds: true,
        },
      });

      markerRef.current = new maps.Marker({
        map: mapRef.current,
        position: value ? { lat: value.latitude, lng: value.longitude } : center,
      });
      placesServiceRef.current = new maps.places.PlacesService(mapRef.current);

      if (value) {
        mapRef.current.setCenter({ lat: value.latitude, lng: value.longitude });
        mapRef.current.setZoom(15);
      }

      mapRef.current.addListener("click", (event: any) => {
        const latLng = event?.latLng;
        if (latLng) void selectLocation(latLng.lat(), latLng.lng());
      });

      setReady(true);
    };

    const existingScript = document.querySelector<HTMLScriptElement>("script[data-google-maps='signup']");
    if ((window as Window & { google?: any }).google?.maps) {
      initMap();
      return;
    }

    if (existingScript) {
      existingScript.addEventListener("load", initMap, { once: true });
      return () => existingScript.removeEventListener("load", initMap);
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.dataset.googleMaps = "signup";
    script.addEventListener("load", initMap, { once: true });
    script.addEventListener("error", () => {
      setMessage(lang === "ta" ? "வரைபடத்தை ஏற்ற முடியவில்லை" : "Unable to load map");
    });
    document.head.appendChild(script);

    return () => {
      script.removeEventListener("load", initMap);
    };
  }, [apiKey]);

  const reverseGeocode = async (lat: number, lng: number) => {
    const geocoder = geocoderRef.current;
    if (!geocoder) return null;

    return new Promise<any>((resolve, reject) => {
      geocoder.geocode({ location: { lat, lng } }, (results: any, status: string) => {
        if (status === "OK" && results?.[0]) resolve(results[0]);
        else reject(new Error(status));
      });
    });
  };

  const selectLocation = async (lat: number, lng: number) => {
    if (mapRef.current && markerRef.current) {
      markerRef.current.setPosition({ lat, lng });
      mapRef.current.panTo({ lat, lng });
      mapRef.current.setZoom(15);
    }

    setLoading(true);
    try {
      const result = await reverseGeocode(lat, lng);
      const label = result?.formatted_address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      onChange({ label, latitude: lat, longitude: lng, placeId: result?.place_id });
      setQuery(label);
      setMessage(label);
    } catch {
      const label = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      onChange({ label, latitude: lat, longitude: lng });
      setQuery(label);
      setMessage(label);
    } finally {
      setLoading(false);
    }
  };

  const searchLocation = async (searchText = query.trim()) => {
    if (!searchText || !geocoderRef.current || !mapRef.current) return;
    setLoading(true);
    setMessage("");
    try {
      const placeResult = await new Promise<any>((resolve, reject) => {
        const service = placesServiceRef.current;
        if (!service) {
          reject(new Error("NO_PLACES_SERVICE"));
          return;
        }

        service.textSearch(
          {
            query: `${searchText}, ${district || "Tamil Nadu"}, India`,
            bounds: new google.maps.LatLngBounds(
              new google.maps.LatLng(TAMIL_NADU_BOUNDS.south, TAMIL_NADU_BOUNDS.west),
              new google.maps.LatLng(TAMIL_NADU_BOUNDS.north, TAMIL_NADU_BOUNDS.east),
            ),
            region: "in",
          },
          (results: any, status: string) => {
            if (status === "OK" && results?.[0]) resolve(results[0]);
            else reject(new Error(status));
          },
        );
      }).catch(async () => {
        return await new Promise<any>((resolve, reject) => {
          geocoderRef.current.geocode(
            { address: `${searchText}, ${district || "Tamil Nadu"}, India` },
            (results: any, status: string) => {
              if (status === "OK" && results?.[0]) resolve(results[0]);
              else reject(new Error(status));
            },
          );
        });
      });

      const locationResult = placeResult.geometry?.location;
      if (locationResult) await selectLocation(locationResult.lat(), locationResult.lng());
    } catch {
      setMessage(lang === "ta" ? "இடம் கிடைக்கவில்லை" : "Location not found");
    } finally {
      setLoading(false);
    }
  };

  if (!apiKey) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/40 p-3 text-sm text-muted-foreground">
        {lang === "ta"
          ? "வரைபட இடத் தேர்வுக்கு VITE_GOOGLE_MAPS_API_KEY தேவை."
          : "Set VITE_GOOGLE_MAPS_API_KEY to enable map-based location selection."}
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-border bg-muted/20 p-3">
      <div className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={lang === "ta" ? "இடத்தை தேடவும்" : "Search a location"}
        />
        <Button type="button" variant="secondary" onClick={searchLocation} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-background">
        <div ref={mapContainerRef} className="h-56 w-full" />
      </div>

      <div className="flex items-start gap-2 text-xs text-muted-foreground">
        <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary" />
        <div>
          <p className="font-medium text-foreground">
            {value?.label || (lang === "ta" ? "வரைபடத்தில் துல்லிய இடத்தைத் தேர்ந்தெடுக்கவும்" : "Pick an exact point on the map")}
          </p>
          {message && <p className="mt-0.5">{message}</p>}
          {!ready && <p className="mt-0.5">{lang === "ta" ? "வரைபடம் ஏற்றப்படுகிறது..." : "Loading map..."}</p>}
        </div>
      </div>
    </div>
  );
}
