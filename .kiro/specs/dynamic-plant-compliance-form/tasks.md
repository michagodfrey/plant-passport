# Implementation Plan

- [x] 1. Set up Supabase service layer and database integration
  - Create SupabaseService class with methods for commodity search, pest lookup, and compliance queries
  - Implement database connection and query methods using existing Supabase configuration
  - Add TypeScript interfaces for database entities (Commodity, Pest, PestPresence, ImportRequirement)
  - _Requirements: 1.1, 2.1, 3.1, 4.1_

- [ ] 2. Create enhanced commodity search functionality
  - Implement real-time commodity search with debouncing against Supabase commodity table
  - Add commodity type disambiguation logic for fruits/vegetables vs plants/trees
  - Create SmartCommoditySearch component with autocomplete and validation
  - Write unit tests for commodity search and validation logic
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 3. Implement dynamic guided form step management
  - Create StepManager component to handle progressive form disclosure
  - Implement CommodityStep component with enhanced search integration
  - Create OriginStep component with state selection and pest context
  - Add form state management and step transition logic
  - _Requirements: 1.1, 3.1, 6.1, 6.2_

- [x] 4. Build pest analysis and presence checking
  - Implement pest lookup functionality using commodity_pest table
  - Create PestAnalysisStep component to display identified pests
  - Add pest presence checking against pest_state_presence table
  - Create PestPresenceIndicator component with visual status indicators
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4_

- [x] 5. Develop compliance requirements engine
  - Create ComplianceEngine service to analyze applicable requirements
  - Implement logic to determine applicable vs non-applicable requirements
  - Create ComplianceResultsStep component with structured requirement display
  - Add requirement explanations and source attribution
  - _Requirements: 4.1, 4.2, 4.3, 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 6. Integrate OpenRouter LLM service for compliance summarization using Supabase Edge Functions
  - Create Supabase Edge Function to securely proxy requests to OpenRouter API
  - Set up OpenRouter API integration in Edge Function with secure environment variable (OPENROUTER_API_KEY)
  - Implement Edge Function request validation, sanitization, and rate limiting
  - Create frontend LLMService class that calls the Supabase Edge Function endpoint
  - Implement compliance result summarization that creates concise explanations
  - Add comprehensive error handling and graceful fallback for LLM service failures
  - Add request timeout handling and user feedback for API calls
  - Deploy and test the Edge Function with proper CORS configuration
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
