import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Search, AlertCircle, Check, ChevronDown } from 'lucide-react';
import { useDebouncedSearch } from '@/hooks/use-debounced-search';
import { supabaseService } from '@/services/supabase';
import { validationService } from '@/services/validation';
import type { Commodity } from '@/types/database';

export interface CommoditySearchResult {
  commodity: Commodity;
  isExactMatch: boolean;
  needsDisambiguation: boolean;
  alternatives?: Commodity[];
}

export interface SmartCommoditySearchProps {
  value?: Commodity | null;
  onChange: (commodity: Commodity | null) => void;
  onValidationChange?: (isValid: boolean, message?: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function SmartCommoditySearch({
  value,
  onChange,
  onValidationChange,
  placeholder = "Search for a commodity (e.g., apple, nursery stock, timber)",
  disabled = false,
  className = "",
}: SmartCommoditySearchProps) {
  const [inputValue, setInputValue] = useState(value?.name || '');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedCommodity, setSelectedCommodity] = useState<Commodity | null>(value || null);
  const [disambiguationOptions, setDisambiguationOptions] = useState<Commodity[]>([]);
  const [showDisambiguation, setShowDisambiguation] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string>('');
  const [validationStatus, setValidationStatus] = useState<'idle' | 'valid' | 'invalid' | 'disambiguate'>('idle');

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    query,
    setQuery,
    results,
    isLoading,
    error,
  } = useDebouncedSearch(
    (searchQuery: string) => supabaseService.searchCommodities(searchQuery),
    { delay: 300, minLength: 2 }
  );

  // Update query when input value changes
  useEffect(() => {
    if (inputValue !== query) {
      setQuery(inputValue);
    }
  }, [inputValue, query, setQuery]);

  // Handle search results
  useEffect(() => {
    if (results.length > 0) {
      setShowDropdown(true);
      
      // Check for exact match
      const exactMatch = results.find(
        commodity => commodity.name.toLowerCase() === inputValue.toLowerCase()
      );

      if (exactMatch) {
        handleCommodityValidation(exactMatch, results);
      } else if (results.length === 1) {
        // Single result, likely what user wants
        setValidationStatus('valid');
        setValidationMessage('Commodity found');
      } else {
        // Multiple results, show dropdown
        setValidationStatus('idle');
        setValidationMessage('');
      }
    } else if (inputValue.length >= 2 && !isLoading) {
      setShowDropdown(false);
      setValidationStatus('invalid');
      setValidationMessage('No matching commodities found');
    }
  }, [results, inputValue, isLoading]);

