import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import Map from "./Map";
import IncidentTypeSelector from "./IncidentTypeSelector";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/gif", "video/mp4"];

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
  const [location, setLocation] = useState("");
  const [evidence, setEvidence] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check for description from ChatWithRachael when component mounts
  useEffect(() => {
    const savedDescription = localStorage.getItem("incidentDescription");
    if (savedDescription) {
      setDescription(savedDescription);
      localStorage.removeItem("incidentDescription"); // Clear after using
    }
  }, []);

  const validateForm = () => {
    if (!user) {
      toast.error("Please sign in to submit a report");
      navigate("/login");
      return false;
    }

    if (!selectedType) {
      toast.error("Please select an incident type");
      return false;
    }

    if (!description.trim()) {
      toast.error("Please provide a description of the incident");
      return false;
    }

    return true;
  };

  const validateFile = (file: File): boolean => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error("Invalid file type. Please upload an image or video file.");
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size should be less than 5MB");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      let evidencePath = null;
      if (evidence) {
        const fileExt = evidence.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('evidence')
          .upload(`${user?.id}/${fileName}`, evidence);

        if (uploadError) throw uploadError;
        evidencePath = `${user?.id}/${fileName}`;
      }

      const { error: insertError } = await supabase
        .from('incidents')
        .insert([
          {
            user_id: user?.id,
            type: selectedType,
            description: description.trim(),
            location: location.trim() || null,
            evidence_file: evidencePath,
            status: "pending",
            reported_at: new Date().toISOString(),
            is_anonymous: isAnonymous,
          },
        ]);

      if (insertError) throw insertError;

      toast.success("Incident reported successfully");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error submitting incident:", error);
      toast.error(error.message || "Failed to submit incident. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      <IncidentTypeSelector
        selectedType={selectedType}
        onTypeSelect={setSelectedType}
        incidentTypes={incidentTypes}
      />

      <div className="space-y-2">
        <Label>Location</Label>
        <div className="h-[300px] rounded-md overflow-hidden mb-2">
          <Map 
            onLocationSelect={(loc) => {
              setLocation(loc);
              toast.success("Location saved successfully");
            }} 
            initialLocation={location}
          />
        </div>
        <p className="text-sm text-gray-500">Click on the map to select a location</p>
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <div className="space-y-4">
          <Button
            type="button"
            onClick={() => navigate("/chat-with-rachael")}
            className="w-full"
          >
            Chat with Rachael to Describe the Incident
          </Button>
          <textarea
            className="w-full min-h-[100px] p-2 border rounded"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the incident here or use the chat above..."
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Evidence (Optional)</Label>
        <Input 
          type="file" 
          accept={ALLOWED_FILE_TYPES.join(',')}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file && validateFile(file)) {
              setEvidence(file);
            } else {
              e.target.value = '';
              setEvidence(null);
            }
          }}
          className="cursor-pointer"
        />
        <p className="text-xs text-gray-500">Maximum file size: 5MB. Supported formats: JPG, PNG, GIF, MP4</p>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          checked={isAnonymous}
          onCheckedChange={setIsAnonymous}
          id="anonymous"
        />
        <Label htmlFor="anonymous">Report Anonymously</Label>
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "Submit Report"}
      </Button>
    </form>
  );
};

export default IncidentForm;
