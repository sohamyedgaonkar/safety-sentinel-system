import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Map from '@/components/Map';

type EditIncidentDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  description: string;
  setDescription: (description: string) => void;
  location: string;
  setLocation: (location: string) => void;
  onSave: () => void;
};

const EditIncidentDialog = ({
  isOpen,
  onOpenChange,
  description,
  setDescription,
  location,
  setLocation,
  onSave,
}: EditIncidentDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Incident Report</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Update incident description..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Location (Optional)</label>
            <div className="h-[200px] rounded-md overflow-hidden mb-2">
              <Map onLocationSelect={(loc) => setLocation(loc)} />
            </div>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Update location..."
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={onSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditIncidentDialog;