# Supabase Service Layer

This directory contains the service layer for integrating with the Supabase database for plant compliance checking.

## Files

- `supabase.ts` - Main Supabase service class with database operations
- `validation.ts` - Validation service for form inputs and data integrity
- `__tests__/supabase.test.ts` - Test suite for the service layer

## Setup

1. **Install Dependencies**
   ```bash
   npm install @supabase/supabase-js
   ```

2. **Environment Configuration**
   Copy `.env.example` to `.env` and fill in your Supabase credentials:
   ```bash
   cp .env.example .env
   ```

   Required environment variables:
   - `VITE_SUPABASE_URL` - Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

3. **Database Schema**
   The service expects the following tables:
   - `commodity` - Plant commodities (id, name, type)
   - `pest` - Pest information (pest_id, name, acronym)
   - `state` - Australian states (id, name, abbreviation*)
   - `commodity_pest` - Commodity-pest relationships
   - `pest_state_presence` - Pest presence by state (pest_id, state_id, zoned)
   - `import_requirement` - Import requirements (id, name, description, code, source_regulation)
   - `commodity_import_requirement` - Commodity-requirement relationships

   *Note: The abbreviation column is optional. The service will fall back to name matching if not available.

## Usage

### Basic Usage

```typescript
import { supabaseService } from '@/services/supabase';
import { validationService } from '@/services/validation';

// Search for commodities
const commodities = await supabaseService.searchCommodities('apple');

// Validate user input
const validation = await validationService.validateCommodity('apple trees');

// Get pests for a commodity
const pests = await supabaseService.getCommodityPests(commodityId);

// Check pest presence in a state
const presence = await supabaseService.getPestPresence([pestId], stateId);
```

### Advanced Usage

```typescript
// Get comprehensive commodity data with pests
const commoditiesWithPests = await supabaseService.searchCommoditiesWithPests('citrus');

// Get pest information with presence data
const pestsWithPresence = await supabaseService.getPestsWithPresence([1, 2, 3], stateId);

// Validate complete form data
const formValidation = await validationService.validateFormCompletion({
  commodity: selectedCommodity,
  originState: originState,
  destinationState: destinationState,
});
```

## Error Handling

The service layer includes comprehensive error handling:

- **Database Connection Errors**: Graceful fallback and user-friendly messages
- **Schema Differences**: Automatic adaptation to missing columns
- **Validation Errors**: Detailed feedback with suggestions
- **Network Errors**: Retry logic and timeout handling

## Testing

Run the test suite:

```bash
npm test                # Run tests once
npm run test:watch      # Run tests in watch mode
npm run test:ui         # Run tests with UI
```

The tests include:
- Database connection testing
- CRUD operations for all entities
- Validation logic testing
- Error handling scenarios
- Schema compatibility testing

## Schema Compatibility

The service is designed to be flexible with database schema variations:

- **Missing Columns**: Gracefully handles missing optional columns like `created_at`, `updated_at`, `abbreviation`
- **Different Column Names**: Can be easily adapted for different naming conventions
- **Additional Columns**: Ignores extra columns that aren't part of the interface

## Performance Considerations

- **Connection Pooling**: Uses Supabase's built-in connection pooling
- **Query Optimization**: Efficient joins and selective field queries
- **Caching**: Ready for caching layer implementation
- **Batch Operations**: Supports batch queries for better performance

## Security

- **Input Validation**: All inputs are validated before database queries
- **SQL Injection Protection**: Uses Supabase's parameterized queries
- **Error Information**: Sensitive error details are not exposed to users
- **API Key Management**: Environment-based configuration for security
