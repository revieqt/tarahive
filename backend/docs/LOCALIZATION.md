# Localization Module

## Overview

The Localization Module provides a simple API to serve translation strings for different language codes. It reads locale-specific JSON files from the `localization/locales/` directory and returns them as structured JSON responses.

---

## Module Structure

```
localization/
├── localization.routes.ts       # Express route definitions
├── localization.controller.ts   # Request/response handler
├── localization.service.ts      # Business logic and file I/O
└── locales/                     # Translation JSON files
    ├── en.json
    ├── fil.json
    ├── ceb.json
    └── ...
```

---

## API Reference

### `GET /api/locales/:lang`

Returns the translation JSON for the specified language code.

#### Parameters

| Parameter | Type   | Location | Description                            |
|-----------|--------|----------|----------------------------------------|
| `lang`    | string | Path     | Language code (e.g., `en`, `fil`, `ceb`) |

#### Response

**200 OK** — Returns the translation object for the requested language.

```json
{
  "greeting": "Hello",
  "farewell": "Goodbye",
  "welcome": "Welcome"
}
```

**404 Not Found** — Returned when the requested language file does not exist.

```json
{
  "error": "Language en not found"
}
```

#### Example Requests

```http
GET /api/locales/en
GET /api/locales/fil
GET /api/locales/ceb
```

---

## Components

### Route (`localization.routes.ts`)

Registers the endpoint and binds it to the controller method.

```typescript
router.get('/:lang', controller.getTranslations.bind(controller));
```

The router is mounted at `/api/locales`, so the full path is `/api/locales/:lang`.

---

### Controller (`localization.controller.ts`)

Handles the incoming HTTP request. Extracts the `lang` parameter (defaults to `'en'` if not provided) and delegates to the service. Returns the translation data or a 404 error response.

```typescript
const lang = req.params.lang || 'en';
const translations = await localizationService.getTranslations(lang);
```

---

### Service (`localization.service.ts`)

Contains the core logic for loading translations. It resolves the path to the appropriate JSON file inside the `locales/` directory, checks for file existence, reads the file, and parses it as JSON.

```typescript
const filePath = path.join(this.localesPath, `${lang}.json`);
```

Throws an error if the file does not exist, which the controller catches and returns as a 404 response.

---

## Adding a New Language

1. Create a new JSON file in the `localization/locales/` directory, named after the language code.

   ```
   localization/locales/ja.json
   ```

2. Populate it with key-value translation pairs:

   ```json
   {
     "greeting": "こんにちは",
     "farewell": "さようなら",
     "welcome": "ようこそ"
   }
   ```

3. The new language is immediately available via the API — no code changes required:

   ```http
   GET /api/locales/ja
   ```

---

## Supported Language Codes

Language codes follow a lowercase string convention matching the JSON filename (without extension).

| Code  | Language       |
|-------|----------------|
| `en`  | English        |
| `fil` | Filipino       |
| `ceb` | Cebuano        |

> Add more by placing the corresponding `<code>.json` file in the `locales/` directory.

---

## Error Handling

| Scenario                        | HTTP Status | Error Message              |
|---------------------------------|-------------|----------------------------|
| Language file not found         | `404`       | `Language {lang} not found` |
| Unexpected service-level error  | `404`       | Error message from thrown exception |

Errors are logged server-side via `console.error` in the service layer for debugging.

---

## Notes

- The `lang` parameter defaults to `'en'` if not supplied in the request, though the route definition requires it to be present in the URL path.
- All locale files must be valid JSON. Malformed JSON will result in a parse error propagated as a 404.
- The `localesPath` is resolved relative to the compiled service file location using `__dirname`.