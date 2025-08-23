import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, AlertTriangle, ChevronDown, ChevronUp, FileText, Shield } from 'lucide-react';
import type { FormStepProps } from '@/types/form-steps';
import type { ComplianceResult, ApplicableRequirement, NonApplicableRequirement } from '@/types/compliance';
import { complianceEngine } from '@/services/compliance-engine';
import { supabaseService } from '@/services/supabase';

interface ComplianceResultsStepProps extends FormStepProps {
  complianceResult?: ComplianceResult;
  onAnalysisComplete?: (result: ComplianceResult) => void;
}

export function ComplianceResultsStep({
  data,
  onDataChange,
  onNext,
  onPrevious,
  isLoading = false,
  error,
  complianceResult,
  onAnalysisComplete,
}: ComplianceResultsStepProps) {
  const [analysisResult, setAnalysisResult] = useState<ComplianceResult | null>(complianceResult || null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    applicable: true,
    nonApplicable: false,
    recommendations: false,
  });

  // Perform compliance analysis when component mounts or data changes
  useEffect(() => {
    if (data.commodity && data.origin && data.pests && data.pestPresence && !analysisResult && !data.complianceResult) {
      performAnalysis();
    } else if (data.complianceResult && !analysisResult) {
      setAnalysisResult(data.complianceResult);
    }
  }, [data.commodity, data.origin, data.pests, data.pestPresence, data.complianceResult]);

  const performAnalysis = async () => {
    if (!data.commodity || !data.origin || !data.pests || !data.pestPresence) {
      setAnalysisError('Incomplete data for compliance analysis');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      // Get import requirements for the commodity
      const importRequirements = await supabaseService.getImportRequirements(data.commodity.id);
      
      // Perform compliance analysis
      const result = await complianceEngine.analyzeFromFormData(data, importRequirements);
      
      setAnalysisResult(result);
      
      // Store the result in form data
      onDataChange({ complianceResult: result });
      
      onAnalysisComplete?.(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze compliance requirements';
      setAnalysisError(errorMessage);
      console.error('Compliance analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getRiskBadgeVariant = (riskLevel: 'low' | 'medium' | 'high') => {
    switch (riskLevel) {
      case 'low':
        return 'default';
      case 'medium':
        return 'secondary';
      case 'high':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getRiskIcon = (riskLevel: 'low' | 'medium' | 'high') => {
    switch (riskLevel) {
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'high':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  if (isAnalyzing || isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Analyzing Compliance Requirements
          </CardTitle>
          <CardDescription>
            Determining applicable requirements for your plant shipment...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (analysisError || error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <XCircle className="h-5 w-5" />
            Analysis Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              {analysisError || error}
            </AlertDescription>
          </Alert>
          <div className="flex gap-2 mt-4">
            <Button onClick={performAnalysis} variant="outline">
              Retry Analysis
            </Button>
            <Button onClick={onPrevious} variant="ghost">
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysisResult) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Compliance Analysis</CardTitle>
          <CardDescription>
            Click below to analyze compliance requirements for your shipment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={performAnalysis} className="w-full">
            Analyze Requirements
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Risk Assessment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getRiskIcon(analysisResult.riskAssessment.overallRisk)}
            Compliance Summary
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={getRiskBadgeVariant(analysisResult.riskAssessment.overallRisk)}>
              {analysisResult.riskAssessment.overallRisk.toUpperCase()} RISK
            </Badge>
            <span className="text-sm text-muted-foreground">
              {analysisResult.riskAssessment.requirementsCount} requirement(s) apply
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{analysisResult.summary}</p>
          
          {/* Risk Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 p-4 bg-muted rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {analysisResult.riskAssessment.pestsPresent}
              </div>
              <div className="text-xs text-muted-foreground">Pests Present</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {analysisResult.riskAssessment.pestsTotal}
              </div>
              <div className="text-xs text-muted-foreground">Total Pests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">
                {analysisResult.riskAssessment.zonedPests}
              </div>
              <div className="text-xs text-muted-foreground">Zoned Pests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {analysisResult.riskAssessment.requirementsCount}
              </div>
              <div className="text-xs text-muted-foreground">Requirements</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applicable Requirements */}
      <Card>
        <Collapsible
          open={expandedSections.applicable}
          onOpenChange={() => toggleSection('applicable')}
        >
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Applicable Requirements ({analysisResult.applicable.length})
                </CardTitle>
                {expandedSections.applicable ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>
              <CardDescription>
                Requirements that apply to your shipment
              </CardDescription>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              {analysisResult.applicable.length === 0 ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    No specific requirements identified for this shipment. Standard interstate movement rules may still apply.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {analysisResult.applicable.map((req, index) => (
                    <ApplicableRequirementCard key={req.requirement.id} requirement={req} />
                  ))}
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Non-Applicable Requirements */}
      {analysisResult.nonApplicable.length > 0 && (
        <Card>
          <Collapsible
            open={expandedSections.nonApplicable}
            onOpenChange={() => toggleSection('nonApplicable')}
          >
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-muted-foreground" />
                    Non-Applicable Requirements ({analysisResult.nonApplicable.length})
                  </CardTitle>
                  {expandedSections.nonApplicable ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
                <CardDescription>
                  Requirements that do not apply to your shipment
                </CardDescription>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <div className="space-y-3">
                  {analysisResult.nonApplicable.map((req, index) => (
                    <NonApplicableRequirementCard key={req.requirement.id} requirement={req} />
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      )}

      {/* Recommendations */}
      <Card>
        <Collapsible
          open={expandedSections.recommendations}
          onOpenChange={() => toggleSection('recommendations')}
        >
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Recommendations
                </CardTitle>
                {expandedSections.recommendations ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>
              <CardDescription>
                Additional guidance for your shipment
              </CardDescription>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <ul className="space-y-2">
                {analysisResult.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button onClick={onPrevious} variant="outline">
          Previous
        </Button>
        <Button onClick={onNext}>
          Complete Analysis
        </Button>
      </div>
    </div>
  );
}

// Component for displaying applicable requirements
function ApplicableRequirementCard({ requirement }: { requirement: ApplicableRequirement }) {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium">{requirement.requirement.name}</h4>
          <p className="text-sm text-muted-foreground mt-1">
            {requirement.requirement.description}
          </p>
        </div>
        <Badge variant={getRiskBadgeVariant(requirement.riskLevel)}>
          {requirement.riskLevel}
        </Badge>
      </div>
      
      <div className="text-sm">
        <p className="font-medium text-primary">Why this applies:</p>
        <p className="text-muted-foreground">{requirement.reason}</p>
      </div>

      {requirement.source && (
        <div className="text-sm">
          <p className="font-medium">Source:</p>
          <p className="text-muted-foreground">{requirement.source}</p>
        </div>
      )}

      {requirement.actions.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">Required Actions:</p>
          <ul className="space-y-1">
            {requirement.actions.map((action, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Component for displaying non-applicable requirements
function NonApplicableRequirementCard({ requirement }: { requirement: NonApplicableRequirement }) {
  return (
    <div className="border rounded-lg p-3 bg-muted/30">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-muted-foreground">{requirement.requirement.name}</h4>
          <p className="text-sm text-muted-foreground mt-1">
            {requirement.reason}
          </p>
        </div>
        {requirement.waived && (
          <Badge variant="outline" className="text-green-600 border-green-600">
            Waived
          </Badge>
        )}
      </div>
    </div>
  );
}

// Helper function for risk badge variants
function getRiskBadgeVariant(riskLevel: 'low' | 'medium' | 'high') {
  switch (riskLevel) {
    case 'low':
      return 'default' as const;
    case 'medium':
      return 'secondary' as const;
    case 'high':
      return 'destructive' as const;
    default:
      return 'default' as const;
  }
}
