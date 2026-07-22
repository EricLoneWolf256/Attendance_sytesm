import { useState, useRef } from "react";
import { useSessions } from "@/hooks/useSessions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { QrCode, KeyRound, Camera, Calendar, MapPin, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function StudentCheckIn() {
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pinRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { openSessions } = useSessions();

  const activeSession = openSessions[0] ?? null;

  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    if (value && index < 5) {
      pinRefs.current[index + 1]?.focus();
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      pinRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    const pinValue = pin.join("");
    if (pinValue.length < 6) {
      toast.error("Please enter a valid 6-digit PIN.");
      return;
    }
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setIsSubmitting(false);
    setPin(["", "", "", "", "", ""]);
    toast.success("Signed in successfully!");
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Check In</h1>

      {activeSession && (
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Active Session</CardTitle>
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Live</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <span className="font-medium">{activeSession.courseCode}</span>
              <span className="text-gray-400">-</span>
              <span>{activeSession.courseName}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <Calendar className="w-3.5 h-3.5" />
              <span>{activeSession.date}</span>
              <Clock className="w-3.5 h-3.5 ml-2" />
              <span>{activeSession.startTime}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <MapPin className="w-3.5 h-3.5" />
              <span>{activeSession.venue}</span>
            </div>
            <p className="text-gray-600 pt-1">Topic: <span className="font-medium">{activeSession.topic}</span></p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="pin">
        <TabsList className="w-full">
          <TabsTrigger value="qr" className="flex-1">
            <QrCode className="w-4 h-4 mr-2" /> Scan QR Code
          </TabsTrigger>
          <TabsTrigger value="pin" className="flex-1">
            <KeyRound className="w-4 h-4 mr-2" /> Enter PIN
          </TabsTrigger>
        </TabsList>

        <TabsContent value="qr">
          <Card>
            <CardContent className="p-8">
              <div className="border-2 border-dashed border-gray-300 rounded-2xl h-64 flex flex-col items-center justify-center text-gray-400 hover:border-red-300 transition-colors">
                <Camera className="w-12 h-12 mb-3 text-gray-300" />
                <p className="font-medium text-gray-500">Point camera at QR code</p>
                <p className="text-sm text-gray-400 mt-1">Position the QR code within the frame</p>
              </div>
              <Button className="w-full mt-4 bg-red-600 hover:bg-red-700" disabled>
                <QrCode className="w-4 h-4 mr-2" /> Scan & Sign In
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pin">
          <Card>
            <CardContent className="p-8">
              <p className="text-center text-sm text-gray-500 mb-6">Enter the 6-digit PIN displayed by your lecturer</p>
              <div className="flex justify-center gap-2">
                {pin.map((digit, i) => (
                  <Input
                    key={i}
                    ref={(el) => { pinRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinChange(i, e.target.value)}
                    onKeyDown={(e) => handlePinKeyDown(i, e)}
                    className="w-12 h-14 text-center text-xl font-bold"
                  />
                ))}
              </div>
              <Button
                className="w-full mt-6 bg-red-600 hover:bg-red-700"
                onClick={handleSubmit}
                disabled={isSubmitting || pin.join("").length < 6}
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <KeyRound className="w-4 h-4 mr-2" />}
                Sign In
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
