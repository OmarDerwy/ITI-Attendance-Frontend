import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Share } from "lucide-react";

const ShareScheduleButton = ({ events }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [shareDates, setShareDates] = useState({ from: "", to: "" });

  const handleShareSchedule = async () => {
    if (!shareDates.from || !shareDates.to) {
      toast.error("Please select both from and to dates");
      return;
    }

    try {
      const response = await fetch("/api/share-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events, from: shareDates.from, to: shareDates.to }),
      });

      if (response.ok) {
        toast.success(`Schedule shared with students from ${shareDates.from} to ${shareDates.to}`);
        setIsDialogOpen(false);
      } else {
        toast.error("Failed to share schedule. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred while sharing the schedule.");
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
        onClick={() => setIsDialogOpen(true)}
      >
        <Share className="h-4 w-4 mr-2" /> Share with students
      </Button>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Schedule with Students</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="from-date" className="text-right">
                From Date
              </Label>
              <input
                id="from-date"
                type="date"
                className="col-span-3 p-2 border rounded"
                value={shareDates.from}
                onChange={(e) => setShareDates({ ...shareDates, from: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="to-date" className="text-right">
                To Date
              </Label>
              <input
                id="to-date"
                type="date"
                className="col-span-3 p-2 border rounded"
                value={shareDates.to}
                onChange={(e) => setShareDates({ ...shareDates, to: e.target.value })}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleShareSchedule}>
              Share
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ShareScheduleButton;
