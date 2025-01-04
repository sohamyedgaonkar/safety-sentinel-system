import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onEdit(incident)}
          >
            Edit
          </Button>
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