import React, { useState } from 'react';
import { SmartCommoditySearch } from './SmartCommoditySearch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Commodity } from '@/types/database';

/**
 * Example component demonstrating the SmartCommoditySearch functionality
 * This shows how to integrate the enhanced commodity search with real-time validation
 * and disambiguation support.
 */
export function CommoditySearchExample() {
  const [selectedCommodity, setSelectedCommodity] = useState<Commodity | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string>('');

  const handleCommodityChange = (commodity: Commodity | null) => {
    setSelectedCommodity(commodity);
    console.log('Selected commodity:', commodity);
  };

  const handleValidationChange = (valid: boolean, message?: string) => {
    setIsValid(valid);
    setValidationMessage(message || '');
    console.log('Validation status:', { valid, message });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Enhanced Commodity Search Demo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Search for a commodity:
          </label>
          <SmartCommoditySearch
            value={selectedCommodity}
            onChange={handleCommodityChange}
            onValidationChange={handleValidationChange}
            placeholder="Try searching for 'apple', 'nursery stock', or 'potato'..."
          />
        </div>

        {/* Validation Status */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Validation Status:</span>
            <Badge variant={isValid ? "default" : "secondary"}>
              {isValid ? "Valid" : "Invalid"}
            </Badge>
          </div>
          {validationMessage && (
            <p className="text-sm text-muted-foreground">
              {validationMessage}
            </p>
          )}
        </div>

        {/* Selected Commodity Details */}
        {selectedCommodity && (
          <div className="p-4 bg-muted/50 rounded-lg">
            <h3 className="font-medium mb-2">Selected Commodity:</h3>
            <div className="space-y-1 text-sm">
              <div><strong>ID:</strong> {selectedCommodity.id}</div>
              <div><strong>Name:</strong> {selectedCommodity.name}</div>
              <div><strong>Type:</strong> {selectedCommodity.type}</div>
            </div>
          </div>
        )}

        {/* Feature Highlights */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium mb-2 text-blue-900">Features Demonstrated:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Real-time search with debouncing (300ms delay)</li>
            <li>• Autocomplete dropdown with database results</li>
            <li>• Commodity type disambiguation for similar names</li>
            <li>• Input validation with visual feedback</li>
            <li>• Error handling for network issues</li>
            <li>• Keyboard navigation support</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
