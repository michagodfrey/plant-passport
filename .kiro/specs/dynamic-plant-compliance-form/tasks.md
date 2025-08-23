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

- [ ] 6. Integrate LLM service for plant specialist chatbot
  - Set up LLM service integration (OpenAI/Anthropic API)
  - Create PlantSpecialistLLM service with domain-specific prompting
  - Implement natural language processing for commodity extraction
  - Add LLM-powered commodity disambiguation and suggestions
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 7. Enhance Ask tab with conversational interface
  - Replace simple textarea with ChatInterface component
  - Implement MessageList component for conversation history
  - Create ChatInput component with LLM integration
  - Add conversation context management and response generation
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 8. Create MCP server for external integration
  - Implement MCP server with standardized tool definitions
  - Create MCP tools for commodity validation, pest lookup, and compliance checking
  - Add structured data responses for external chatbots and applications
  - Write comprehensive API documentation and examples
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 9. Update Results component for enhanced compliance display
  - Modify existing Results component to handle new ComplianceResult structure
  - Add sections for applicable and non-applicable requirements with explanations
  - Implement enhanced requirement display with sources and action items
  - Add integration with LLM-generated explanations
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 10. Integrate dynamic form with existing InputTabs component
  - Modify existing InputTabs to support dynamic guided form
  - Replace static guided form with DynamicGuidedForm component
  - Ensure seamless integration with existing onSubmitGuided callback
  - Maintain existing styling and UI consistency
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 11. Add comprehensive error handling and validation
  - Implement validation for all form inputs with real-time feedback
  - Add error handling for database queries and LLM API calls
  - Create user-friendly error messages with correction guidance
  - Add loading states and progress indicators throughout the application
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 12. Write comprehensive tests for all new functionality
  - Create unit tests for all service classes and utility functions
  - Write component tests for all new React components
  - Add integration tests for database queries and LLM interactions
  - Create end-to-end tests for complete user journeys through both modes
  - _Requirements: All requirements_