  // Handle validation status changes
  useEffect(() => {
    const isValid = validationStatus === 'valid' && selectedCommodity !== null;
    onValidationChange?.(isValid, validationMessage);
  }, [validationStatus, selectedCommodity, validationMessage, onValidationChange]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCommodityValidation = async (commodity: Commodity, allResults: Commodity[]) => {
    try {
      const validation = await validationService.validateCommodity(commodity.name);
      
      if (validation.isValid) {
        // Check if there are multiple types of the same commodity name
        const sameNameCommodities = allResults.filter(
          c => c.name.toLowerCase().includes(commodity.name.toLowerCase()) ||
               commodity.name.toLowerCase().includes(c.name.toLowerCase())
        );

        if (sameNameCommodities.length > 1) {
          // Need disambiguation
          setDisambiguationOptions(sameNameCommodities);
          setShowDisambiguation(true);
          setValidationStatus('disambiguate');
          setValidationMessage('Multiple types found. Please select the specific type:');
        } else {
          // Single valid commodity
          setSelectedCommodity(commodity);
          setValidationStatus('valid');
          setValidationMessage('Commodity validated');
          onChange(commodity);
          setShowDropdown(false);
        }
      } else {
        setValidationStatus('invalid');
        setValidationMessage(validation.message || 'Invalid commodity');
      }
    } catch (error) {
      setValidationStatus('invalid');
      setValidationMessage('Error validating commodity');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Reset states when input changes
    if (newValue !== selectedCommodity?.name) {
      setSelectedCommodity(null);
      setShowDisambiguation(false);
      setDisambiguationOptions([]);
      setValidationStatus('idle');
      setValidationMessage('');
      onChange(null);
    }

    // Show dropdown if there's input
    if (newValue.length >= 2) {
      setShowDropdown(true);
    }
  };

  const handleCommoditySelect = (commodity: Commodity) => {
    setInputValue(commodity.name);
    setSelectedCommodity(commodity);
    setValidationStatus('valid');
    setValidationMessage('Commodity selected');
    onChange(commodity);
    setShowDropdown(false);
    setShowDisambiguation(false);
  };

  const handleDisambiguationSelect = (commodity: Commodity) => {
    handleCommoditySelect(commodity);
  };

  const getInputClassName = () => {
    let baseClass = "pr-10";
    
    if (validationStatus === 'valid') {
      baseClass += " border-green-500 focus-visible:ring-green-500";
    } else if (validationStatus === 'invalid') {
      baseClass += " border-red-500 focus-visible:ring-red-500";
    } else if (validationStatus === 'disambiguate') {
      baseClass += " border-yellow-500 focus-visible:ring-yellow-500";
    }
    
    return baseClass;
  };

  const getStatusIcon = () => {
    if (isLoading) {
      return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    }
    
    switch (validationStatus) {
      case 'valid':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'invalid':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'disambiguate':
        return <ChevronDown className="h-4 w-4 text-yellow-500" />;
      default:
        return <Search className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getCommodityTypeLabel = (commodity: Commodity) => {
    // Add type information to help with disambiguation
    if (commodity.type) {
      return `${commodity.name} (${commodity.type})`;
    }
    return commodity.name;
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className={getInputClassName()}
          onFocus={() => {
            if (inputValue.length >= 2 && results.length > 0) {
              setShowDropdown(true);
            }
          }}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          {getStatusIcon()}
        </div>
      </div>

      {/* Validation Message */}
      {validationMessage && (
        <div className={`mt-1 text-sm ${
          validationStatus === 'valid' ? 'text-green-600' :
          validationStatus === 'invalid' ? 'text-red-600' :
          validationStatus === 'disambiguate' ? 'text-yellow-600' :
          'text-muted-foreground'
        }`}>
          {validationMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-1 text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </div>
      )}

      {/* Search Results Dropdown */}
      {showDropdown && results.length > 0 && !showDisambiguation && (
        <Card ref={dropdownRef} className="absolute z-50 w-full mt-1 max-h-60 overflow-auto">
          <CardContent className="p-0">
            {results.map((commodity) => (
              <button
                key={commodity.id}
                className="w-full px-3 py-2 text-left hover:bg-muted transition-colors border-b border-border last:border-b-0"
                onClick={() => handleCommoditySelect(commodity)}
              >
                <div className="font-medium">{commodity.name}</div>
                {commodity.type && (
                  <div className="text-sm text-muted-foreground">
                    Type: {commodity.type}
                  </div>
                )}
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Disambiguation Options */}
      {showDisambiguation && disambiguationOptions.length > 0 && (
        <Card className="mt-2 border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="mb-2 text-sm font-medium text-yellow-800">
              Multiple types found. Please select the specific type:
            </div>
            <div className="space-y-2">
              {disambiguationOptions.map((commodity) => (
                <Button
                  key={commodity.id}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-left h-auto py-2 px-3"
                  onClick={() => handleDisambiguationSelect(commodity)}
                >
                  <div>
                    <div className="font-medium">{commodity.name}</div>
                    {commodity.type && (
                      <div className="text-xs text-muted-foreground">
                        {commodity.type}
                      </div>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Commodity Display */}
      {selectedCommodity && validationStatus === 'valid' && (
        <div className="mt-2">
          <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
            <Check className="h-3 w-3 mr-1" />
            {getCommodityTypeLabel(selectedCommodity)}
          </Badge>
        </div>
      )}
    </div>
  );
}
