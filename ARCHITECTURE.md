# Architecture

## Overview

TaraHive uses a client-server architecture.

```text
React Native App
        │
 HTTPS REST API (JWT)
        │
        ▼
 Node.js Backend
```

## Frontend

Responsible for:

* UI
* State management
* API requests
* Secure JWT storage

The frontend never communicates directly with the database or third-party services.

Layer flow:

```text
UI (/app) - only handles UI, only mutates to hook
 → Hook - handles error handling and more, must only display info/error using toast.service and must not return it to UI 
 → Service
 → api/client - centralized backend connector
 → Backend
```

## Backend

Responsible for:

* Authentication
* Business logic
* Database operations
* Third-party integrations
* Response formatting

Layer flow:

```text
Route → Controller → Service → Database
```

## Request Flow

```text
Frontend
    │
HTTP Request
    │
    ▼
Backend
    │
Business Logic
    │
    ▼
Database / External Service
    │
    ▼
JSON Response
    │
    ▼
Frontend
```

## Design Principles

* Modular architecture
* Separation of concerns
* Stateless REST API
* JWT authentication
* Centralized business logic
* Easily extensible for new features and providers
