import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

type IncidentCardProps = {
  incident: {
    id: string;
    type: string;
    status: string;
    reported_at: string;
    description: string;
    location: string | null;
    log: string | null;
  };
  onEdit: (incident: any) => void;
};

const IncidentCard = ({ incident, onEdit }: IncidentCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{incident.type}</span>
          <div className="flex gap-2">
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
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onEdit(incident)}
            >
              Edit
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500">
          Status: {incident.status}
        </p>
        <p className="text-sm text-gray-500">
          Date: {new Date(incident.reported_at).toLocaleDateString()}
        </p>
        <p className="mt-2">{incident.description}</p>
        {incident.location && (
          <p className="text-sm text-gray-500 mt-2">
            Location: {incident.location}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default IncidentCard;