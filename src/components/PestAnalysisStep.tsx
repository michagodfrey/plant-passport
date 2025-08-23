import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bug, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { supabaseService } from '@/services/supabase';
import { PestPresenceList } from './PestPresenceIndicator';
import type { FormStepProps } from '@/types/form-steps';
import type { Pest, PestPresence } from '@/types/database';

export function PestAnalysisStep({ data, onDataChange, isLoading }: FormStepProps) {
  const [pests, setPests] = useState<Pest[]>([]);
  const [pestPresence, setPestPresence] = useState<PestPresence[]>([]);
  const [isLoadingPests, setIsLoadingPests] = useState(false);
  const [pestError, setPestError] = useState<string>();

  const selectedCommodity = data.commodity;
  const selectedOrigin = data.origin;

  // Load pests when commodity is available
  useEffect(() => {
    const loadPests = async () => {
      if (!selectedCommodity) {
        setPests([]);
        onDataChange({ pests: [] });
        return;
      }

      setIsLoadingPests(true);
      setPestError(undefined);

      try {
        const commodityPests = await supabaseService.getCommodityPests(selectedCommodity.id);
        setPests(commodityPests);
        
        // Store pests in form data
        onDataChange({ pests: commodityPests });
      } catch (error) {
        console.error('Error loading pests:', error);
        setPestError('Failed to load pest information. Please try again.');
        setPests([]);
        onDataChange({ pests: [] });
      } finally {
        setIsLoadingPests(false);
      }
    };

    loadPests();
  }, [selectedCommodity, onDataChange]);

  // Load pest presence when origin state is selected
  useEffect(() => {
    const loadPestPresence = async () => {
      if (!selectedOrigin || pests.length === 0) {
        setPestPresence([]);
        onDataChange({ pestPresence: [] });
        return;
      }

      setIsLoadingPests(true);
      setPestError(undefined);

      try {
        const pestIds = pests.map(pest => pest.pest_id);
        const presence = await supabaseService.getPestPresence(pestIds, selectedOrigin.stateId);
        setPestPresence(presence);
        
        // Store pest presence in form data
        onDataChange({ pestPresence: presence });
      } catch (error) {
        console.error('Error loading pest presence:', error);
        setPestError('Failed to load pest presence information. Please try again.');
        setPestPresence([]);
        onDataChange({ pestPresence: [] });
      } finally {
        setIsLoadingPests(false);
      }
    };

    loadPestPresence();
  }, [selectedOrigin, pests, onDataChange]);

  const presentPests = pests.filter(pest => {
    const presence = pestPresence.find(p => p.pest_id === pest.pest_id);
    return presence && !presence.zoned;
  });

  const zonedPests = pests.filter(pest => {
    const presence = pestPresence.find(p => p.pest_id === pest.pest_id);
    return presence && presence.zoned;
  });

  const absentPests = pests.filter(pest => {
    const presence = pestPresence.find(p => p.pest_id === pest.pest_id);
    return !presence;
  });

  const getRiskLevel = () => {
    if (presentPests.length > 0) return 'high';
    if (zonedPests.length > 0) return 'medium';
    return 'low';
  };

  const riskLevel = getRiskLevel();

  if (!selectedCommodity) {
    return (
      <div className="text-center py-8">
        <Bug className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground">Please select a commodity first to analyze pest risks.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Commodity Summary */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Bug className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium">Analyzing pests for: {selectedCommodity.name}</p>
              <p className="text-sm text-muted-foreground">Type: {selectedCommodity.type}</p>
            </div>
            {isLoadingPests && (
              <div className="ml-auto">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {pestError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{pestError}</AlertDescription>
        </Alert>
      )}

      {/* Pest Analysis Results */}
      {pests.length > 0 ? (
        <div className="space-y-4">
          {/* Risk Level Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Bug className="w-4 h-4" />
                Pest Risk Assessment
                <Badge 
                  variant={riskLevel === 'high' ? 'destructive' : riskLevel === 'medium' ? 'default' : 'secondary'}
                  className="ml-auto"
                >
                  {riskLevel === 'high' ? 'High Risk' : riskLevel === 'medium' ? 'Medium Risk' : 'Low Risk'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Found {pests.length} pest{pests.length !== 1 ? 's' : ''} associated with {selectedCommodity.name}
                </p>

                {selectedOrigin ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      Presence in {selectedOrigin.stateName}:
                    </p>
                    <PestPresenceList 
                      pests={pests} 
                      pestPresence={pestPresence}
                      showSummary={true}
                    />
                  </div>
                ) : (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Select your origin state to check pest presence and determine specific risks.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Risk Explanation */}
          {selectedOrigin && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Risk Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {presentPests.length > 0 && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>High Risk:</strong> {presentPests.length} pest{presentPests.length !== 1 ? 's are' : ' is'} present in {selectedOrigin.stateName}. 
                        Strict compliance requirements will likely apply.
                      </AlertDescription>
                    </Alert>
                  )}

                  {zonedPests.length > 0 && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Medium Risk:</strong> {zonedPests.length} pest{zonedPests.length !== 1 ? 's are' : ' is'} zoned in {selectedOrigin.stateName}. 
                        Requirements may vary by specific location within the state.
                      </AlertDescription>
                    </Alert>
                  )}

                  {absentPests.length > 0 && (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        <strong>Low Risk:</strong> {absentPests.length} pest{absentPests.length !== 1 ? 's are' : ' is'} not present in {selectedOrigin.stateName}. 
                        Some requirements may be waived due to absence of risk.
                      </AlertDescription>
                    </Alert>
                  )}

                  {presentPests.length === 0 && zonedPests.length === 0 && absentPests.length === pests.length && (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        <strong>Excellent news!</strong> None of the identified pests are present in {selectedOrigin.stateName}. 
                        This significantly reduces your compliance requirements.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : !isLoadingPests && (
        <Card>
          <CardContent className="p-8 text-center">
            <Bug className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mb-2">
              No specific pests identified for {selectedCommodity.name}
            </p>
            <p className="text-sm text-muted-foreground">
              General biosecurity requirements may still apply. Proceed to see compliance requirements.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
