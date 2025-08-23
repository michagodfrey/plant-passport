import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search, Leaf, MessageSquare } from "lucide-react";
import { GuidedInput, AskInput } from "@/types/plant-passport";
import { DynamicGuidedForm } from "./DynamicGuidedForm";



interface InputTabsProps {
  onSubmitGuided: (input: GuidedInput) => void;
  onSubmitAsk: (input: AskInput) => void;
  isLoading: boolean;
}

export function InputTabs({ onSubmitGuided, onSubmitAsk, isLoading }: InputTabsProps) {
  const [askMessage, setAskMessage] = useState("");

  const handleAskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (askMessage.trim()) {
      onSubmitAsk({ message: askMessage });
    }
  };

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
            <DynamicGuidedForm 
              onSubmit={onSubmitGuided}
              isLoading={isLoading}
            />
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
