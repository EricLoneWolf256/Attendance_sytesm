"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { Scan, CheckCircle2 } from "lucide-react";

export default function StudentScanPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [qrCode, setQrCode] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => { if (!isLoading && (!user || user.role !== "STUDENT")) router.push("/login"); }, [user, isLoading, router]);

  const handleCheckIn = async () => {
    if (!qrCode.trim()) { setMessage("Please enter a QR code"); setIsSuccess(false); return; }
    setIsScanning(true); setMessage("");
    try {
      const res = await api.post("/attendance/check-in", { qrCode: qrCode.trim() });
      setMessage(`Checked in successfully to ${res.data.data.course.name}!`);
      setIsSuccess(true); setQrCode("");
    } catch (err: any) { setMessage(err.response?.data?.error || "Check-in failed"); setIsSuccess(false); }
    finally { setIsScanning(false); }
  };

  if (isLoading || !user) return <div className="min-h-screen flex items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" /></div>;

  return (
    <DashboardLayout>
      <div className="max-w-md mx-auto space-y-6">
        <div><h1 className="text-2xl font-bold text-slate-900">Scan QR Code</h1><p className="text-sm text-slate-500 mt-1">Enter the code from your lecturer&apos;s screen</p></div>
        <Card>
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 mx-auto mb-4"><Scan className="h-8 w-8 text-slate-400" /></div>
              <h3 className="text-lg font-semibold text-slate-900">Mark Attendance</h3>
              <p className="text-sm text-slate-500 mt-1">Enter the code displayed by your lecturer</p>
            </div>

            {message && (
              <div className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm mb-4 ${isSuccess ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
                {isSuccess && <CheckCircle2 className="h-4 w-4 shrink-0" />}
                {message}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="qrCode">QR Code</Label>
                <Input id="qrCode" placeholder="Paste or type the QR code here" value={qrCode} onChange={(e) => setQrCode(e.target.value)} disabled={isScanning} className="h-11 text-center text-lg font-mono" />
              </div>
              <Button className="w-full h-11 bg-slate-900 hover:bg-slate-800" onClick={handleCheckIn} disabled={isScanning || !qrCode.trim()}>
                {isScanning ? "Checking in..." : "Check In"}
              </Button>
              <p className="text-xs text-center text-slate-400">QR codes rotate every 30 seconds</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
