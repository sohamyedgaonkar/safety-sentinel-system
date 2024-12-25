import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import Map from "./Map";

const incidentTypes = [
  "Harassment",
  "Stalking",
  "Suspicious Activity",
  "Unsafe Environment",
  "Other",
];

const IncidentForm = () => {
  const navigate = useNavigate();
  const { user, supabase } = useAuth();
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please sign in to submit a report");
      navigate("/login");
      return;
    }

    if (!selectedType) {
      toast.error("Please select an incident type");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("incidents").insert([
        {
          user_id: isAnonymous ? null : user.id,
          type: selectedType,
          description,
          status: "pending",
        },
      ]);

      if (error) throw error;

      toast.success("Incident reported successfully");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error submitting incident:", error);
      toast.error("Failed to submit incident. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
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

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit Report"}
      </Button>
    </form>
  );
};

export default IncidentForm;