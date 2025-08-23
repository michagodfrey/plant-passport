import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { FormStep, FormStepData, StepManagerProps } from '@/types/form-steps';

export function StepManager({ 
  steps, 
  initialData = {}, 
  onComplete, 
  isLoading = false 
}: StepManagerProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<FormStepData>({
    destination: { stateId: 7, stateName: "Tasmania" }, // Fixed to Tasmania
    ...initialData
  });
  const [error, setError] = useState<string>();

  const currentStep = steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleDataChange = useCallback((updates: Partial<FormStepData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setError(undefined); // Clear errors when data changes
  }, []);

  const handleNext = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      // Final step - complete the form
      onComplete(formData);
    }
  }, [currentStepIndex, steps.length, formData, onComplete]);

  const handlePrevious = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [currentStepIndex]);

  const canProceed = currentStep?.canProceed(formData) ?? false;
  const isComplete = currentStep?.isComplete(formData) ?? false;
  const isLastStep = currentStepIndex === steps.length - 1;

  if (!currentStep) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">No steps configured</p>
        </CardContent>
      </Card>
    );
  }

  const StepComponent = currentStep.component;

  return (
    <Card className="card-gradient shadow-medium">
      <CardHeader>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{currentStep.title}</CardTitle>
            <span className="text-sm text-muted-foreground">
              Step {currentStepIndex + 1} of {steps.length}
            </span>
          </div>
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-muted-foreground">{currentStep.description}</p>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <StepComponent
          data={formData}
          onDataChange={handleDataChange}
          onNext={handleNext}
          onPrevious={handlePrevious}
          isLoading={isLoading}
          error={error}
        />

        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStepIndex === 0 || isLoading}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canProceed || isLoading}
            className="flex items-center gap-2"
          >
            {isLastStep ? 'Complete' : 'Next'}
            {!isLastStep && <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
