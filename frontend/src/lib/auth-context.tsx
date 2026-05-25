import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { MOCK_ACCOUNTS, type MockAccount } from "@/lib/mock-data";

export type Role = "student" | "teacher" | "district_admin" | "super_admin";

export interface Profile {
  id: string;
  full_name: string;
  emis_number: string | null;
  mobile_number?: string | null;
  district: string | null;
  school_name: string | null;
  class: string | null;
  section: string | null;
  language_preference: string;
  location_label?: string | null;
  location_latitude?: number | null;
  location_longitude?: number | null;
  location_place_id?: string | null;
}

interface AuthCtx {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  role: Role | null;
  loading: boolean;
  mock: boolean;
  setMockAccount: (account: MockAccount) => void;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);
const MOCK_AUTH_KEY = "kalvi_mock_auth";

function mockUser(account: MockAccount): User {
  return {
    id: account.profile.id,
    app_metadata: {},
    user_metadata: { full_name: account.profile.full_name },
    aud: "authenticated",
    created_at: new Date().toISOString(),
    email: account.email,
  } as User;
}

function mockSession(account: MockAccount): Session {
  const user = mockUser(account);
  return {
    access_token: `mock-${account.key}`,
    refresh_token: `mock-refresh-${account.key}`,
    expires_in: 60 * 60 * 24,
    token_type: "bearer",
    user,
  } as Session;
}

function getStoredMockAccount() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(MOCK_AUTH_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as MockAccount;
    if (parsed?.profile?.id && parsed.role) return parsed;
  } catch {
    return MOCK_ACCOUNTS.find((a) => a.key === raw) ?? null;
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [mock, setMock] = useState(false);

  const setMockAccount = (account: MockAccount) => {
    localStorage.setItem(MOCK_AUTH_KEY, JSON.stringify(account));
    setSession(mockSession(account));
    setProfile(account.profile);
    setRole(account.role);
    setMock(true);
  };

  const loadProfileAndRole = async (userId: string) => {
    const [{ data: p }, { data: r }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId).maybeSingle(),
    ]);
    setProfile(p as Profile | null);
    setRole((r?.role as Role | undefined) ?? null);
  };

  const refresh = async () => {
    const account = getStoredMockAccount();
    if (account) {
      setMockAccount(account);
      return;
    }
    if (session?.user) await loadProfileAndRole(session.user.id);
  };

  useEffect(() => {
    const account = getStoredMockAccount();
    if (account) {
      setSession(mockSession(account));
      setProfile(account.profile);
      setRole(account.role);
      setMock(true);
      setLoading(false);
      return;
    }

    // Listener FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user) {
        setTimeout(() => loadProfileAndRole(s.user.id), 0);
      } else {
        setProfile(null);
        setRole(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s?.user) loadProfileAndRole(s.user.id).finally(() => setLoading(false));
      else setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    localStorage.removeItem(MOCK_AUTH_KEY);
    if (!mock) await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    setRole(null);
    setMock(false);
  };

  return (
    <Ctx.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile,
        role,
        loading,
        mock,
        setMockAccount,
        signOut,
        refresh,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used inside AuthProvider");
  return c;
}

export function mobileToPhone(mobile: string): string {
  const digits = mobile.replace(/\D/g, "");
  return digits.startsWith("91") ? `+${digits}` : `+91${digits}`;
}

export function mobileToEmail(mobile: string): string {
  return `student.${mobile.replace(/\D/g, "")}@samacheer.app`;
}

export function isValidMobile(mobile: string): boolean {
  const digits = mobile.replace(/\D/g, "");
  // Accept 10-digit local numbers (e.g. 9876543210)
  // or 12-digit numbers that start with country code 91 (e.g. 919876543210)
  return digits.length === 10 || (digits.length === 12 && digits.startsWith("91"));
}
