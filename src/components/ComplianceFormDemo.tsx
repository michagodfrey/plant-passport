import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, FileText, ArrowRight } from 'lucide-react';
import { DynamicGuidedForm } from './DynamicGuidedForm';
import type { GuidedInput } from '@/types/plant-passport';

export function ComplianceFormDemo() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<GuidedInput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFormSubmit = async (input: GuidedInput) => {
    setIsLoading(true);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSubmittedData(input);
    setIsSubmitted(true);
    setIsLoading(false);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setSubmittedData(null);
    setIsLoading(false);
  };

  if (isSubmitted && submittedData) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Compliance Analysis Complete
            </CardTitle>
            <CardDescription>
              Your plant shipment compliance requirements have been analyzed successfully.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                <strong>Summary:</strong> Analysis completed for {submittedData.commodity} shipment 
                from {submittedData.origin} to {submittedData.destination}.
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
              <div className="text-center">
                <div className="text-lg font-semibold">{submittedData.commodity}</div>
                <div className="text-sm text-muted-foreground">Commodity</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">{submittedData.origin}</div>
                <div className="text-sm text-muted-foreground">Origin State</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">{submittedData.destination}</div>
                <div className="text-sm text-muted-foreground">Destination</div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleReset} variant="outline">
                Start New Analysis
              </Button>
              <Button>
                Download Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Plant Compliance Analysis
          </CardTitle>
          <CardDescription>
            Complete the guided form to analyze compliance requirements for your plant shipment to Tasmania.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <span>Commodity Selection</span>
            <ArrowRight className="h-3 w-3" />
            <span>Origin State</span>
            <ArrowRight className="h-3 w-3" />
            <span>Pest Analysis</span>
            <ArrowRight className="h-3 w-3" />
            <span className="font-medium text-primary">Compliance Requirements</span>
          </div>
        </CardContent>
      </Card>

      <DynamicGuidedForm 
        onSubmit={handleFormSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
