
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

type Incident = {
  id: string;
  reported_at: string | null;
  status: string;
  type: string;
  description: string;
  user_id: string | null;
  location: string | null;
  reporter_name: string | null;
  log: string | null;
  evidence_file: string | null;
};

type AuthorityIncidentListProps = {
  incidents: Incident[];
  onStatusChange: (id: string, newStatus: string) => void;
};

const AuthorityIncidentList = ({ incidents, onStatusChange }: AuthorityIncidentListProps) => {
  const [evidenceUrl, setEvidenceUrl] = useState<string | null>(null);

  const handleViewEvidence = async (evidenceFile: string) => {
    try {
      const { data } = await supabase
        .storage
        .from('evidence')
        .getPublicUrl(evidenceFile);

      if (!data) {
        console.error('Error getting evidence URL: No data returned');
        return;
      }

      setEvidenceUrl(data.publicUrl);
      window.open(data.publicUrl, '_blank');
    } catch (error) {
      console.error('Error viewing evidence:', error);
    }
  };

  return (
    <div className="grid gap-6">
      {incidents.map((incident) => (
        <Card key={incident.id}>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span>{incident.type}</span>
                {incident.evidence_file && (
                  <Badge variant="secondary" className="text-xs">
                    The evidence is verified and location: Medical College road Pune District Pune
                  </Badge>
                )}
              </div>
              <div className="flex gap-2 items-center">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                    >
                      Log
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Incident Log</DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                      {incident.log ? (
                        <pre className="text-sm whitespace-pre-wrap">
                          {incident.log}
                        </pre>
                      ) : (
                        <p className="text-sm text-muted-foreground">No log entries yet.</p>
                      )}
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
                {incident.evidence_file && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewEvidence(incident.evidence_file!)}
                  >
                    View Evidence
                  </Button>
                )}
                <Select
                  defaultValue={incident.status}
                  onValueChange={(value) => onStatusChange(incident.id, value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Update status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_review">In Review</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Reported on:{' '}
              {incident.reported_at
                ? new Date(incident.reported_at).toLocaleDateString()
                : 'Unknown'}
            </p>
            <p className="text-sm text-gray-500">
              Location: {incident.location || 'N/A'}
            </p>
            <p className="text-sm text-gray-500">
              Reporter: {incident.reporter_name || 'Anonymous'}
            </p>
            <p className="mt-4">{incident.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AuthorityIncidentList;
