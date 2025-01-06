import { Button } from "./ui/button";
import { Label } from "./ui/label";

interface IncidentTypeSelectorProps {
  selectedType: string;
  onTypeSelect: (type: string) => void;
  incidentTypes: string[];
}

const IncidentTypeSelector = ({
  selectedType,
  onTypeSelect,
  incidentTypes,
}: IncidentTypeSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label>Type of Incident</Label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {incidentTypes.map((type) => (
          <Button
            key={type}
            type="button"
            variant={selectedType === type ? "default" : "outline"}
            onClick={() => onTypeSelect(type)}
            className="justify-start"
          >
            {type}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default IncidentTypeSelector;