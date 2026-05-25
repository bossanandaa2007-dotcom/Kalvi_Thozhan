import type { Profile, Role } from "./auth-context";

export type Material = {
  id: string;
  title: string;
  title_ta?: string;
  class: string;
  subject: string;
  subject_ta?: string;
  chapter?: string;
  type: string;
  language: "ta" | "en";
  medium?: string;
  url: string;
  source: string;
  created_at: string;
};

export type Video = {
  id: string;
  title: string;
  title_ta?: string;
  class: string;
  subject: string;
  subject_ta?: string;
  chapter?: string;
  url: string;
  source: string;
  thumbnail_url?: string;
  duration_minutes?: number;
  created_at: string;
};

export type EventItem = {
  id: string;
  title: string;
  title_ta?: string;
  description: string;
  event_date: string;
  event_time: string;
  venue: string;
  eligibility?: string;
  target_class?: string;
  district?: string;
  registration_url?: string;
};

export type Notice = {
  id: string;
  title: string;
  message: string;
  target_type: string;
  target_value?: string | null;
  created_at: string;
  read_status?: boolean;
};

export type ActivityLog = {
  id: string;
  user_id: string;
  user_name: string;
  school_name: string;
  district: string;
  class?: string | null;
  event_type: string;
  metadata?: Record<string, unknown>;
  created_at: string;
};

export type FeedbackItem = {
  id: string;
  student_id: string;
  category: string;
  message: string;
  status: string;
  response?: string;
  district?: string;
  created_at: string;
};

export type MockAccount = {
  key: string;
  email: string;
  password: string;
  role: Role;
  profile: Profile;
};

const now = new Date().toISOString();

export const MOCK_ACCOUNTS: MockAccount[] = [
  {
    key: "mockid",
    email: "student.mockid@samacheer.app",
    password: "student123",
    role: "student",
    profile: {
      id: "mock-student-10",
      full_name: "கவி அருள்",
      emis_number: "mockid",
      mobile_number: "9876543210",
      district: "Madurai",
      school_name: "Government Higher Secondary School, Madurai",
      class: "10",
      section: "A",
      language_preference: "ta",
    },
  },
  {
    key: "mock5",
    email: "student.mock5@samacheer.app",
    password: "student123",
    role: "student",
    profile: {
      id: "mock-student-5",
      full_name: "யாழினி",
      emis_number: "mock5",
      mobile_number: "9876500005",
      district: "Chennai",
      school_name: "Chennai Primary School, Saidapet",
      class: "5",
      section: "B",
      language_preference: "ta",
    },
  },
  {
    key: "mock12",
    email: "student.mock12@samacheer.app",
    password: "student123",
    role: "student",
    profile: {
      id: "mock-student-12",
      full_name: "Nila Kumar",
      emis_number: "mock12",
      mobile_number: "9876500012",
      district: "Coimbatore",
      school_name: "Government Girls HSS, Coimbatore",
      class: "12",
      section: "C",
      language_preference: "en",
    },
  },
  {
    key: "teacher",
    email: "teacher@mock.test",
    password: "teacher123",
    role: "teacher",
    profile: {
      id: "mock-teacher",
      full_name: "Meena Teacher",
      emis_number: null,
      mobile_number: "9876500020",
      district: "Madurai",
      school_name: "Government Higher Secondary School, Madurai",
      class: null,
      section: null,
      language_preference: "ta",
    },
  },
  {
    key: "admin",
    email: "admin@mock.test",
    password: "admin123",
    role: "district_admin",
    profile: {
      id: "mock-admin",
      full_name: "Madurai District Admin",
      emis_number: null,
      mobile_number: "9876500030",
      district: "Madurai",
      school_name: null,
      class: null,
      section: null,
      language_preference: "ta",
    },
  },
  {
    key: "super",
    email: "super@mock.test",
    password: "admin123",
    role: "super_admin",
    profile: {
      id: "mock-super",
      full_name: "State Super Admin",
      emis_number: null,
      mobile_number: "9876500040",
      district: "Tamil Nadu",
      school_name: null,
      class: null,
      section: null,
      language_preference: "en",
    },
  },
];

