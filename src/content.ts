import { readFileSync } from "node:fs";
import { join } from "node:path";

export type SubjectId = "maths" | "science" | "social_science" | "english" | "hindi";
export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export interface Provider {
  id: string;
  version: string;
  last_updated: string;
  name: string;
  tutor_name: string;
  qualifications: string[];
  experience_years: number;
  teaching_mode: ("home_visit" | "online")[];
  boards: "CBSE"[];
  classes: 10[];
  subjects: SubjectId[];
  languages: string[];
  service_localities: string[];
  availability: {
    timezone: "Asia/Kolkata";
    days: Weekday[];
    window: string;
  };
  contact: {
    whatsapp: string;
    email: string;
  };
  trial: {
    available: boolean;
    duration_minutes: number;
    fee_paise: number;
    currency: "INR";
  };
  policies: {
    refund: string;
    cancellation: string;
    privacy_url: string;
  };
}

export interface Subject {
  id: SubjectId;
  board: "CBSE";
  class: 10;
  name: string;
  chapters_url?: string;
}

export interface Plan {
  id: string;
  name: string;
  type: "monthly" | "per_subject" | "crash_course";
  price_paise: number;
  currency: "INR";
  subjects?: SubjectId[];
  sessions_per_week?: number;
  session_minutes?: number;
  duration_days?: number;
  cancellation: string;
}

export interface SubjectsContent {
  version: string;
  board: "CBSE";
  class: 10;
  subjects: Subject[];
}

export interface PlansContent {
  version: string;
  last_updated: string;
  plans: Plan[];
}

export interface Content {
  provider: Provider;
  subjects: SubjectsContent;
  plans: PlansContent;
  subjectsById: Map<string, Subject>;
}

export function loadContent(contentDir: string): Content {
  const read = <T>(name: string): T => JSON.parse(readFileSync(join(contentDir, name), "utf8")) as T;
  const provider = read<Provider>("provider.json");
  const subjects = read<SubjectsContent>("subjects.json");
  const plans = read<PlansContent>("plans.json");
  return {
    provider,
    subjects,
    plans,
    subjectsById: new Map(subjects.subjects.map((subject) => [subject.id, subject])),
  };
}
