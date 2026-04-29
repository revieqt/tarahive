# Audit Service Usage Guide (TaraG Backend)

## Overview

This document explains how to use the `LogAction` in the TaraG backend to record system events such as user actions, errors, warnings, and security-related activities.

The LogAction is designed to be a **centralized logging layer** that ensures consistency, traceability, and safety in production environments.

---

## Importing the LogAction

Before using it, import the service:

```ts
import { LogAction } from "../services/audit.service";
```

---

## Core Usage Methods

The service provides three main logging methods:

### 1. Info Logs (Normal Actions)

Used for successful operations and standard user activity.

```ts
await LogAction.info({
  userId: req.user.id,
  action: "CREATE_TRIP",
  module: "Trip",
  description: "User created a new trip",

  resourceType: "trip",
  resourceId: trip.id,

  ip: req.ip,
  platform: req.headers["user-agent"],
  requestId: (req as any).requestId,
});
```

---

### 2. Warning Logs (Suspicious or Unusual Activity)

Used for abnormal behavior such as failed login attempts or rate-limiting events.

```ts
await LogAction.warn({
  userId: user.id,
  action: "LOGIN_FAILED",
  module: "Auth",
  description: "Invalid login attempt detected",

  ip: req.ip,
  requestId: (req as any).requestId,
});
```

---

### 3. Error Logs (System Failures)

Used when an operation fails due to exceptions or system issues.

```ts
await LogAction.error({
  userId: req.user.id,
  action: "DELETE_TRIP",
  module: "Trip",

  resourceType: "trip",
  resourceId: tripId,

  errorMessage: error.message,

  ip: req.ip,
  requestId: (req as any).requestId,
});
```

---

## Common Usage Scenarios

### User Authentication

#### Login Success

```ts
await LogAction.info({
  userId: user.id,
  action: "LOGIN_SUCCESS",
  module: "Auth",

  ip: req.ip,
  platform: req.headers["user-agent"],
  requestId,
});
```

#### Login Failure

```ts
await LogAction.warn({
  action: "LOGIN_FAILED",
  module: "Auth",
  description: "Invalid credentials",

  ip: req.ip,
  requestId,
});
```

---

### CRUD Operations

#### Create

```ts
await LogAction.info({
  userId: req.user.id,
  action: "CREATE_TRIP",
  module: "Trip",
  resourceType: "trip",
  resourceId: trip.id,
});
```

#### Update

```ts
await LogAction.info({
  userId: req.user.id,
  action: "UPDATE_TRIP",
  module: "Trip",
  resourceType: "trip",
  resourceId: trip.id,
});
```

#### Delete

```ts
await LogAction.info({
  userId: req.user.id,
  action: "DELETE_TRIP",
  module: "Trip",
  resourceType: "trip",
  resourceId: trip.id,
});
```

---

## Best Practices

### Do

* Log only meaningful business actions
* Always include `action` and `module`
* Use correct severity levels (`info`, `warn`, `error`)
* Include `requestId` for tracing
* Include `resourceType` and `resourceId` when applicable

---

### Don’t

* Do NOT log every API request
* Do NOT store sensitive data (passwords, tokens)
* Do NOT expose logs to normal users
* Do NOT modify logs after creation

---

## Severity Guidelines

### INFO

Normal successful operations:

* User actions
* CRUD success
* Authentication success

### WARN

Suspicious or unusual behavior:

* Failed login attempts
* Rate limit triggers
* Invalid operations

### ERROR

System or operation failures:

* Database errors
* Unexpected exceptions
* Failed transactions

---

## Request Tracking

Each request should ideally include a `requestId` for tracing:

```ts
(req as any).requestId
```

This allows you to:

* Trace logs across services
* Debug production issues faster
* Correlate user actions

---

## Summary

The LogAction provides a structured way to track important system events in TaraG. It ensures:

* Consistency
* Debuggability
* Security awareness
* Production readiness

---

## End of Document