export const MOCK_SCHOOLS = [
  {
    id: "school-1",
    name: "Government Higher Secondary School, Madurai",
    district: "Madurai",
    type: "Government",
  },
  {
    id: "school-2",
    name: "Chennai Primary School, Saidapet",
    district: "Chennai",
    type: "Government",
  },
  {
    id: "school-3",
    name: "Government Girls HSS, Coimbatore",
    district: "Coimbatore",
    type: "Government",
  },
  {
    id: "school-4",
    name: "Panchayat Union Middle School, Salem",
    district: "Salem",
    type: "Government",
  },
  {
    id: "school-5",
    name: "Municipal Higher Secondary School, Tirunelveli",
    district: "Tirunelveli",
    type: "Government",
  },
  {
    id: "school-6",
    name: "Aided Higher Secondary School, Trichy",
    district: "Tiruchirappalli",
    type: "Aided",
  },
  {
    id: "school-7",
    name: "Aided Girls Higher Secondary School, Chennai",
    district: "Chennai",
    type: "Aided",
  },
];

const publicPdf = "https://www.tntextbooks.in/p/school-books.html";
const guideUrl = "https://www.kalviexpress.in/";
const papersUrl = "https://dge.tn.gov.in/";

export const SEED_MATERIALS: Material[] = [
  {
    id: "m5-tamil-text",
    title: "Class 5 Tamil Textbook",
    title_ta: "வகுப்பு 5 தமிழ் பாடநூல்",
    class: "5",
    subject: "Tamil",
    subject_ta: "தமிழ்",
    chapter: "Term 1",
    type: "textbook",
    language: "ta",
    medium: "Tamil",
    url: publicPdf,
    source: "TN Textbooks",
    created_at: now,
  },
  {
    id: "m5-math-guide",
    title: "Class 5 Maths Guide",
    title_ta: "வகுப்பு 5 கணிதம் வழிகாட்டி",
    class: "5",
    subject: "Mathematics",
    subject_ta: "கணிதம்",
    chapter: "Numbers",
    type: "guide",
    language: "ta",
    medium: "Tamil",
    url: guideUrl,
    source: "Public guide link",
    created_at: now,
  },
  {
    id: "m5-evs-bookback",
    title: "Class 5 EVS Book Back Answers",
    title_ta: "வகுப்பு 5 சுற்றுச்சூழல் பின்விடைகள்",
    class: "5",
    subject: "EVS",
    subject_ta: "சுற்றுச்சூழல்",
    chapter: "Plants",
    type: "book_back",
    language: "ta",
    medium: "Tamil",
    url: guideUrl,
    source: "Public notes",
    created_at: now,
  },
  {
    id: "m5-worksheet",
    title: "Class 5 Practice Worksheet",
    title_ta: "வகுப்பு 5 பயிற்சி தாள்",
    class: "5",
    subject: "English",
    subject_ta: "ஆங்கிலம்",
    chapter: "Grammar",
    type: "worksheet",
    language: "en",
    medium: "English",
    url: guideUrl,
    source: "Public worksheet",
    created_at: now,
  },
  {
    id: "m10-science-text",
    title: "Class 10 Science Textbook",
    title_ta: "வகுப்பு 10 அறிவியல் பாடநூல்",
    class: "10",
    subject: "Science",
    subject_ta: "அறிவியல்",
    chapter: "Electricity",
    type: "textbook",
    language: "ta",
    medium: "Tamil",
    url: publicPdf,
    source: "TN Textbooks",
    created_at: now,
  },
  {
    id: "m10-math-bookback",
    title: "Class 10 Maths Book Back Answers",
    title_ta: "வகுப்பு 10 கணிதம் பின்விடைகள்",
    class: "10",
    subject: "Mathematics",
    subject_ta: "கணிதம்",
    chapter: "Algebra",
    type: "book_back",
    language: "ta",
    medium: "Tamil",
    url: guideUrl,
    source: "Public notes",
    created_at: now,
  },
  {
    id: "m10-model-paper",
    title: "Class 10 Model Question Paper",
    title_ta: "வகுப்பு 10 மாதிரி வினாத்தாள்",
    class: "10",
    subject: "Social Science",
    subject_ta: "சமூக அறிவியல்",
    chapter: "Public Exam",
    type: "model_paper",
    language: "en",
    medium: "English",
    url: papersUrl,
    source: "DGE Tamil Nadu",
    created_at: now,
  },
  {
    id: "m10-revision",
    title: "Class 10 Revision Notes",
    title_ta: "வகுப்பு 10 மீளாய்வு குறிப்புகள்",
    class: "10",
    subject: "English",
    subject_ta: "ஆங்கிலம்",
    chapter: "Poetry",
    type: "revision_pdf",
    language: "en",
    medium: "English",
    url: guideUrl,
    source: "Public revision link",
    created_at: now,
  },
  {
    id: "m12-physics-text",
    title: "Class 12 Physics Textbook",
    title_ta: "வகுப்பு 12 இயற்பியல் பாடநூல்",
    class: "12",
    subject: "Physics",
    subject_ta: "இயற்பியல்",
    chapter: "Electrostatics",
    type: "textbook",
    language: "ta",
    medium: "Tamil",
    url: publicPdf,
    source: "TN Textbooks",
    created_at: now,
  },
  {
    id: "m12-chem-important",
    title: "Class 12 Chemistry Important Questions",
    title_ta: "வகுப்பு 12 வேதியியல் முக்கிய வினாக்கள்",
    class: "12",
    subject: "Chemistry",
    subject_ta: "வேதியியல்",
    chapter: "Organic Chemistry",
    type: "important_questions",
    language: "ta",
    medium: "Tamil",
    url: guideUrl,
    source: "Public questions",
    created_at: now,
  },
  {
    id: "m12-biology-prev",
    title: "Class 12 Biology Previous Year Paper",
    title_ta: "வகுப்பு 12 உயிரியல் முந்தைய வினாத்தாள்",
    class: "12",
    subject: "Biology",
    subject_ta: "உயிரியல்",
    chapter: "Public Exam",
    type: "previous_year",
    language: "en",
    medium: "English",
    url: papersUrl,
    source: "DGE Tamil Nadu",
    created_at: now,
  },
  {
    id: "m12-revision",
    title: "Class 12 Public Exam Revision",
    title_ta: "வகுப்பு 12 பொதுத்தேர்வு மீளாய்வு",
    class: "12",
    subject: "Mathematics",
    subject_ta: "கணிதம்",
    chapter: "Calculus",
    type: "revision_pdf",
    language: "en",
    medium: "English",
    url: guideUrl,
    source: "Public revision link",
    created_at: now,
  },
];

export const SEED_VIDEOS: Video[] = [
  {
    id: "v5-math",
    title: "Class 5 Maths Lesson",
    title_ta: "வகுப்பு 5 கணிதப் பாடம்",
    class: "5",
    subject: "Mathematics",
    subject_ta: "கணிதம்",
    chapter: "Fractions",
    url: "https://www.youtube.com/watch?v=2UrcUfBizyw",
    source: "YouTube / Kalvi TV",
    duration_minutes: 18,
    created_at: now,
  },
  {
    id: "v10-science",
    title: "Class 10 Science Electricity",
    title_ta: "வகுப்பு 10 அறிவியல் மின்சாரம்",
    class: "10",
    subject: "Science",
    subject_ta: "அறிவியல்",
    chapter: "Electricity",
    url: "https://www.youtube.com/watch?v=VMS1gNnp_zs",
    source: "YouTube / Kalvi TV",
    duration_minutes: 24,
    created_at: now,
  },
  {
    id: "v10-social",
    title: "Class 10 Social Science Revision",
    title_ta: "வகுப்பு 10 சமூக அறிவியல் மீளாய்வு",
    class: "10",
    subject: "Social Science",
    subject_ta: "சமூக அறிவியல்",
    chapter: "History",
    url: "https://www.youtube.com/watch?v=ysz5S6PUM-U",
    source: "YouTube",
    duration_minutes: 15,
    created_at: now,
  },
  {
    id: "v12-physics",
    title: "Class 12 Physics Electrostatics",
    title_ta: "வகுப்பு 12 இயற்பியல் மின்னியல்",
    class: "12",
    subject: "Physics",
    subject_ta: "இயற்பியல்",
    chapter: "Electrostatics",
    url: "https://www.youtube.com/watch?v=H14bBuluwB8",
    source: "YouTube / SWAYAM style embed",
    duration_minutes: 32,
    created_at: now,
  },
];

