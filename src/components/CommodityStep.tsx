import { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Package, AlertCircle } from 'lucide-react';
import { supabaseService } from '@/services/supabase';
import { useDebounce } from '@/hooks/use-debounce';
import type { FormStepProps } from '@/types/form-steps';
import type { Commodity } from '@/types/database';

export function CommodityStep({ data, onDataChange, isLoading }: FormStepProps) {
  const [searchQuery, setSearchQuery] = useState(data.commodity?.name || '');
  const [searchResults, setSearchResults] = useState<Commodity[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string>();
  const [showResults, setShowResults] = useState(false);

  const debouncedQuery = useDebounce(searchQuery, 300);

  // Group commodities by type for disambiguation
  const groupedResults = useMemo(() => {
    const groups: Record<string, Commodity[]> = {};
    searchResults.forEach(commodity => {
      const type = commodity.type || 'Other';
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(commodity);
    });
    return groups;
  }, [searchResults]);

  const hasMultipleTypes = Object.keys(groupedResults).length > 1;
  const selectedCommodity = data.commodity;

  useEffect(() => {
    const searchCommodities = async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      setIsSearching(true);
      setSearchError(undefined);

      try {
        const results = await supabaseService.searchCommodities(debouncedQuery);
        setSearchResults(results);
        setShowResults(true);
      } catch (error) {
        console.error('Error searching commodities:', error);
        setSearchError('Failed to search commodities. Please try again.');
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    searchCommodities();
  }, [debouncedQuery]);

  const handleCommoditySelect = (commodity: Commodity) => {
    onDataChange({
      commodity: {
        id: commodity.id,
        name: commodity.name,
        type: commodity.type
      }
    });
    setShowResults(false);
    setSearchQuery(commodity.name);
  };

  const handleClearSelection = () => {
    onDataChange({ commodity: undefined });
    setSearchQuery('');
    setShowResults(false);
  };

  const handleInputChange = (value: string) => {
    setSearchQuery(value);
    if (selectedCommodity && value !== selectedCommodity.name) {
      // Clear selection if user modifies the input
      onDataChange({ commodity: undefined });
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="commodity-search" className="flex items-center gap-2">
          <Package className="w-4 h-4" />
          What are you moving?
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="commodity-search"
            placeholder="e.g., apple trees, potatoes, nursery stock"
            value={searchQuery}
            onChange={(e) => handleInputChange(e.target.value)}
            className="pl-10"
            disabled={isLoading}
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            </div>
          )}
        </div>
      </div>

      {searchError && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertCircle className="w-4 h-4 text-destructive" />
          <p className="text-sm text-destructive">{searchError}</p>
        </div>
      )}

      {selectedCommodity && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">{selectedCommodity.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Type: {selectedCommodity.type}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearSelection}
                disabled={isLoading}
              >
                Change
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showResults && searchResults.length > 0 && !selectedCommodity && (
        <div className="space-y-3">
          <p className="text-sm font-medium">Select your commodity:</p>
          
          {hasMultipleTypes && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                Multiple types found. Please select the specific type you're moving:
              </p>
            </div>
          )}

          <div className="space-y-3 max-h-60 overflow-y-auto">
            {Object.entries(groupedResults).map(([type, commodities]) => (
              <div key={type} className="space-y-2">
                {hasMultipleTypes && (
                  <Badge variant="secondary" className="text-xs">
                    {type}
                  </Badge>
                )}
                <div className="grid gap-2">
                  {commodities.map((commodity) => (
                    <Button
                      key={commodity.id}
                      variant="outline"
                      className="justify-start h-auto p-3 text-left"
                      onClick={() => handleCommoditySelect(commodity)}
                      disabled={isLoading}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="font-medium">{commodity.name}</p>
                          {hasMultipleTypes && (
                            <p className="text-xs text-muted-foreground">
                              {commodity.type}
                            </p>
                          )}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showResults && searchResults.length === 0 && debouncedQuery && !isSearching && (
        <div className="p-4 text-center text-muted-foreground">
          <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No commodities found for "{debouncedQuery}"</p>
          <p className="text-xs mt-1">Try a different search term or check your spelling</p>
        </div>
      )}

      {!showResults && !selectedCommodity && searchQuery.length > 0 && searchQuery.length < 2 && (
        <p className="text-sm text-muted-foreground">
          Type at least 2 characters to search for commodities
        </p>
      )}
    </div>
  );
}
