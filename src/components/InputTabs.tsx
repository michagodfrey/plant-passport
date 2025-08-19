import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MapPin, Search, Leaf, MessageSquare } from "lucide-react";
import { GuidedInput, AskInput, AustralianState } from "@/types/plant-passport";
import { isFireAntCarrier, needsLocationDetail } from "@/services/mock-backend";

const AUSTRALIAN_STATES: { value: AustralianState; label: string }[] = [
  { value: "QLD", label: "Queensland" },
  { value: "NSW", label: "New South Wales" },
  { value: "VIC", label: "Victoria" },
  { value: "SA", label: "South Australia" },
  { value: "WA", label: "Western Australia" },
  { value: "TAS", label: "Tasmania" },
  { value: "NT", label: "Northern Territory" },
  { value: "ACT", label: "Australian Capital Territory" },
];

const COMMON_COMMODITIES = [
  "nursery stock",
  "potatoes", 
  "mulch",
  "soil",
  "turf",
  "hay",
  "straw",
  "cut flowers",
  "fruit",
  "vegetables",
  "grains",
  "timber",
];

interface InputTabsProps {
  onSubmitGuided: (input: GuidedInput) => void;
  onSubmitAsk: (input: AskInput) => void;
  isLoading: boolean;
}

export function InputTabs({ onSubmitGuided, onSubmitAsk, isLoading }: InputTabsProps) {
  const [guidedForm, setGuidedForm] = useState<GuidedInput>({
    commodity: "",
    origin: "QLD" as AustralianState,
    destination: "NSW" as AustralianState,
  });
  
  const [askMessage, setAskMessage] = useState("");
  const [showLocationDetail, setShowLocationDetail] = useState(false);

  const handleGuidedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (guidedForm.commodity && guidedForm.origin && guidedForm.destination) {
      onSubmitGuided(guidedForm);
    }
  };

  const handleAskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (askMessage.trim()) {
      onSubmitAsk({ message: askMessage });
    }
  };

  const isGuidedValid = guidedForm.commodity && guidedForm.origin && guidedForm.destination;
  const showFireAntWarning = needsLocationDetail(guidedForm);

  return (
    <Card className="card-gradient shadow-medium">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5 text-primary" />
          Check Plant Movement Requirements
        </CardTitle>
        <CardDescription>
          Get instant compliance information for interstate plant movements
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="guided" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="guided" className="flex items-center gap-2">
              <Leaf className="w-4 h-4" />
              Guided
            </TabsTrigger>
            <TabsTrigger value="ask" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Ask
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="guided" className="space-y-4">
            <form onSubmit={handleGuidedSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="commodity">Commodity</Label>
                <Input
                  id="commodity"
                  placeholder="e.g., nursery stock, potatoes, mulch"
                  list="commodities"
                  value={guidedForm.commodity}
                  onChange={(e) => setGuidedForm(prev => ({ ...prev, commodity: e.target.value }))}
                />
                <datalist id="commodities">
                  {COMMON_COMMODITIES.map(commodity => (
                    <option key={commodity} value={commodity} />
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="origin">Origin State</Label>
                  <Select 
                    value={guidedForm.origin} 
                    onValueChange={(value: AustralianState) => {
                      setGuidedForm(prev => ({ ...prev, origin: value }));
                      setShowLocationDetail(false);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
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

                <div className="space-y-2">
                  <Label htmlFor="destination">Destination State</Label>
                  <Select 
                    value={guidedForm.destination} 
                    onValueChange={(value: AustralianState) => 
                      setGuidedForm(prev => ({ ...prev, destination: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
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
              </div>

              {showFireAntWarning && (
                <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-warning" />
                      <span className="text-sm text-warning-foreground">
                        QLD zones differ by suburb — add location details?
                      </span>
                    </div>
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowLocationDetail(true)}
                    >
                      Add Details
                    </Button>
                  </div>
                </div>
              )}

              {showLocationDetail && (
                <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                  <Label className="text-sm font-medium">Location Details (Optional)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input
                      placeholder="Street address"
                      value={guidedForm.locationDetail?.address || ""}
                      onChange={(e) => setGuidedForm(prev => ({
                        ...prev,
                        locationDetail: { ...prev.locationDetail, address: e.target.value }
                      }))}
                    />
                    <Input
                      placeholder="Suburb"
                      value={guidedForm.locationDetail?.suburb || ""}
                      onChange={(e) => setGuidedForm(prev => ({
                        ...prev,
                        locationDetail: { ...prev.locationDetail, suburb: e.target.value }
                      }))}
                    />
                    <Input
                      placeholder="Postcode"
                      value={guidedForm.locationDetail?.postcode || ""}
                      onChange={(e) => setGuidedForm(prev => ({
                        ...prev,
                        locationDetail: { ...prev.locationDetail, postcode: e.target.value }
                      }))}
                    />
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={!isGuidedValid || isLoading}
              >
                {isLoading ? "Checking requirements..." : "Check Requirements"}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="ask" className="space-y-4">
            <form onSubmit={handleAskSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="message">Ask about plant movement rules</Label>
                <Textarea
                  id="message"
                  placeholder="e.g., What are the requirements for moving citrus trees from Victoria to South Australia?"
                  value={askMessage}
                  onChange={(e) => setAskMessage(e.target.value)}
                  rows={4}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={!askMessage.trim() || isLoading}
              >
                {isLoading ? "Getting answer..." : "Ask"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
        
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            💡 We'll ask a follow-up if a zone or pest boundary matters (e.g., fire ant carriers in QLD).
          </p>
        </div>
      </CardContent>
    </Card>
  );
}