export const SEED_EVENTS: EventItem[] = [
  {
    id: "event-sports",
    title: "Zonal Athletics Meet",
    title_ta: "மண்டல தடகளப் போட்டி",
    description: "Track and field events for school teams.",
    event_date: "2026-07-12",
    event_time: "09:00",
    venue: "District Stadium, Madurai",
    eligibility: "Classes 10 and 12",
    target_class: "10,12",
    district: "Madurai",
    registration_url: "https://tnschools.gov.in/",
  },
  {
    id: "event-science",
    title: "Science Exhibition",
    title_ta: "அறிவியல் கண்காட்சி",
    description: "Student science models and project display.",
    event_date: "2026-08-05",
    event_time: "10:30",
    venue: "Government HSS, Coimbatore",
    eligibility: "Classes 5, 10, 12",
    target_class: "5,10,12",
    district: "Coimbatore",
  },
  {
    id: "event-holiday-pongal",
    title: "Pongal Holiday",
    title_ta: "பொங்கல் விடுமுறை",
    description: "Tamil Nadu festival holiday.",
    event_date: "2026-01-15",
    event_time: "All day",
    venue: "Tamil Nadu",
    district: "Tamil Nadu",
  },
  {
    id: "event-holiday-republic",
    title: "Republic Day",
    title_ta: "குடியரசு தினம்",
    description: "General government holiday.",
    event_date: "2026-01-26",
    event_time: "All day",
    venue: "Tamil Nadu",
    district: "Tamil Nadu",
  },
  {
    id: "event-holiday-tamil-new-year",
    title: "Tamil New Year",
    title_ta: "தமிழ் புத்தாண்டு",
    description: "Tamil Nadu festival holiday.",
    event_date: "2026-04-14",
    event_time: "All day",
    venue: "Tamil Nadu",
    district: "Tamil Nadu",
  },
  {
    id: "event-holiday-may-day",
    title: "May Day",
    title_ta: "மே தினம்",
    description: "General government holiday.",
    event_date: "2026-05-01",
    event_time: "All day",
    venue: "Tamil Nadu",
    district: "Tamil Nadu",
  },
  {
    id: "event-holiday-independence",
    title: "Independence Day",
    title_ta: "சுதந்திர தினம்",
    description: "General government holiday.",
    event_date: "2026-08-15",
    event_time: "All day",
    venue: "Tamil Nadu",
    district: "Tamil Nadu",
  },
  {
    id: "event-holiday-gandhi",
    title: "Gandhi Jayanthi",
    title_ta: "காந்தி ஜெயந்தி",
    description: "General government holiday.",
    event_date: "2026-10-02",
    event_time: "All day",
    venue: "Tamil Nadu",
    district: "Tamil Nadu",
  },
  {
    id: "event-holiday-ayudha",
    title: "Ayudha Puja",
    title_ta: "ஆயுத பூஜை",
    description: "Tamil Nadu festival holiday.",
    event_date: "2026-10-19",
    event_time: "All day",
    venue: "Tamil Nadu",
    district: "Tamil Nadu",
  },
  {
    id: "event-holiday-vijayadashami",
    title: "Vijayadashami",
    title_ta: "விஜயதசமி",
    description: "Tamil Nadu festival holiday.",
    event_date: "2026-10-20",
    event_time: "All day",
    venue: "Tamil Nadu",
    district: "Tamil Nadu",
  },
  {
    id: "event-holiday-deepavali",
    title: "Deepavali",
    title_ta: "தீபாவளி",
    description: "Tamil Nadu festival holiday.",
    event_date: "2026-11-09",
    event_time: "All day",
    venue: "Tamil Nadu",
    district: "Tamil Nadu",
  },
  {
    id: "event-holiday-christmas",
    title: "Christmas",
    title_ta: "கிறிஸ்துமஸ்",
    description: "General government holiday.",
    event_date: "2026-12-25",
    event_time: "All day",
    venue: "Tamil Nadu",
    district: "Tamil Nadu",
  },
];

export const SEED_NOTIFICATIONS: Notice[] = [
  {
    id: "notice-rain",
    title: "Rain Leave Alert",
    message: "Check district notices for rain leave updates before travelling to school.",
    target_type: "district",
    target_value: "Madurai",
    created_at: now,
    read_status: false,
  },
  {
    id: "notice-upload",
    title: "New Class 10 Materials",
    message: "Science revision notes and model papers were added.",
    target_type: "class",
    target_value: "10",
    created_at: now,
    read_status: false,
  },
  {
    id: "notice-scholarship",
    title: "Scholarship Notice",
    message: "Scholarship application window is open for eligible students.",
    target_type: "all",
    created_at: now,
    read_status: true,
  },
];

