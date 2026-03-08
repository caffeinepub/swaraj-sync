# Swaraj-Sync Platform

## Current State
New project. No existing backend or frontend code.

## Requested Changes (Diff)

### Add
- Full Swaraj-Sync application matching the system architecture diagram:
  1. **AI Chatbot** -- NLP-based intent engine that processes user messages, extracts entities, and routes to automation tasks (hotel, food, finance, tickets)
  2. **Automation Engine** -- Business logic layer that executes tasks: hotel booking, food orders, finance ops, ticket management
  3. **Buffer Layer** -- Temporary queue that holds tasks when cloud is unreachable; auto-flushes when online
  4. **Sync Engine** -- Detects online/offline state; syncs buffered items to cloud when connectivity is restored
  5. **Cloud Database** -- Persistent storage for all processed tasks, user data, and analytics
  6. **Business Dashboard** -- Analytics and reports view: task counts, success rates, buffer status, automation categories
  7. **Isolation Security** -- Role-based access control; secure and controlled access per user/session

### Modify
- None (new project)

### Remove
- None

## Implementation Plan
1. Backend (Motoko):
   - `ChatMessage` type: id, userId, content, intent, entities, timestamp
   - `AutomationTask` type: id, category (Hotel/Food/Finance/Ticket), payload, status (Pending/Processing/Done/Failed), createdAt
   - `BufferItem` type: id, taskId, retryCount, queuedAt
   - `CloudRecord` type: id, taskId, data, syncedAt
   - `AnalyticsRecord` type: category, total, success, failed
   - Functions: `sendMessage`, `getMessages`, `createTask`, `getTasks`, `getBufferQueue`, `flushBuffer`, `getCloudRecords`, `getAnalytics`, `getUserRole`, `setUserRole`
   - Authorization: admin and user roles
   - Buffer auto-flush logic: move buffer items to cloud records when triggered

2. Frontend:
   - Layout: sidebar nav + main content area (app-style, not website-style)
   - Pages/Views:
     - **Chat**: interactive chatbot UI with intent detection display
     - **Automation**: task list with category filters (Hotel/Food/Finance/Ticket), status badges
     - **Buffer Queue**: live buffer items list, flush button, online/offline indicator
     - **Cloud Database**: paginated records table with sync timestamps
     - **Dashboard**: analytics cards (total tasks, success rate, buffer size, categories breakdown), charts
     - **Security**: user management, role assignment, access logs
   - Architecture diagram shown as system overview on landing/home
