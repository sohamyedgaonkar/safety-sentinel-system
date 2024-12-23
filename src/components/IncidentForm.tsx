import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Map from "./Map";

const incidentTypes = [
  "Harassment",
  "Stalking",
  "Suspicious Activity",
  "Unsafe Environment",
  "Other",
];

const IncidentForm = () => {
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Incident Reported",
      description: "Your report has been submitted successfully. Stay safe!",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      <div className="space-y-2">
        <Label>Type of Incident</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {incidentTypes.map((type) => (
            <Button
              key={type}
              type="button"
              variant={selectedType === type ? "default" : "outline"}
              onClick={() => setSelectedType(type)}
              className="justify-start"
            >
              {type}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Location</Label>
        <div className="h-[200px] rounded-md overflow-hidden">
          <Map />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          placeholder="Please describe what happened..."
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <Label>Evidence (Optional)</Label>
        <Input type="file" accept="image/*,video/*" />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          checked={isAnonymous}
          onCheckedChange={setIsAnonymous}
          id="anonymous"
        />
        <Label htmlFor="anonymous">Report Anonymously</Label>
      </div>

      <Button type="submit" className="w-full">
        Submit Report
      </Button>
    </form>
  );
};

export default IncidentForm;