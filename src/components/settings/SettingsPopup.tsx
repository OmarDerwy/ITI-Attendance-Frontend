import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAbsenceThresholds } from "@/api/attendance";

interface SettingsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: {
    unexcusedThreshold: number;
    excusedThreshold: number;
    programType: string;
  }) => Promise<void>;
}

interface Thresholds {
  nine_months: {
    excused: number;
    unexcused: number;
  };
  intensive: {
    excused: number;
    unexcused: number;
  };
}

const SettingsPopup = ({ isOpen, onClose, onSave }: SettingsPopupProps) => {
  const [unexcusedThreshold, setUnexcusedThreshold] = useState<number>(3);
  const [excusedThreshold, setExcusedThreshold] = useState<number>(5);
  const [programType, setProgramType] = useState<string>("nine_months");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [thresholds, setThresholds] = useState<Thresholds | null>(null);

  useEffect(() => {
    const fetchThresholds = async () => {
      try {
        const data = await getAbsenceThresholds();
        setThresholds(data);
        if (data) {
          setUnexcusedThreshold(data[programType].unexcused);
          setExcusedThreshold(data[programType].excused);
        }
      } catch (err) {
        setError("Failed to fetch current thresholds");
        console.error(err);
      }
    };

    if (isOpen) {
      fetchThresholds();
    }
  }, [isOpen]);

  useEffect(() => {
    if (thresholds) {
      setUnexcusedThreshold(thresholds[programType as keyof Thresholds].unexcused);
      setExcusedThreshold(thresholds[programType as keyof Thresholds].excused);
    }
  }, [programType, thresholds]);  

  const handleProgramTypeChange = (value: string) => {
    setProgramType(value);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await onSave({
        unexcusedThreshold,
        excusedThreshold,
        programType,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Attendance Settings</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="programType">Program Type</Label>
            <Select
              value={programType}
              onValueChange={handleProgramTypeChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select program type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nine_months">Nine Months</SelectItem>
                <SelectItem value="intensive">Intensive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="unexcusedThreshold">Unexcused Absence Threshold</Label>
            <Input
              id="unexcusedThreshold"
              type="number"
              min="1"
              value={unexcusedThreshold}
              onChange={(e) => setUnexcusedThreshold(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="excusedThreshold">Excused Absence Threshold</Label>
            <Input
              id="excusedThreshold"
              type="number"
              min="1"
              value={excusedThreshold}
              onChange={(e) => setExcusedThreshold(Number(e.target.value))}
            />
          </div>

          {error && (
            <div className="text-sm text-red-500">{error}</div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsPopup; 