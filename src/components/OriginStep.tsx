import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import type { FormStepProps } from '@/types/form-steps';
import type { AustralianState } from '@/types/plant-passport';

const AUSTRALIAN_STATES: { value: AustralianState; label: string; id: number }[] = [
  { value: "QLD", label: "Queensland", id: 1 },
  { value: "NSW", label: "New South Wales", id: 2 },
  { value: "VIC", label: "Victoria", id: 3 },
  { value: "SA", label: "South Australia", id: 4 },
  { value: "WA", label: "Western Australia", id: 5 },
  { value: "TAS", label: "Tasmania", id: 7 },
  { value: "NT", label: "Northern Territory", id: 6 },
  { value: "ACT", label: "Australian Capital Territory", id: 8 },
];

export function OriginStep({ data, onDataChange, isLoading }: FormStepProps) {
  const selectedOrigin = data.origin;

  const handleOriginChange = (stateAbbr: string) => {
    const state = AUSTRALIAN_STATES.find(s => s.value === stateAbbr);
    if (state) {
      onDataChange({
        origin: {
          stateId: state.id,
          stateName: state.label
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="origin-state" className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Where are you moving from?
        </Label>
        <Select 
          value={selectedOrigin ? AUSTRALIAN_STATES.find(s => s.id === selectedOrigin.stateId)?.value : ''} 
          onValueChange={handleOriginChange}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select origin state" />
          </SelectTrigger>
          <SelectContent>
            {AUSTRALIAN_STATES.map(state => (
              <SelectItem key={state.value} value={state.value}>
                {state.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedOrigin && (
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="font-medium">Origin: {selectedOrigin.stateName}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Destination: Tasmania (fixed for this demo)
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
