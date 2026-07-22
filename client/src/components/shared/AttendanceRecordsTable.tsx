import type { AttendanceRecord } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { KeyRound, QrCode } from "lucide-react";

interface AttendanceRecordsTableProps {
  records: AttendanceRecord[];
}

export function AttendanceRecordsTable({
  records,
}: AttendanceRecordsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Attendance Records ({records.length} students)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {records.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-500">
            No attendance records yet. Waiting for students to sign in.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Reg Number</TableHead>
                <TableHead>Time Signed</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Method</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record, index) => (
                <TableRow key={record.id}>
                  <TableCell className="text-gray-500">
                    {index + 1}
                  </TableCell>
                  <TableCell className="font-medium text-gray-900">
                    {record.student?.firstName} {record.student?.lastName}
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {record.student?.studentNumber ?? "N/A"}
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {record.signedInAt?.toLocaleString() ?? "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={
                        record.status === "PRESENT" ? "success" : "warning"
                      }
                    >
                      {record.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={
                        record.signInMethod === "QR" ? "info" : "purple"
                      }
                    >
                      {record.signInMethod === "QR" ? (
                        <QrCode className="mr-1 h-3 w-3" />
                      ) : (
                        <KeyRound className="mr-1 h-3 w-3" />
                      )}
                      {record.signInMethod}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