export const SEED_ACTIVITY: ActivityLog[] = [
  {
    id: "act-1",
    user_id: "mock-student-10",
    user_name: "கவி அருள்",
    school_name: "Government Higher Secondary School, Madurai",
    district: "Madurai",
    class: "10",
    event_type: "login",
    created_at: now,
    metadata: { mock: true },
  },
  {
    id: "act-2",
    user_id: "mock-student-5",
    user_name: "யாழினி",
    school_name: "Chennai Primary School, Saidapet",
    district: "Chennai",
    class: "5",
    event_type: "pdf_open",
    created_at: now,
    metadata: { material: "Class 5 Tamil Textbook" },
  },
];

export const SEED_FEEDBACK: FeedbackItem[] = [
  {
    id: "fb-1",
    student_id: "mock-student-10",
    category: "content",
    message: "Class 10 Maths guide link needs chapter-wise labels.",
    status: "open",
    district: "Madurai",
    created_at: now,
  },
];

function key(name: string) {
  return `kalvi_${name}`;
}

export function getLocalItems<T>(name: string, seed: T[]): T[] {
  if (typeof window === "undefined") return seed;
  const raw = localStorage.getItem(key(name));
  if (!raw) return seed;
  try {
    return [...JSON.parse(raw), ...seed] as T[];
  } catch {
    return seed;
  }
}

export function addLocalItem<T extends { id: string }>(name: string, item: T) {
  if (typeof window === "undefined") return;
  const raw = localStorage.getItem(key(name));
  const existing = raw ? JSON.parse(raw) : [];
  localStorage.setItem(key(name), JSON.stringify([item, ...existing]));
  window.dispatchEvent(new CustomEvent(`kalvi:${name}`, { detail: item }));
}

export function updateLocalItem<T extends { id: string }>(
  name: string,
  id: string,
  patch: Partial<T>,
) {
  if (typeof window === "undefined") return;
  const raw = localStorage.getItem(key(name));
  const existing = raw ? JSON.parse(raw) : [];
  localStorage.setItem(
    key(name),
    JSON.stringify(existing.map((item: T) => (item.id === id ? { ...item, ...patch } : item))),
  );
  window.dispatchEvent(new CustomEvent(`kalvi:${name}`, { detail: { id, patch } }));
}

export function deleteLocalItem(name: string, id: string) {
  if (typeof window === "undefined") return;
  const raw = localStorage.getItem(key(name));
  const existing = raw ? JSON.parse(raw) : [];
  localStorage.setItem(
    key(name),
    JSON.stringify(existing.filter((item: { id: string }) => item.id !== id)),
  );
  window.dispatchEvent(new CustomEvent(`kalvi:${name}`, { detail: { id } }));
}

export function findMockStudent(mobile: string, password?: string) {
  const normalized = mobile.replace(/\D/g, "");
  return MOCK_ACCOUNTS.find((a) => {
    if (a.role !== "student") return false;
    const mobileMatch =
      a.profile.mobile_number?.replace(/\D/g, "") === normalized ||
      a.key.toLowerCase() === mobile.trim().toLowerCase();
    return mobileMatch && (!password || a.password === password);
  });
}

export function findMockByEmis(emis: string, password?: string) {
  const normalized = emis.trim().toLowerCase();
  return MOCK_ACCOUNTS.find((a) => {
    if (a.role !== "student") return false;
    const emisMatch = (a.profile.emis_number ?? "").toString().toLowerCase() === normalized || a.key === normalized;
    return emisMatch && (!password || a.password === password);
  });
}

export function findMockStaff(email: string, password?: string) {
  const normalized = email.trim().toLowerCase();
  return MOCK_ACCOUNTS.find(
    (a) =>
      (a.email === normalized || a.key === normalized) && (!password || a.password === password),
  );
}

export function logMockActivity(
  profile: Profile,
  event_type = "login",
  metadata: Record<string, unknown> = {},
) {
  const row: ActivityLog = {
    id: `mock-activity-${Date.now()}`,
    user_id: profile.id,
    user_name: profile.full_name,
    school_name: profile.school_name ?? "State office",
    district: profile.district ?? "Tamil Nadu",
    class: profile.class,
    event_type,
    metadata: { mock: true, ...metadata },
    created_at: new Date().toISOString(),
  };
  addLocalItem("activity", row);
  return row;
}
