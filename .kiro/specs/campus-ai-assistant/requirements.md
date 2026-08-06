# Requirements Document

## Introduction

A full-stack campus AI assistant built as a single Next.js application. Users sign in with Google (via Amazon Cognito), chat with an AI agent, and see campus buildings and walking routes on a deck.gl map. The backend is the same Next.js app's API route handlers (deployed to AWS Lambda), which validate Cognito tokens and run a tool-calling loop against Amazon Bedrock (Claude via the Converse API). The agent answers university questions (courses, tuition, walking distances) using tools backed by Amazon OpenSearch, which indexes university datasets stored in S3. DynamoDB persists chat sessions and user profiles. Streaming responses are out of scope.

## Glossary

- **Frontend**: The browser-facing part of the Next.js application: the sign-in flow, chat UI, and campus map.
- **Campus_Map**: The deck.gl map component in the Frontend rendering building locations and walking routes from GeoJSON data in S3.
- **Auth_Service**: Amazon Cognito user pool federated with Google OAuth, issuing tokens the Chat_API validates.
- **Chat_API**: The Next.js API route handlers exposing agent and session endpoints, validating Cognito tokens on every request, running in the server-side Lambda.
- **Agent_Loop**: The Lambda-resident loop that calls the Bedrock Converse API, executes requested tools, appends tool results, and repeats until completion.
- **Converse_API**: The non-streaming `bedrock-runtime.converse` operation used to invoke the Claude model, with model ID configurable via environment variable.
- **Tool_Executor**: The Lambda component that dispatches a model-requested tool call to the matching tool function and packages the result as a `toolResult` block.
- **Data_Tools**: The tool functions (`search_courses`, `get_course`, `get_tuition`, `walking_distance`) that query the Search_Index or S3-backed datasets.
- **Search_Index**: The Amazon OpenSearch index holding university data (courses, sections, tuition, buildings, walking distances) ingested from source files in the Data_Bucket.
- **Data_Bucket**: The S3 bucket holding source university datasets and the GeoJSON files for buildings and walking routes.
- **Session_Store**: The DynamoDB table(s) persisting chat sessions (per-user message history) and user profiles/preferences.
- **Ingest_Script**: The script that loads source data from the Data_Bucket into the Search_Index.
- **Time_Formatter**: The function converting seconds-after-midnight integers (e.g., 55800) into zero-padded 24-hour HH:MM strings (e.g., "15:30").
- **Iteration_Limit**: The maximum number of Converse_API calls per chat request, set to 8.

## Requirements

### Requirement 1: Authentication

**User Story:** As a student, I want to sign in with my Google account, so that my chats are private and saved to me.

#### Acceptance Criteria

1. WHEN a user completes Google sign-in, THE Auth_Service SHALL issue tokens that the Frontend attaches to all Chat_API requests.
2. IF a Chat_API request lacks a valid Cognito token, THEN THE Chat_API SHALL reject the request with an HTTP 401 response.
3. WHEN an authenticated request reaches the Agent_Loop, THE Agent_Loop SHALL derive the user identity from the validated token rather than from the request body.
4. WHEN a signed-in user returns to the Frontend with a valid session, THE Frontend SHALL restore the authenticated state without requiring sign-in again.

### Requirement 2: Chat API and Agent Loop

**User Story:** As a student, I want to ask questions in a chat and get answers grounded in university data, so that I can plan my courses and campus movement.

#### Acceptance Criteria

1. WHEN an authenticated client sends a chat request containing `messages` and `session_id`, THE Chat_API SHALL invoke the Agent_Loop with the request.
2. WHEN a valid request is received, THE Agent_Loop SHALL call the Converse_API with the conversation messages, the system prompt, and the tool configuration.
3. WHEN a Converse_API response has `stopReason` equal to `tool_use`, THE Agent_Loop SHALL execute each requested tool via the Tool_Executor, append the corresponding `toolResult` blocks to the conversation, and call the Converse_API again.
4. WHEN a Converse_API response has `stopReason` equal to `end_turn`, THE Agent_Loop SHALL return a JSON response containing the final assistant text and a structured list of the tool calls made (tool name and input for each).
5. IF the Agent_Loop completes 8 Converse_API calls without an `end_turn` stop reason, THEN THE Agent_Loop SHALL stop iterating and include in the response body both the best-effort assistant text and a warning field indicating the Iteration_Limit was reached.
6. THE Agent_Loop SHALL use the non-streaming Converse_API for all model invocations.
7. THE Agent_Loop SHALL provide a system prompt instructing the model to answer using tools, cite which tool data came from, and present values in human units (HH:MM times, minutes walking, CAD amounts).
8. IF the request body is missing the `messages` field, contains an empty `messages` array, or is not valid JSON, THEN THE Agent_Loop SHALL return an HTTP 400 response with a descriptive error message.
9. IF an unhandled error occurs during processing, THEN THE Agent_Loop SHALL return an HTTP 500 response with a JSON error body.

### Requirement 3: Agent Data Tools

**User Story:** As a student, I want the agent to look up courses, tuition, and walking distances, so that I get accurate university-specific answers.

#### Acceptance Criteria

