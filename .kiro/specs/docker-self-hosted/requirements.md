# Requirements Document

## Introduction

Migrate the Reogent (UBC campus AI assistant) application from AWS-managed services to a fully self-hostable Docker deployment. The application currently relies on AWS Bedrock, DynamoDB, S3, Cognito, OpenSearch, Lambda, and CloudFront. The migration replaces all AWS dependencies with open-source or vendor-neutral alternatives that run inside Docker containers, enabling deployment on any machine without an AWS account.

## Glossary

- **Container_Stack**: The set of Docker containers (application, database, search engine) composed via docker-compose
- **App_Container**: The Docker container running the Next.js application server
- **Database**: The relational database (PostgreSQL or SQLite) replacing DynamoDB for session and profile storage
- **Search_Engine**: The self-hosted Meilisearch container replacing AWS-managed OpenSearch
- **LLM_Adapter**: The server-side module that communicates with any OpenAI-compatible LLM API endpoint
- **Auth_Module**: The server-side module providing username/password registration and JWT-based session management
- **Data_Store**: Local filesystem directory (bind-mounted volume) replacing S3 for static data files

## Requirements

### Requirement 1: LLM Provider Abstraction

**User Story:** As a self-hosting operator, I want to connect any OpenAI-compatible LLM endpoint, so that I can use Ollama, vLLM, LiteLLM, or a cloud API without code changes.

#### Acceptance Criteria

1. WHEN the Container_Stack starts, THE LLM_Adapter SHALL read the LLM base URL and model name from environment variables
2. WHEN the application sends a chat request, THE LLM_Adapter SHALL format the request using the OpenAI Chat Completions API protocol
3. WHEN the LLM endpoint returns a streaming response, THE LLM_Adapter SHALL relay tokens to the client as server-sent events
4. WHEN the LLM endpoint supports tool use, THE LLM_Adapter SHALL translate tool call/result messages to OpenAI function-calling format
5. IF the LLM endpoint is unreachable, THEN THE LLM_Adapter SHALL return an error message to the client within 5 seconds

### Requirement 2: Database Migration

**User Story:** As a self-hosting operator, I want chat sessions and user profiles stored in PostgreSQL, so that I do not need DynamoDB or an AWS account.

#### Acceptance Criteria

1. WHEN the Container_Stack starts, THE Database SHALL be accessible to the App_Container via a connection string environment variable
2. WHEN a user creates a new chat session, THE App_Container SHALL persist the session record to the Database
3. WHEN a chat exchange occurs, THE App_Container SHALL append the exchange to the session in the Database
4. WHEN a user profile is created or updated, THE App_Container SHALL persist the profile to the Database
5. WHEN the Container_Stack is restarted, THE Database SHALL retain all previously stored data via a persistent volume

### Requirement 3: Static Data Storage

**User Story:** As a self-hosting operator, I want campus data files served from the local filesystem, so that I do not need S3.

#### Acceptance Criteria

1. WHEN the App_Container starts, THE Data_Store SHALL be mounted as a read-only volume at a configurable path
2. WHEN the application requests a GeoJSON or data file, THE App_Container SHALL read the file from the Data_Store volume
3. IF a requested file does not exist in the Data_Store, THEN THE App_Container SHALL return a 404 response

### Requirement 4: Search Service

**User Story:** As a self-hosting operator, I want full-text search powered by Meilisearch in a local container, so that I do not need AWS-managed OpenSearch.

#### Acceptance Criteria

1. WHEN the Container_Stack starts, THE Search_Engine SHALL be available to the App_Container via an HTTP endpoint and API key environment variable
2. WHEN the application queries for campus data, THE App_Container SHALL send search requests to the Search_Engine using the Meilisearch HTTP API
3. WHEN the data ingest process runs, THE App_Container SHALL create indexes and add documents to the Search_Engine via the Meilisearch API
4. WHEN the Container_Stack is restarted, THE Search_Engine SHALL retain indexed data via a persistent volume

### Requirement 5: Authentication

**User Story:** As a self-hosting operator, I want simple username/password authentication with JWT, so that I do not need AWS Cognito or any external OAuth provider.

#### Acceptance Criteria

1. WHEN a new user submits a username and password, THE Auth_Module SHALL hash the password and store the credentials in the Database
2. WHEN a user submits valid credentials, THE Auth_Module SHALL return a signed JWT containing the user identifier
3. WHEN the App_Container receives a request with a valid JWT in the Authorization header, THE Auth_Module SHALL extract the user identity and attach it to the request context
4. IF a JWT is missing, malformed, or expired, THEN THE Auth_Module SHALL reject the request with a 401 response
5. WHERE the operator disables authentication via environment variable, THE App_Container SHALL allow unauthenticated access with a default user context

### Requirement 6: Docker Deployment

**User Story:** As a self-hosting operator, I want a single `docker compose up` command to start the entire application, so that deployment requires no cloud infrastructure.

#### Acceptance Criteria

1. THE Container_Stack SHALL define all services (app, database, search) in a single docker-compose.yml file
2. WHEN `docker compose up` is executed, THE Container_Stack SHALL start all services and the application SHALL be accessible on a configurable host port
3. THE App_Container SHALL include a multi-stage Dockerfile that builds and runs the Next.js application
4. WHEN environment variables are provided via a .env file, THE Container_Stack SHALL configure all services accordingly
5. THE Container_Stack SHALL use named volumes for database and search data persistence

### Requirement 7: AWS Dependency Removal

**User Story:** As a developer, I want all AWS SDK imports and infrastructure code removed, so that the codebase has zero AWS coupling.

#### Acceptance Criteria

1. THE App_Container source code SHALL contain zero imports from `@aws-sdk/*` packages
2. THE App_Container source code SHALL contain zero imports from `aws-jwt-verify`
3. THE repository SHALL not require the `infra/` CDK directory for application operation
4. WHEN the application builds, THE build process SHALL succeed without any AWS credentials in the environment
