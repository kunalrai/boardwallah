import { readFileSync } from "node:fs";
import { join } from "node:path";
import { contentDir } from "./paths";

export type SubjectId = "maths" | "science" | "social_science" | "english" | "hindi";

export interface Provider {
  id: string;
  version: string;
  last_updated: string;
  name: string;
  tutor_name: string;
  qualifications: string[];
  experience_years: number;
  teaching_mode: ("home_visit" | "online")[];
  boards: string[];
  classes: number[];
  subjects: SubjectId[];
  languages: string[];
  service_localities: string[];
  availability: { timezone: string; days: string[]; window: string };
  contact: { whatsapp: string; email: string };
  trial: { available: boolean; duration_minutes: number; fee_paise: number; currency: string };
  policies: { refund: string; cancellation: string; privacy_url: string };
}

export interface Subject {
  id: SubjectId;
  board: string;
  class: number;
  name: string;
}

export interface Plan {
  id: string;
  name: string;
  type: "monthly" | "crash_course";
  price_paise: number;
  currency: string;
  subjects: SubjectId[];
  sessions_per_week?: number;
  session_minutes: number;
  duration_days?: number;
  cancellation: string;
}

export interface Content {
  provider: Provider;
  subjects: Subject[];
  plans: Plan[];
}

let cached: Content | undefined;

export function loadContent(): Content {
  if (cached) return cached;
  const read = <T>(name: string): T =>
    JSON.parse(readFileSync(join(contentDir, name), "utf8")) as T;
  const provider = read<Provider>("provider.json");
  const subjectFile = read<{ subjects: Subject[] }>("subjects.json");
  const planFile = read<{ plans: Plan[] }>("plans.json");
  cached = { provider, subjects: subjectFile.subjects, plans: planFile.plans };
  return cached;
}

export function subjectNames(content: Content): Record<string, string> {
  return Object.fromEntries(content.subjects.map((subject) => [subject.id, subject.name]));
}

export function formatPrice(paise: number, currency = "INR"): string {
  if (paise === 0) return `0 ${currency}`;
  const amount = (paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 2 });
  return `${currency} ${amount}`;
}

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  weekday: "short",
  day: "numeric",
  month: "short",
});

const timeFormatter = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  hour: "numeric",
  minute: "2-digit",
});

export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

export function formatTime(iso: string): string {
  return timeFormatter.format(new Date(iso));
}

export function formatWindow(iso: string): string {
  return `${formatDate(iso)}, ${formatTime(iso)}`;
}

export function whatsappLink(number: string, text: string): string {
  return `https://wa.me/${number.replace(/^\+/, "")}?text=${encodeURIComponent(text)}`;
}
