# Requirements Document

## Introduction

This feature implements a dynamic, real-time plant compliance form that guides users through the process of determining interstate plant movement requirements. The system will intelligently gather user inputs step-by-step, validate commodity types, identify relevant pests, check pest presence by location, and provide comprehensive compliance requirements with clear explanations. The initial implementation focuses on Tasmania as the destination state.

## Requirements

### Requirement 1

**User Story:** As a user moving plants interstate, I want to enter a commodity name and have the system help me specify the exact type, so that I get accurate compliance information.

#### Acceptance Criteria

1. WHEN a user enters a commodity name THEN the system SHALL search the commodity table for matching entries
2. IF multiple commodity types exist for the same name THEN the system SHALL present disambiguation options (e.g., "cherry" → "cherry fruits/vegetables" vs "cherry trees/plants")
3. WHEN a user selects a specific commodity type THEN the system SHALL validate the selection against the database
4. IF no matching commodity is found THEN the system SHALL display an appropriate error message with suggestions

### Requirement 2

**User Story:** As a user with a validated commodity, I want the system to automatically identify relevant pests, so that I understand what biosecurity risks apply to my shipment.

#### Acceptance Criteria

1. WHEN a commodity is validated THEN the system SHALL query the commodity_pest table to retrieve all associated pests
2. WHEN pests are found THEN the system SHALL display the pest names and acronyms to the user
3. IF no pests are associated with the commodity THEN the system SHALL inform the user that no specific pest risks are identified
4. WHEN displaying pests THEN the system SHALL show both the pest name and acronym for clarity

### Requirement 3

**User Story:** As a user who knows the pests affecting my commodity, I want to specify my origin location, so that the system can check if those pests are present in my area.

#### Acceptance Criteria

1. WHEN pests are identified THEN the system SHALL prompt the user to select their origin state
2. WHEN an origin state is selected THEN the system SHALL query pest_state_presence to check which identified pests are present in that state
3. WHEN pest presence is determined THEN the system SHALL display which pests are present vs absent in the origin location
4. IF a pest is zoned in the origin state THEN the system SHALL indicate the zoned status
5. WHEN no pests are present in the origin state THEN the system SHALL inform the user of reduced risk

### Requirement 4

**User Story:** As a user with origin and commodity information, I want to specify Tasmania as my destination, so that I can receive specific import requirements.

#### Acceptance Criteria

1. WHEN origin and pest information is gathered THEN the system SHALL prompt for destination selection
2. WHEN Tasmania is selected as destination THEN the system SHALL query commodity_import_requirement and import_requirement tables
3. WHEN import requirements are found THEN the system SHALL display each requirement with its description
4. IF no specific requirements exist THEN the system SHALL indicate general compliance may still apply

### Requirement 5

**User Story:** As a user completing the compliance check, I want to receive a comprehensive report of applicable and non-applicable requirements with explanations, so that I understand exactly what I need to do.

#### Acceptance Criteria

1. WHEN all information is gathered THEN the system SHALL generate a compliance report
2. WHEN displaying applicable requirements THEN the system SHALL show the requirement name, description, and source regulation
3. WHEN displaying non-applicable requirements THEN the system SHALL explain why they don't apply (e.g., "pest not present in origin state")
4. WHEN pests are not present in origin THEN the system SHALL list requirements that are waived due to absence of risk
5. WHEN the report is complete THEN the system SHALL provide clear next steps for the user

### Requirement 6

**User Story:** As a user interacting with the form, I want real-time validation and guidance, so that I can complete the process efficiently without errors.

#### Acceptance Criteria

1. WHEN entering any input THEN the system SHALL provide immediate validation feedback
2. IF an input is invalid THEN the system SHALL display specific error messages with correction guidance
3. WHEN moving between form steps THEN the system SHALL maintain previous selections and allow editing
4. WHEN the form is in progress THEN the system SHALL show clear progress indicators
5. IF the system encounters an error THEN the system SHALL provide user-friendly error messages with suggested actions

### Requirement 7

**User Story:** As a user who prefers natural conversation, I want to describe my plant movement needs in plain English, so that I can get compliance information without navigating complex forms.

#### Acceptance Criteria

1. WHEN I enter a natural language description THEN the system SHALL use LLM processing to extract commodity, origin, and destination information
2. WHEN the LLM cannot determine specific details THEN the system SHALL ask clarifying questions in conversational format
3. WHEN ambiguous commodity names are provided THEN the system SHALL use LLM to suggest the most likely matches with explanations
4. WHEN I need help understanding requirements THEN the system SHALL provide LLM-generated explanations in plain language
5. WHEN switching between chat and form interfaces THEN the system SHALL preserve all collected information

### Requirement 8

**User Story:** As a developer or system integrator, I want to access plant compliance functionality through a standardized API, so that I can integrate it with other agricultural or regulatory systems.

#### Acceptance Criteria

1. WHEN accessing the MCP server THEN the system SHALL provide standardized tools for commodity validation, pest lookup, and compliance checking
2. WHEN external chatbots query the MCP server THEN the system SHALL return structured compliance data in a consistent format
3. WHEN third-party applications integrate with the MCP server THEN the system SHALL provide comprehensive API documentation and examples
4. WHEN the MCP server receives requests THEN the system SHALL validate inputs and return appropriate error messages for invalid data
5. WHEN multiple systems access the MCP server concurrently THEN the system SHALL handle requests efficiently without performance degradation
