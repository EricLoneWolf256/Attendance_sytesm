"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  QrCode,
  Shield,
  BarChart3,
  Users,
  Clock,
  CheckCircle2,
  ArrowRight,
  Zap,
  Globe,
  Lock,
} from "lucide-react";

export default function Home() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.role === "ADMIN") router.push("/admin/dashboard");
      else if (user.role === "LECTURER") router.push("/lecturer/dashboard");
      else router.push("/student/dashboard");
    }
  }, [isAuthenticated, user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <header className="fixed top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white font-bold text-sm">
              UGM
            </div>
            <span className="text-lg font-bold text-slate-900">AttendEase</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">How It Works</a>
            <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Pricing</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/login">
              <Button size="sm" className="bg-slate-900 hover:bg-slate-800">
                Get Started <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm text-slate-600 shadow-sm">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              Built for Uganda Martyrs University
            </div>
            <h1 className="text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
              Smart attendance,
              <br />
              <span className="bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                zero paperwork
              </span>
            </h1>
            <p className="mt-6 text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              QR code-based attendance tracking with enrollment verification.
              Fast, secure, and impossible to cheat. Built for modern universities.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="/login">
                <Button size="lg" className="bg-slate-900 hover:bg-slate-800 px-8">
                  Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button size="lg" variant="outline" className="px-8">
                  See How It Works
                </Button>
              </a>
            </div>
          </div>

          {/* Dashboard preview */}
          <div className="mt-16 mx-auto max-w-5xl">
            <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-200/50">
              <div className="rounded-xl bg-slate-50 p-8">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="rounded-lg bg-white p-4 border border-slate-200">
                    <p className="text-sm text-slate-500">Total Students</p>
                    <p className="text-2xl font-bold text-slate-900">1,247</p>
                    <p className="text-xs text-emerald-600 font-medium">+12% this semester</p>
                  </div>
                  <div className="rounded-lg bg-white p-4 border border-slate-200">
                    <p className="text-sm text-slate-500">Attendance Rate</p>
                    <p className="text-2xl font-bold text-slate-900">87.3%</p>
                    <p className="text-xs text-emerald-600 font-medium">+3.2% vs last semester</p>
                  </div>
                  <div className="rounded-lg bg-white p-4 border border-slate-200">
                    <p className="text-sm text-slate-500">Active Courses</p>
                    <p className="text-2xl font-bold text-slate-900">64</p>
                    <p className="text-xs text-slate-500">Across 8 faculties</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-white p-4 border border-slate-200">
                    <p className="text-sm font-medium text-slate-700 mb-3">Recent Check-ins</p>
                    <div className="space-y-2">
                      {["John Doe - CS101", "Jane Smith - MATH201", "Peter Okello - ENG102"].map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">{item}</span>
                          <span className="text-xs text-slate-400">{i + 1}m ago</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-lg bg-white p-4 border border-slate-200">
                    <p className="text-sm font-medium text-slate-700 mb-3">QR Sessions Today</p>
                    <div className="space-y-2">
                      {["CS101 - 45/48 checked in", "MATH201 - 32/35 checked in", "ENG102 - 28/30 checked in"].map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">{item}</span>
                          <span className="text-xs text-emerald-500 font-medium">Active</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logos */}
      <section className="py-12 border-y border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-center text-sm font-medium text-slate-400 mb-8">
            Trusted by departments across the university
          </p>
          <div className="flex items-center justify-center gap-12 text-slate-400">
            {["Faculty of Science", "Faculty of Computing", "Faculty of Education", "Faculty of Business"].map((name) => (
              <span key={name} className="text-sm font-medium">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              Everything you need
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              A complete attendance management system designed for universities.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: QrCode,
                title: "Rotating QR Codes",
                description: "QR codes refresh every 30 seconds, making them impossible to share or screenshot.",
              },
              {
                icon: Shield,
                title: "Enrollment Verification",
                description: "Only students enrolled in a course can check in. No proxy attendance possible.",
              },
              {
                icon: BarChart3,
                title: "Real-time Analytics",
                description: "Live attendance tracking with comprehensive reports by course, faculty, or student.",
              },
              {
                icon: Users,
                title: "Multi-role Access",
                description: "Separate dashboards for admins, lecturers, and students with role-based permissions.",
              },
              {
                icon: Clock,
                title: "Instant Check-in",
                description: "Students scan and check in within seconds. No paperwork, no delays.",
              },
              {
                icon: Globe,
                title: "Works Offline",
                description: "Progressive Web App that works even with poor connectivity on campus.",
              },
            ].map((feature) => (
              <div key={feature.title} className="group rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:shadow-lg hover:shadow-slate-200/50 hover:border-slate-300">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-6 bg-slate-50">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              How it works
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Three simple steps to track attendance
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Lecturer starts session",
                description: "Lecturer clicks 'Start QR Session' and a rotating QR code appears on screen.",
              },
              {
                step: "02",
                title: "Students scan the code",
                description: "Students open the app, scan the QR code, and attendance is recorded instantly.",
              },
              {
                step: "03",
                title: "Track and report",
                description: "View real-time attendance, generate reports, and export data for the semester.",
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="text-6xl font-bold text-slate-200 mb-4">{item.step}</div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-slate-900 sm:text-5xl">
            Ready to go digital?
          </h2>
          <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto">
            Join universities already using AttendEase to manage attendance.
            Free for up to 100 students.
          </p>
          <div className="mt-10">
            <Link href="/login">
              <Button size="lg" className="bg-slate-900 hover:bg-slate-800 px-10">
                Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12 px-6">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white font-bold text-xs">
              UGM
            </div>
            <span className="text-sm font-semibold text-slate-900">AttendEase</span>
          </div>
          <p className="text-sm text-slate-500">
            &copy; 2026 Uganda Martyrs University. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
