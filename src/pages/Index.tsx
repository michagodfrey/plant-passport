import { useState } from "react";
import { Header } from "@/components/Header";
import { InputTabs } from "@/components/InputTabs";
import { Results } from "@/components/Results";
import { FAQ } from "@/components/FAQ";
import { ResourceGrid } from "@/components/ResourceGrid";
import { Footer } from "@/components/Footer";
import { fetchRequirements } from "@/services/mock-backend";
import { GuidedInput, AskInput, BackendResponse } from "@/types/plant-passport";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [response, setResponse] = useState<BackendResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGuidedSubmit = async (input: GuidedInput) => {
    setIsLoading(true);
    setResponse(null);
    
    try {
      const result = await fetchRequirements(input);
      setResponse(result);
      
      // Store last query in localStorage for convenience
      localStorage.setItem('plantpassport-last-query', JSON.stringify(input));
      
      toast({
        title: "Requirements found",
        description: "Successfully retrieved plant movement requirements.",
      });
    } catch (error) {
      console.error('Error fetching requirements:', error);
      toast({
        title: "Error",
        description: "Failed to fetch requirements. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAskSubmit = async (input: AskInput) => {
    setIsLoading(true);
    setResponse(null);
    
    try {
      const result = await fetchRequirements(input);
      setResponse(result);
      
      toast({
        title: "Answer found",
        description: "Successfully processed your question.",
      });
    } catch (error) {
      console.error('Error processing question:', error);
      toast({
        title: "Error",
        description: "Failed to process your question. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        <InputTabs 
          onSubmitGuided={handleGuidedSubmit}
          onSubmitAsk={handleAskSubmit}
          isLoading={isLoading}
        />
        
        {(response || isLoading) && (
          <Results 
            response={response}
            isLoading={isLoading}
          />
        )}
        
        <FAQ />
        
        <ResourceGrid />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
