import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, UserCheck, UserX, TrendingUp } from "lucide-react";

interface StatCard {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  bg: string;
}

interface SessionStatsCardsProps {
  totalEnrolled: number;
  signedIn: number;
  absent: number;
  attendancePct: number;
  showProgress?: boolean;
}

export function SessionStatsCards({
  totalEnrolled,
  signedIn,
  absent,
  attendancePct,
  showProgress = true,
}: SessionStatsCardsProps) {
  const stats: StatCard[] = [
    {
      label: "Total Enrolled",
      value: totalEnrolled,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Signed In",
      value: signedIn,
      icon: UserCheck,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Absent",
      value: absent,
      icon: UserX,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      label: "Attendance %",
      value: `${attendancePct}%`,
      icon: TrendingUp,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2 ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
            {stat.label === "Attendance %" && showProgress && (
              <div className="mt-2">
                <Progress value={attendancePct} />
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
