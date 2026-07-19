"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, Suspense } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { QrCode, Users, Clock } from "lucide-react";

export default function LecturerScanPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" /></div>}>
      <LecturerScanContent />
    </Suspense>
  );
}

function LecturerScanContent() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  const [qrData, setQrData] = useState<any>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [checkedInCount, setCheckedInCount] = useState(0);
  const rotateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => { if (!isLoading && (!user || user.role !== "LECTURER")) router.push("/login"); }, [user, isLoading, router]);

  const startSession = async () => {
    if (!courseId) return;
    try {
      const semesterRes = await api.get("/semesters/active");
      const semesterId = semesterRes.data.data?.id;
      if (!semesterId) { alert("No active semester found"); return; }
      const res = await api.post("/qr/start", { courseId, semesterId });
      setQrData(res.data.data);
      setIsSessionActive(true);
      setTimeLeft(30);
      startRotation(res.data.data.sessionId);
    } catch (err: any) { alert(err.response?.data?.error || "Failed to start session"); }
  };

  const startRotation = (sessionId: string) => {
    if (rotateIntervalRef.current) clearInterval(rotateIntervalRef.current);
    rotateIntervalRef.current = setInterval(async () => {
      try {
        const res = await api.post(`/qr/rotate/${sessionId}`);
        setQrData((prev: any) => ({ ...prev, qrCode: res.data.data.qrCode, expiresAt: res.data.data.expiresAt }));
        setTimeLeft(30);
      } catch { stopSession(sessionId); }
    }, 30000);
  };

  const stopSession = async (sessionId?: string) => {
    const id = sessionId || qrData?.sessionId;
    if (!id) return;
    try { await api.post(`/qr/stop/${id}`); } catch {}
    setIsSessionActive(false); setQrData(null); setTimeLeft(30);
    if (rotateIntervalRef.current) clearInterval(rotateIntervalRef.current);
  };

  useEffect(() => {
    if (isSessionActive && timeLeft > 0) { const t = setTimeout(() => setTimeLeft(timeLeft - 1), 1000); return () => clearTimeout(t); }
  }, [isSessionActive, timeLeft]);

  useEffect(() => {
    if (qrData?.sessionId && courseId) {
      const poll = setInterval(async () => { try { const res = await api.get(`/attendance/course/${courseId}`); setCheckedInCount(res.data.data?.length || 0); } catch {} }, 5000);
      return () => clearInterval(poll);
    }
  }, [qrData, courseId]);

  useEffect(() => { return () => { if (rotateIntervalRef.current) clearInterval(rotateIntervalRef.current); }; }, []);

  if (isLoading || !user) return <div className="min-h-screen flex items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" /></div>;

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto space-y-6">
        <div><h1 className="text-2xl font-bold text-slate-900">QR Session</h1><p className="text-sm text-slate-500 mt-1">Display rotating QR code for students to scan</p></div>

        {!courseId ? (
          <Card><CardContent className="py-12 text-center"><p className="text-slate-500 mb-4">No course selected. Please select a course from your dashboard.</p><Button onClick={() => router.push("/lecturer/dashboard")} className="bg-slate-900 hover:bg-slate-800">Go to Dashboard</Button></CardContent></Card>
        ) : !isSessionActive ? (
          <Card className="border-dashed"><CardContent className="py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 mx-auto mb-6"><QrCode className="h-8 w-8 text-slate-400" /></div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Ready to start?</h3>
            <p className="text-sm text-slate-500 mb-6">This will generate a rotating QR code for attendance</p>
            <Button onClick={startSession} size="lg" className="bg-slate-900 hover:bg-slate-800">Start Session</Button>
          </CardContent></Card>
        ) : (
          <>
            <Card>
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <Badge variant="success" className="text-sm"><div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" /> Live</Badge>
                    <div className="flex items-center gap-1.5 text-sm text-slate-500"><Clock className="h-3.5 w-3.5" /> Refreshes in <span className={`font-bold ${timeLeft <= 10 ? "text-red-500" : "text-slate-900"}`}>{timeLeft}s</span></div>
                  </div>
                </div>
                <div className="flex justify-center mb-6">
                  <div className="relative p-4 bg-white rounded-2xl border-2 border-slate-200 shadow-lg">
                    {qrData?.qrCode && <img src={qrData.qrCode} alt="QR Code" className="w-64 h-64" />}
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-3 py-1 rounded-full font-medium">
                      {timeLeft}s until refresh
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Users className="h-5 w-5 text-slate-400" />
                    <span className="text-3xl font-bold text-slate-900">{checkedInCount}</span>
                  </div>
                  <p className="text-sm text-slate-500">students checked in</p>
                </div>
              </CardContent>
            </Card>
            <Button variant="destructive" className="w-full" onClick={() => stopSession()}>Stop Session</Button>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