1. WHEN the model requests `search_courses` with a keyword query and optional filters (`subject`, `credits`, `term`, `has_no_prereqs`, `limit` default 20), THE Data_Tools SHALL execute a keyword search against the Search_Index and return matching courses with their sections, treating `has_no_prereqs=true` as matching courses whose prerequisite field is null or empty.
2. WHEN the model requests `get_course` with a course code, THE Data_Tools SHALL return the full course record including prerequisite and corequisite fields as a JSON string in the `toolResult`.
3. WHEN the model requests `get_tuition` with `program_slug`, `student_type`, and `cohort_year`, THE Data_Tools SHALL return the per-credit rate in CAD.
4. WHEN the model requests `walking_distance` with `from_building` and `to_building`, THE Data_Tools SHALL return the distance in meters and duration in minutes between the two buildings.
5. THE Data_Tools SHALL define each tool in the Converse `toolConfig` with a JSON schema containing typed properties, descriptions of inputs and returned fields, and required fields marked.
6. IF a tool query matches no results or a tool raises an error, THEN THE Tool_Executor SHALL return a `toolResult` containing `status: "error"` and a descriptive message, and THE Agent_Loop SHALL continue iterating.
7. WHEN a tool response includes section times, THE Time_Formatter SHALL convert `start_seconds` and `end_seconds` values into zero-padded 24-hour HH:MM strings (e.g., 55800 becomes "15:30").

### Requirement 4: Data Storage and Indexing

**User Story:** As a developer, I want university data stored in S3 and indexed into OpenSearch, so that the agent tools have data to query end to end.

#### Acceptance Criteria

1. THE Data_Bucket SHALL hold the source university datasets (courses, sections, programs, tuition, buildings, walking distances) and the GeoJSON files for building locations and walking routes.
2. WHEN the Ingest_Script runs against a populated Data_Bucket, THE Ingest_Script SHALL load the university datasets into the Search_Index such that each of the four Data_Tools can return at least one non-empty result.
3. WHEN the Ingest_Script runs a second time, THE Ingest_Script SHALL leave the Search_Index in a valid state without duplicate documents.
4. THE Data_Bucket SHALL contain sample data of at least 12 records per dataset.

### Requirement 5: Chat Sessions and User Profiles

**User Story:** As a student, I want my conversations saved, so that I can revisit and continue them later.

#### Acceptance Criteria

1. WHEN a chat exchange completes, THE Agent_Loop SHALL persist the user message and assistant response to the Session_Store under the authenticated user's identity and the request's `session_id`.
2. WHEN an authenticated user requests their session list, THE Chat_API SHALL return the user's sessions with identifiers and enough metadata to distinguish them (e.g., title or first message and timestamp).
3. WHEN an authenticated user opens an existing session, THE Chat_API SHALL return that session's message history in chronological order.
4. IF a user requests a session that does not belong to them, THEN THE Chat_API SHALL reject the request without returning another user's data.
5. THE Session_Store SHALL persist user profile data (e.g., preferences) keyed by the authenticated user's identity.

### Requirement 6: Chat Frontend

**User Story:** As a student, I want a clean chat interface, so that I can converse with the assistant easily.

#### Acceptance Criteria

1. WHEN an authenticated user submits a message, THE Frontend SHALL send it with the current `session_id` to the Chat_API and display the assistant's response in the conversation.
2. WHILE a request is in flight, THE Frontend SHALL display a loading indicator and prevent duplicate submission of the same message.
3. WHEN a response includes tool calls, THE Frontend SHALL indicate which tools the agent used.
4. WHEN a user selects a previous session, THE Frontend SHALL load and display that session's history.
5. IF a Chat_API request fails, THEN THE Frontend SHALL display an error message and allow the user to retry.

### Requirement 7: Campus Map

**User Story:** As a student, I want to see buildings and walking routes on a map, so that I can visualize the agent's answers about campus.

#### Acceptance Criteria

1. WHEN the map view loads, THE Campus_Map SHALL render campus building locations from the GeoJSON data in the Data_Bucket.
2. WHEN an agent response includes a `walking_distance` tool call, THE Campus_Map SHALL highlight the origin and destination buildings and render the walking route between them.
3. WHEN a user selects a building on the map, THE Campus_Map SHALL display the building's name and code.

### Requirement 8: Configuration and Infrastructure

**User Story:** As an operator, I want infrastructure defined as code and runtime settings in environment variables, so that deployment is reproducible and configurable.

#### Acceptance Criteria

1. THE infrastructure definition SHALL include the Cognito user pool with Google identity provider, the Next.js deployment (server Lambda function, CDN, and static assets), DynamoDB table(s), OpenSearch domain or serverless collection, and S3 bucket.
2. THE infrastructure definition SHALL grant the Lambda role only `bedrock:InvokeModel`, read/write access to the Session_Store, query access to the Search_Index, and read access to the Data_Bucket.
3. THE Agent_Loop SHALL read the Bedrock model ID, OpenSearch endpoint, DynamoDB table name(s), and Data_Bucket name from environment variables.
4. THE README SHALL document the deploy steps, data ingestion procedure, Google OAuth setup, and a sample request whose question requires at least two tool calls.
