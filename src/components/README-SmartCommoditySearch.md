# SmartCommoditySearch Component

## Overview

The `SmartCommoditySearch` component provides an enhanced commodity search experience with real-time validation, autocomplete, and disambiguation support. It integrates with the Supabase database to provide accurate, up-to-date commodity information.

## Features

### 🔍 Real-time Search
- **Debounced Search**: 300ms delay to prevent excessive API calls
- **Minimum Query Length**: Requires at least 2 characters before searching
- **Live Results**: Shows matching commodities as you type

### 🎯 Smart Validation
- **Real-time Validation**: Validates input against database in real-time
- **Visual Feedback**: Color-coded input borders and status icons
- **Error Handling**: Graceful handling of network errors and invalid inputs

### 🔀 Disambiguation Support
- **Type Detection**: Automatically detects when multiple commodity types exist
- **Disambiguation UI**: Shows selection options when clarification is needed
- **Similar Commodity Detection**: Identifies related commodities (e.g., "Apple" vs "Apple tree")

### ♿ Accessibility
- **Keyboard Navigation**: Full keyboard support for dropdown navigation
- **Screen Reader Support**: Proper ARIA labels and announcements
- **Focus Management**: Logical focus flow and escape key handling

## Usage

### Basic Usage

```tsx
import { SmartCommoditySearch } from '@/components/SmartCommoditySearch';
import { useState } from 'react';

function MyComponent() {
  const [commodity, setCommodity] = useState(null);
  
  return (
    <SmartCommoditySearch
      value={commodity}
      onChange={setCommodity}
      placeholder="Search for a commodity..."
    />
  );
}
```

### Advanced Usage with Validation

```tsx
import { SmartCommoditySearch } from '@/components/SmartCommoditySearch';
import { useState } from 'react';

function MyComponent() {
  const [commodity, setCommodity] = useState(null);
  const [isValid, setIsValid] = useState(false);
  const [message, setMessage] = useState('');
  
  const handleValidationChange = (valid, message) => {
    setIsValid(valid);
    setMessage(message || '');
  };
  
  return (
    <div>
      <SmartCommoditySearch
        value={commodity}
        onChange={setCommodity}
        onValidationChange={handleValidationChange}
        placeholder="Search for a commodity..."
        disabled={false}
      />
      
      {message && (
        <div className={isValid ? 'text-green-600' : 'text-red-600'}>
          {message}
        </div>
      )}
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `Commodity \| null` | `null` | Currently selected commodity |
| `onChange` | `(commodity: Commodity \| null) => void` | - | Callback when commodity selection changes |
| `onValidationChange` | `(isValid: boolean, message?: string) => void` | - | Callback when validation status changes |
| `placeholder` | `string` | `"Search for a commodity..."` | Input placeholder text |
| `disabled` | `boolean` | `false` | Whether the input is disabled |
| `className` | `string` | `""` | Additional CSS classes |

## Validation States

The component provides visual feedback through different validation states:

### 🟢 Valid State
- **Appearance**: Green border and checkmark icon
- **Trigger**: Valid commodity selected
- **Message**: "Commodity validated" or "Commodity selected"

### 🔴 Invalid State
- **Appearance**: Red border and error icon
- **Trigger**: No matching commodities found or validation error
- **Message**: Specific error message with suggestions

### 🟡 Disambiguation State
- **Appearance**: Yellow border and dropdown icon
- **Trigger**: Multiple commodity types found for the same name
- **Message**: "Multiple types found. Please select the specific type:"

### ⚪ Idle State
- **Appearance**: Default border and search icon
- **Trigger**: No input or search in progress
- **Message**: None

## Disambiguation Flow

When the system detects multiple commodity types for a search term:

1. **Detection**: System finds commodities like "Apple" (fruit) and "Apple tree" (plant)
2. **UI Update**: Shows disambiguation message and options
3. **User Selection**: User clicks on the specific type they want
4. **Validation**: Selected commodity is validated and confirmed

## Performance Optimizations

### Debouncing
- **Delay**: 300ms debounce prevents excessive API calls
- **Cancellation**: Previous requests are cancelled when new input is received
- **Minimum Length**: Only searches when input is 2+ characters

### Caching
- **Component Level**: Results are cached within the component lifecycle
- **Service Level**: Supabase service may implement additional caching

### Error Recovery
- **Retry Logic**: Automatic retry for transient network errors
- **Graceful Degradation**: Continues to function with cached data when possible
- **User Feedback**: Clear error messages with suggested actions

## Integration with Validation Service

The component integrates with the enhanced `ValidationService`:

```typescript
// Enhanced validation with disambiguation support
const result = await validationService.validateCommodityWithDisambiguation(input);

if (result.needsDisambiguation) {
  // Show disambiguation options
  showDisambiguationOptions(result.alternatives);
} else if (result.isValid) {
  // Show success state
  showValidState(result.data);
} else {
  // Show error state
  showErrorState(result.message, result.suggestions);
}
```

## Database Integration

The component queries the following Supabase tables:

- **`commodity`**: Main commodity data (id, name, type)
- **`commodity_pest`**: Pest associations (used for related functionality)

### Search Query
```sql
SELECT * FROM commodity 
WHERE name ILIKE '%search_term%' 
ORDER BY name;
```

## Testing

The component includes comprehensive unit tests covering:

- **Search Functionality**: Debouncing, API calls, result handling
- **Validation Logic**: All validation states and transitions  
- **Disambiguation**: Multiple commodity type handling
- **Error Handling**: Network errors, invalid inputs, edge cases
- **Accessibility**: Keyboard navigation, screen reader support

Run tests with:
```bash
npm test src/components/__tests__/SmartCommoditySearch.test.tsx
```

## Dependencies

- **React**: ^18.3.1
- **@supabase/supabase-js**: ^2.56.0
- **Radix UI Components**: Various UI primitives
- **Lucide React**: Icons
- **Custom Hooks**: `useDebouncedSearch`
- **Services**: `supabaseService`, `validationService`

## Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+
- **Accessibility**: WCAG 2.1 AA compliant

## Future Enhancements

- **Fuzzy Search**: Implement fuzzy matching for typos
- **Recent Searches**: Cache and suggest recently searched commodities
- **Bulk Selection**: Support for selecting multiple commodities
- **Advanced Filters**: Filter by commodity type, category, etc.
- **Offline Support**: Cache common commodities for offline use
