import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function getInitials(firstName: string, lastName: string) {
  return `${firstName[0]}${lastName[0]}`.toUpperCase();
}

export function getRoleColor(role: string) {
  switch (role) {
    case "ADMIN": return "bg-violet-100 text-violet-700";
    case "LECTURER": return "bg-blue-100 text-blue-700";
    case "STUDENT": return "bg-emerald-100 text-emerald-700";
    default: return "bg-slate-100 text-slate-700";
  }
}
