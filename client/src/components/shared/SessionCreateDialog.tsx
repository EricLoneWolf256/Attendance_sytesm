import type { CourseOffering } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { SessionFormData } from "@/hooks/useSessions";

interface SessionCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: SessionFormData;
  onFieldChange: <K extends keyof SessionFormData>(
    field: K,
    value: SessionFormData[K]
  ) => void;
  onSubmit: () => void;
  courseOfferings: CourseOffering[];
  courseNameMap?: Record<string, string>;
}

export function SessionCreateDialog({
  open,
  onOpenChange,
  formData,
  onFieldChange,
  onSubmit,
  courseOfferings,
  courseNameMap = {},
}: SessionCreateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Start New Session</DialogTitle>
          <DialogDescription>
            Create a new attendance session for your class.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Course Offering
            </label>
            <select
              value={formData.courseOfferingId}
              onChange={(e) => onFieldChange("courseOfferingId", e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Select course</option>
              {courseOfferings.map((co) => (
                <option key={co.id} value={co.id}>
                  {courseNameMap[co.id] ?? co.id}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Date
              </label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => onFieldChange("date", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Start Time
              </label>
              <Input
                type="time"
                value={formData.startTime}
                onChange={(e) => onFieldChange("startTime", e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Mode
            </label>
            <select
              value={formData.modeOfTeaching}
              onChange={(e) =>
                onFieldChange(
                  "modeOfTeaching",
                  e.target.value
                )
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="PHYSICAL">Physical</option>
              <option value="ONLINE">Online</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Venue
            </label>
            <Input
              placeholder="e.g. Room 301"
              value={formData.venueId ?? ""}
              onChange={(e) => onFieldChange("venueId", e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Topic
            </label>
            <Input
              placeholder="e.g. Binary Search Trees"
              value={formData.topic}
              onChange={(e) => onFieldChange("topic", e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit}>Start Session</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
