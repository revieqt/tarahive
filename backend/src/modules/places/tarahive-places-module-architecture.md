# TaraHive Places Module

## System Architecture and Technical Specification

**Status:** Proposed architecture\
**Scope:** Reusable places discovery, aggregation, persistence, caching,
and synchronization system\
**Primary stack:** Node.js, TypeScript, Express, PostgreSQL, PostGIS,
Redis\
**Document purpose:** Engineering reference for implementing the Places
module as a shared capability across TaraHive.

------------------------------------------------------------------------

## 1. Overview

The Places module is a centralized service responsible for discovering,
retrieving, normalizing, storing, and serving geographic places.

It must provide a consistent internal dataset so other TaraHive modules
do not need to integrate directly with external place providers.

Potential consumers include:

-   Tourist spot recommendations
-   Itinerary location search and location blocks
-   SOS Nearby Help
-   Nearby restaurants, hotels, and attractions
-   General map and place discovery features

The long-term objective is to progressively build a useful first-party
places dataset while retaining the ability to retrieve missing or
updated information from external providers.

### 1.1 Core principles

1.  **PostgreSQL is the canonical dataset.** It stores normalized place
    records and provider references.
2.  **Redis is an acceleration layer.** It stores temporary search
    results and frequently accessed place records.
3.  **Provider independence.** Business logic must not depend on Google
    Places, OpenStreetMap, or any provider-specific response format.
4.  **Canonical identifiers.** TaraHive generates its own UUID for every
    canonical place. Frontend clients must not depend on external
    provider IDs.
5.  **Geographic search.** Use PostGIS for radius-based and spatial
    queries rather than exact coordinate matching.
6.  **Incremental dataset growth.** Provider results may enrich the
    local dataset, subject to the provider's storage and licensing
    rules.
7.  **Data provenance.** Provider-specific identifiers, ratings, review
    counts, attribution, and retrieval timestamps must remain associated
    with their source.
8.  **Graceful degradation.** If an external provider is unavailable,
    return suitable local results where possible.
9.  **No unnecessary AI dependency.** Retrieval, normalization,
    filtering, and ranking should be deterministic. AI can be used by
    consuming features for explanations or itinerary assistance.

------------------------------------------------------------------------

## 2. High-Level Architecture

``` text
Mobile / Web Client
        |
        v
Places API Controller
        |
        v
Places Service
        |
        +----------------------+
        |                      |
        v                      v
   Redis Cache             Request Coalescing
        |
        | Cache miss
        v
Places Search Service
        |
        v
PostgreSQL + PostGIS
        |
        | Insufficient coverage / stale data
        v
Places Provider Interface
        |
        +--------------------+
        |                    |
        v                    v
 Google Places          OpenStreetMap
        |
        v
Provider Adapter
        |
        v
Normalization and Validation
        |
        v
Place Matching / Deduplication
        |
        v
PostgreSQL Upsert
        |
        v
Redis Cache Population
        |
        v
API Response
```

The diagram represents the logical flow. The actual implementation
should distinguish between a synchronous user search and background
synchronization.

### 2.1 Responsibilities

  -----------------------------------------------------------------------
  Component                           Responsibility
  ----------------------------------- -----------------------------------
  Places controller                   HTTP validation, authentication
                                      context, response formatting

  Places service                      Orchestrates the search pipeline

  Places search service               Performs local geographic and text
                                      searches

  Places cache service                Builds cache keys, reads/writes
                                      Redis, invalidates cache

  Places sync service                 Handles provider synchronization
                                      and data refresh

  Places repository                   Queries and persists canonical
                                      place records

  Place sources repository            Manages provider-to-canonical place
                                      mappings

  Provider adapter                    Communicates with one external
                                      provider

  Normalizer                          Converts provider results into the
                                      internal format

  Deduplication service               Matches provider records to
                                      existing canonical places

  Background queue                    Runs refresh, enrichment, and
                                      synchronization jobs
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 3. Request and Retrieval Pipeline

### 3.1 Standard search flow

1.  The frontend sends a search request containing coordinates and
    optional filters.
2.  The backend validates and normalizes the request.
3.  The Places service creates a deterministic cache key.
4.  Redis is checked for a cached search result.
5.  On a cache hit, the backend resolves the cached place IDs and
    returns the result.
6.  On a cache miss, PostgreSQL is queried using PostGIS and the
    requested filters.
7.  The backend evaluates whether the local result set is sufficient and
    fresh enough.
8.  If sufficient, return the local results and populate Redis.
9.  If insufficient, request additional data from configured providers.
10. Provider results are normalized and validated.
11. The deduplication process determines whether each result matches an
    existing canonical place.
12. New or permitted updated data is persisted to PostgreSQL.
13. Search results are cached in Redis.
14. The API returns a standardized response.

### 3.2 Important distinction: search cache versus place cache

Use separate cache entries for search results and individual place
records.

  ------------------------------------------------------------------------------------------------
  Cache                   Example key                                      Value
  ----------------------- ------------------------------------------------ -----------------------
  Place cache             `places:item:{placeId}`                          Serialized canonical
                                                                           place response

  Search cache            `places:search:{hash}`                           Ordered place IDs and
                                                                           pagination metadata

  Optional provider cache `places:provider:{provider}:{providerPlaceId}`   Short-lived provider
                                                                           lookup result, where
                                                                           permitted
  ------------------------------------------------------------------------------------------------

Search cache keys must account for every input that changes the result:

-   Normalized geographic area or coordinates
-   Search radius
-   Keyword
-   Category filters
-   Language
-   Sort order
-   Pagination or page size
-   Other supported filters

Do not use raw, unrounded GPS coordinates as the only cache-key
component. This creates a large number of nearly identical cache
entries. Use a consistent geographic cell or coordinate precision
strategy appropriate to the search radius.

### 3.3 Cache hit behavior

A search cache hit should return the cached ordered place IDs and
metadata. If the response requires place details, retrieve them from the
place cache or batch-load missing records from PostgreSQL.

Do not assume that a cached search result is valid forever. Cache
entries must have a TTL and must be invalidated when relevant place data
changes.

### 3.4 PostgreSQL hit behavior

When PostgreSQL has sufficient, usable results:

-   Return the local results.
-   Populate the Redis search cache.
-   Populate individual place cache entries as appropriate.
-   Do not call an external provider unnecessarily.

A local result is not necessarily sufficient just because one or more
records exist. Sufficiency depends on the requested category, radius,
keyword, result limit, geographic coverage, and freshness policy.

### 3.5 Provider fallback behavior

When local coverage is insufficient:

-   Query the configured provider adapter.
-   Normalize and validate provider responses.
-   Deduplicate against canonical records.
-   Persist only fields that the provider's terms allow TaraHive to
    store.
-   Return the merged result set.
-   Cache the final search result.

The system must not promise complete local coverage merely because a
geographic query returned some records.

### 3.6 Partial failure behavior

If PostgreSQL returns useful results but the provider is unavailable,
return the local results with appropriate metadata indicating that the
result set may be incomplete.

If no local results exist and all providers fail, return a controlled
service error rather than an empty successful result that implies no
places exist.

Do not expose provider API keys or raw provider error payloads to
clients.

------------------------------------------------------------------------

## 4. Synchronous Search and Background Processing

Use a hybrid model.

### 4.1 Synchronous operations

These should normally occur during the user's request:

-   Request validation
-   Redis lookup
-   PostgreSQL geographic search
-   Provider fallback when needed
-   Normalization and basic validation
-   Deduplication
-   Required database persistence
-   Search cache population
-   Response generation

The initial implementation can perform provider retrieval and
persistence synchronously to ensure newly discovered places are
available in the response and local dataset.

### 4.2 Asynchronous operations

Move work that does not need to delay the user's response to background
jobs:

-   Refreshing stale records
-   Enriching descriptions
-   Fetching additional photos, subject to licensing
-   Updating opening hours
-   Periodic geographic synchronization
-   Data quality checks
-   Rebuilding or invalidating derived caches
-   Retry of transient provider failures

Use the existing queue infrastructure or introduce BullMQ with Redis
when background processing is needed.

### 4.3 Request coalescing

Prevent multiple concurrent requests for the same uncached search from
causing duplicate provider calls.

Use a distributed lock or request coalescing mechanism keyed by the
normalized search key.

Example:

``` text
Request A ----\
Request B -----+---- Same search key
Request C ----/           |
                           v
                    One provider request
                           |
                           v
                  Normalize and persist
                           |
                           v
                  Share the resulting data
```

Locks must have a finite TTL, safe release behavior, and protection
against one process releasing another process's lock. A waiting request
should re-check Redis or PostgreSQL after the lock holder finishes.

------------------------------------------------------------------------

## 5. Data Freshness and Coverage

### 5.1 Freshness

A place can exist locally but contain outdated information. Track
verification and source retrieval times separately.

Recommended concepts:

-   `lastVerifiedAt`: when the canonical record was last checked for
    general validity.
-   `fetchedAt` on a source record: when data was last retrieved from
    that provider.
-   `updatedAt`: when the local database record was last modified.

Do not treat `updatedAt` as proof that the external information is
current.

### 5.2 Stale-while-revalidate

For data that is still usable but older than the preferred freshness
window:

1.  Return the local record immediately.
2.  Mark it as stale or potentially outdated in internal metadata.
3.  Enqueue a refresh job.
4.  Update the record after successful refresh.
5.  Invalidate affected Redis cache entries.

For critical fields such as closure status or emergency contact
information, use stricter freshness policies where the provider supports
reliable updates.

### 5.3 Geographic coverage

A future coverage mechanism should track which geographic areas and
categories have been synchronized.

A possible `place_coverage` table:

  Field                   Purpose
  ----------------------- ----------------------------------------------------
  id                      Primary UUID
  geographicCell          Normalized geographic cell identifier
  categoryId              Category synchronized; nullable for broad coverage
  provider                Provider used
  lastSynchronizedAt      Last successful synchronization
  synchronizationStatus   PENDING, RUNNING, COMPLETED, FAILED
  resultCount             Number of records discovered
  createdAt / updatedAt   Audit timestamps

Coverage must be interpreted carefully. A completed provider search does
not guarantee that every place in that area is known. Coverage is
evidence of a search attempt, not proof of exhaustive completeness.

This table can be added after the basic search pipeline is working.

------------------------------------------------------------------------

## 6. Database Design

Use PostgreSQL with the PostGIS extension enabled.

### 6.1 `places`

The canonical place table.

  ----------------------------------------------------------------------------------
  Field               Suggested type                  Nullable Description
  ------------------- ------------------ --------------------- ---------------------
  id                  UUID                                  No TaraHive canonical
                                                               identifier

  name                VARCHAR(255)                          No Display name

  normalizedName      VARCHAR(255)                         Yes Normalized name for
                                                               matching/search

  description         TEXT                                 Yes General description,
                                                               when licensed or
                                                               authored

  location            GEOGRAPHY(Point,                      No Geographic
                      4326)                                    coordinates

  address             VARCHAR(500)                         Yes Formatted address

  city                VARCHAR(150)                         Yes City or municipality

  province            VARCHAR(150)                         Yes Province or state

  country             VARCHAR(100)                         Yes Country

  countryCode         VARCHAR(2)                           Yes ISO 3166-1 alpha-2
                                                               code

  primaryCategoryId   UUID                                 Yes Main category

  website             TEXT                                 Yes Official website,
                                                               when verified

  phone               VARCHAR(50)                          Yes Contact number

  status              ENUM                                  No ACTIVE, CLOSED,
                                                               TEMPORARILY_CLOSED,
                                                               UNKNOWN

  lastVerifiedAt      TIMESTAMP                            Yes Last verification
                                                               timestamp

  createdAt           TIMESTAMP                             No Creation timestamp

  updatedAt           TIMESTAMP                             No Last modification
                                                               timestamp
  ----------------------------------------------------------------------------------

Implementation notes:

-   Use a GiST index on `location`.
-   Add indexes for commonly filtered fields such as
    `primaryCategoryId`, `countryCode`, and `status`.
-   Add suitable text-search indexes if keyword search is required.
-   Consider a unique constraint only when a reliable canonical
    uniqueness rule exists. Do not assume place names are globally
    unique.
-   Store coordinates in PostGIS geography or geometry consistently. For
    distance-in-meters searches, geography is convenient.
-   When creating points, remember that PostGIS point construction uses
    longitude first, then latitude.

Example:

``` sql
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE INDEX idx_places_location
ON places
USING GIST (location);
```

Example radius search:

``` sql
SELECT *
FROM places
WHERE ST_DWithin(
    location,
    ST_SetSRID(
        ST_MakePoint(:longitude, :latitude),
        4326
    )::geography,
    :radiusMeters
);
```

### 6.2 `place_sources`

Maps external provider records to canonical TaraHive places.

  Field             Suggested type     Nullable Description
  ----------------- ---------------- ---------- ----------------------------------
  id                UUID                     No Primary identifier
  placeId           UUID                     No Canonical place reference
  provider          VARCHAR(50)              No GOOGLE, OSM, or another provider
  providerPlaceId   VARCHAR(255)             No External provider identifier
  sourceUrl         TEXT                    Yes Provider or source URL
  rating            DECIMAL(2,1)            Yes Provider-specific rating
  reviewCount       INTEGER                 Yes Provider-specific review count
  fetchedAt         TIMESTAMP                No Last retrieval time
  createdAt         TIMESTAMP                No Creation timestamp
  updatedAt         TIMESTAMP                No Modification timestamp

Constraints and indexes:

-   Unique `(provider, providerPlaceId)`.
-   Index `placeId`.
-   Foreign key to `places.id`.
-   Validate provider rating ranges before saving.
-   Keep provider-specific data attributed to its source.

Do not store provider fields indefinitely unless the provider's terms
permit it. A source table makes provenance and retention management
easier, but it does not override provider licensing restrictions.

### 6.3 `place_categories`

Stores reusable hierarchical categories.

  Field         Suggested type     Nullable Description
  ------------- ---------------- ---------- ------------------------
  id            UUID                     No Primary identifier
  name          VARCHAR(100)             No Display name
  slug          VARCHAR(100)             No Stable category key
  description   TEXT                    Yes Category description
  parentId      UUID                    Yes Parent category
  createdAt     TIMESTAMP                No Creation timestamp
  updatedAt     TIMESTAMP                No Modification timestamp

Examples:

``` text
Tourist Attraction
  Natural Attraction
    Waterfall
    Mountain
    Beach
    Cave
  Historical Site
  Museum
  Cultural Site

Food and Dining
  Restaurant
  Cafe
  Food Market

Accommodation
  Hotel
  Resort
  Hostel
```

Use a self-referencing parent relationship for category hierarchy.

### 6.4 `place_category_relations`

Use a junction table if a place can belong to multiple categories.

  Field        Suggested type   Description
  ------------ ---------------- ------------------------------------
  placeId      UUID             Canonical place
  categoryId   UUID             Assigned category
  source       VARCHAR(50)      Optional classification provenance
  createdAt    TIMESTAMP        Creation timestamp

Use a composite unique constraint on `(placeId, categoryId)`.

### 6.5 Optional future `place_photos`

Add this when photo management is required.

Potential fields:

-   `id`
-   `placeId`
-   `provider`
-   `providerPhotoId`
-   `url` or TaraHive storage key, depending on rights
-   `attribution`
-   `width`
-   `height`
-   `fetchedAt`
-   `createdAt`

Do not download, copy, or permanently store provider photos unless the
provider's terms allow it. Some providers require using a photo
reference through their API rather than storing the image itself.

------------------------------------------------------------------------

## 7. Provider Abstraction

External providers must be isolated behind a shared interface.

Example:

``` typescript
export interface PlacesProvider {
  searchNearby(params: {
    latitude: number;
    longitude: number;
    radiusMeters: number;
    categories?: string[];
    keyword?: string;
    language?: string;
    limit?: number;
  }): Promise<NormalizedProviderPlace[]>;

  getPlaceDetails?(
    providerPlaceId: string,
    language?: string,
  ): Promise<NormalizedProviderPlace | null>;
}
```

The exact methods can evolve as provider requirements become clearer.

### 7.1 Normalized provider model

All provider adapters should map their responses into one internal
structure.

Example:

``` typescript
export interface NormalizedProviderPlace {
  provider: string;
  providerPlaceId: string;

  name: string;
  description?: string | null;

  latitude: number;
  longitude: number;

  address?: string | null;
  city?: string | null;
  province?: string | null;
  country?: string | null;
  countryCode?: string | null;

  categories?: string[];
  website?: string | null;
  phone?: string | null;

  rating?: number | null;
  reviewCount?: number | null;

  status?: string | null;
  sourceUrl?: string | null;
}
```

This is an internal example, not a requirement to persist every
property. Provider-specific fields must be retained only when permitted.

### 7.2 Provider adapters

Suggested structure:

``` text
src/infrastructure/places/
├── providers/
│   ├── google-places.provider.ts
│   └── osm.provider.ts
├── interfaces/
│   └── places-provider.interface.ts
├── models/
│   └── normalized-provider-place.ts
└── places-provider.factory.ts
```

Each adapter is responsible for:

-   Authentication and API configuration
-   Provider-specific request construction
-   Rate-limit handling
-   Provider response parsing
-   Mapping into the normalized model
-   Provider-specific error translation
-   Compliance with provider storage, attribution, and caching
    requirements

The Places module should not contain provider-specific HTTP requests.

### 7.3 Provider selection

Use configuration or a provider factory to select providers.

The provider abstraction should support:

-   One primary provider
-   Multiple providers
-   Provider fallback
-   Provider-specific rate limits
-   Provider enable/disable configuration

Avoid querying every provider for every request. Provider selection
should be deliberate and cost-aware.

------------------------------------------------------------------------

## 8. Deduplication and Canonical Place Matching

Different providers may refer to the same real-world location.

For example:

``` text
Google: Kawasan Falls
OSM: Kawasan Waterfalls
TaraHive: Kawasan Falls
```

These should ideally map to one canonical TaraHive place.

### 8.1 Matching signals

Use a combination of:

1.  Existing provider mapping: exact provider and provider place ID.
2.  Geographic proximity: coordinates are close.
3.  Normalized name similarity.
4.  Address similarity.
5.  Category compatibility.

### 8.2 Suggested matching sequence

``` text
Incoming provider result
        |
        v
Look up provider + providerPlaceId
        |
        +---- Found ----> Update permitted source data
        |
        v
Search nearby canonical places
        |
        v
Compare normalized names and addresses
        |
        +---- Strong match ----> Attach source to existing place
        |
        +---- No reliable match -> Create canonical place
```

Do not automatically merge records based only on similar names. Two
branches of the same business or two nearby attractions may have similar
names.

For uncertain matches, preserve separate records or flag them for later
review.

### 8.3 Database safety

-   Use transactions when creating a canonical place and its source
    mapping.
-   Enforce the provider mapping unique constraint.
-   Handle concurrent upserts safely.
-   Make the process idempotent: processing the same provider result
    more than once should not create duplicate source mappings or
    canonical places.

------------------------------------------------------------------------

## 9. Redis Caching Strategy

### 9.1 Suggested key patterns

``` text
places:item:{placeId}
places:search:{searchHash}
places:provider-lock:{searchHash}
places:refresh-lock:{placeId}
```

### 9.2 TTL strategy

Initial values are suggestions and should be adjusted using observed
traffic and provider rules.

  Cache type                 Initial TTL suggestion
  ------------------------ ------------------------
  Individual place                         24 hours
  Search result                      15--60 minutes
  Provider request lock              30--60 seconds
  Negative search result               2--5 minutes

Do not cache provider data for longer than its applicable terms allow.

### 9.3 Cache invalidation

Invalidate or refresh relevant cache entries when:

-   A place is updated.
-   A place's status changes.
-   A category relationship changes.
-   A place is merged into another canonical record.
-   A place is deleted or hidden.
-   A provider refresh changes a field used in search results.

Search caches are harder to invalidate because a place can appear in
many geographic searches. Initially, short TTLs are a practical
solution. More advanced invalidation can be introduced later.

### 9.4 Cache failure

Redis should not be a single point of failure for place discovery.

If Redis is unavailable:

-   Continue with PostgreSQL.
-   Use provider fallback when required.
-   Skip cache reads and writes.
-   Log the cache failure.
-   Avoid failing the entire Places API request solely because Redis is
    down.

------------------------------------------------------------------------

## 10. API Design

The following endpoints are proposed. Route names can be adapted to the
existing API versioning conventions.

### 10.1 Nearby search

``` http
GET /api/v1/places/nearby
```

Query parameters:

  Parameter          Type              Required Description
  ------------------ --------------- ---------- -----------------------------
  latitude           number                 Yes Search center latitude
  longitude          number                 Yes Search center longitude
  radius             number                  No Search radius in meters
  categoryIds        string\[\]              No Category filters
  keyword            string                  No Text search
  language           string                  No Preferred response language
  limit              number                  No Maximum result count
  offset or cursor   string/number           No Pagination

Example:

``` http
GET /api/v1/places/nearby?latitude=10.3157&longitude=123.8854&radius=10000&limit=20
```

### 10.2 Get place details

``` http
GET /api/v1/places/:placeId
```

The ID must be TaraHive's canonical UUID.

### 10.3 Search places

``` http
GET /api/v1/places/search
```

Supports keyword-based discovery, optionally constrained by coordinates,
radius, and categories.

### 10.4 List categories

``` http
GET /api/v1/places/categories
```

### 10.5 Internal synchronization endpoints

If administrative synchronization is exposed over HTTP, protect it with
appropriate admin authorization. Prefer queue/job initiation and
operational tooling over exposing unrestricted provider synchronization
to ordinary users.

------------------------------------------------------------------------

## 11. API Response Format

Return a consistent response regardless of the data source.

Example:

``` json
{
  "success": true,
  "data": [
    {
      "id": "canonical-place-uuid",
      "name": "Example Waterfall",
      "description": null,
      "latitude": 10.1234567,
      "longitude": 123.1234567,
      "address": "Example address",
      "categories": [
        {
          "id": "category-uuid",
          "name": "Waterfall",
          "slug": "waterfall"
        }
      ],
      "rating": {
        "value": 4.6,
        "reviewCount": 120,
        "source": "GOOGLE"
      },
      "status": "ACTIVE"
    }
  ],
  "meta": {
    "limit": 20,
    "nextCursor": null,
    "hasMore": false,
    "source": "LOCAL_AND_EXTERNAL",
    "possiblyIncomplete": false
  }
}
```

This is illustrative. The final response contract should follow
TaraHive's existing API conventions.

Important response rules:

-   Always return canonical TaraHive place IDs.
-   Do not expose provider API credentials or internal source payloads.
-   Attribute provider-specific ratings and other provider-derived
    fields.
-   Do not imply that a result set is exhaustive unless that can be
    established.
-   Keep response metadata stable and documented.

------------------------------------------------------------------------

## 12. Search Ranking

The Places module should initially focus on retrieval and filtering.
Recommendation ranking can remain a separate concern.

For general nearby search, a basic ordering can use:

1.  Distance
2.  Text relevance, when a keyword is supplied
3.  Category relevance
4.  Data quality or completeness

For personalized tourist recommendations, create a separate
Recommendation module that consumes Places data and user interests.

An example future scoring model:

``` text
Final Score =
  Interest Match       * 0.50
+ Distance Score       * 0.25
+ Popularity Score     * 0.15
+ Data Quality Score   * 0.10
```

Do not mix user-specific recommendation scores into canonical place
records. They depend on the user and request context.

------------------------------------------------------------------------

## 13. Security, Reliability, and Data Quality

### 13.1 Request validation

Validate:

-   Latitude between -90 and 90.
-   Longitude between -180 and 180.
-   Radius within configured limits.
-   Limit within a safe maximum.
-   Valid category IDs.
-   Keyword length and character constraints.
-   Supported language codes.

Never allow the client to select arbitrary provider URLs or pass raw
provider credentials.

### 13.2 Provider resilience

Implement:

-   Request timeouts
-   Bounded retries for transient failures
-   Exponential backoff with jitter
-   Provider rate-limit handling
-   Circuit breaker behavior when appropriate
-   Provider-specific quotas and usage metrics

Do not retry invalid requests or permanent provider errors indefinitely.

### 13.3 Data validation

Validate normalized provider results before persistence:

-   Name is present and usable.
-   Coordinates are valid.
-   Provider ID is present.
-   Rating and review count are within expected bounds.
-   Categories map to supported internal categories where possible.
-   URLs and phone values are normalized.
-   Provider-specific retention rules are satisfied.

### 13.4 Privacy

Avoid logging precise user coordinates unnecessarily. Use aggregated or
appropriately rounded location information in operational logs where
possible.

Do not retain a user's search history or precise location as part of the
Places dataset unless a separate product requirement and privacy policy
justify it.

------------------------------------------------------------------------

## 14. Observability

Track metrics that reveal whether the local dataset is reducing external
provider usage.

Recommended metrics:

  Metric                     Purpose
  -------------------------- -----------------------------------
  Redis hit rate             Measures cache effectiveness
  PostgreSQL hit rate        Measures local dataset usefulness
  Provider fallback rate     Measures external dependency
  Provider request count     Tracks provider usage and cost
  Provider latency           Detects external slowness
  Search latency             Measures end-to-end performance
  Deduplication match rate   Measures data reuse
  New canonical places       Tracks dataset growth
  Failed provider requests   Tracks reliability
  Stale record count         Tracks data freshness

Use structured logs with a request ID and provider name. Avoid logging
API keys, unnecessary personal data, or precise user coordinates.

------------------------------------------------------------------------

## 15. Provider Licensing and Data Ownership

This is a foundational requirement, not an optional legal detail.

A successful provider response does not automatically mean TaraHive can
permanently store every returned field.

Before integrating a provider, document:

-   Whether place IDs can be stored.
-   Whether names, addresses, coordinates, descriptions, and categories
    can be persisted.
-   Whether ratings and review counts can be cached or stored.
-   Whether photos can be downloaded or only referenced.
-   Required attribution and display rules.
-   Cache TTL restrictions.
-   Deletion or refresh obligations.
-   Whether derived or combined datasets can be retained.

Keep provider-specific fields separate from independently maintained
TaraHive fields.

Prefer open datasets with licenses compatible with TaraHive's intended
use. OpenStreetMap data, for example, is available under the ODbL and
has attribution and share-alike obligations that must be considered when
distributing derived databases.

The architecture must support provider-specific retention and deletion
policies. A provider adapter and source record should not be treated as
permission to retain data indefinitely.

------------------------------------------------------------------------

## 16. Suggested Project Structure

Adapt names to existing TaraHive conventions, but preserve the
separation between business logic and provider integrations.

``` text
src/
├── modules/
│   └── places/
│       ├── controllers/
│       │   └── places.controller.ts
│       ├── services/
│       │   ├── places.service.ts
│       │   ├── places-search.service.ts
│       │   ├── places-cache.service.ts
│       │   ├── places-sync.service.ts
│       │   └── places-deduplication.service.ts
│       ├── repositories/
│       │   ├── places.repository.ts
│       │   ├── place-sources.repository.ts
│       │   └── place-categories.repository.ts
│       ├── entities/
│       │   ├── places.entity.ts
│       │   ├── place-sources.entity.ts
│       │   ├── place-categories.entity.ts
│       │   └── place-category-relations.entity.ts
│       ├── interfaces/
│       │   ├── place.interface.ts
│       │   └── place-search.interface.ts
│       ├── dto/
│       │   ├── nearby-places.dto.ts
│       │   └── search-places.dto.ts
│       ├── places.routes.ts
│       └── places.module.ts
│
├── infrastructure/
│   ├── database/
│   ├── redis/
│   ├── queue/
│   └── places/
│       ├── providers/
│       │   ├── google-places.provider.ts
│       │   └── osm.provider.ts
│       ├── interfaces/
│       │   └── places-provider.interface.ts
│       ├── models/
│       │   └── normalized-provider-place.ts
│       └── places-provider.factory.ts
│
└── ...
```

The Places module owns its domain logic and entities. Infrastructure
owns reusable external integrations and technical adapters. Other
modules should depend on the Places service/API contract rather than
importing provider adapters.

------------------------------------------------------------------------

## 17. Implementation Roadmap

### Phase 1 --- Foundation

-   [ ] Enable PostGIS in PostgreSQL.
-   [ ] Create the `places` entity.
-   [ ] Create the `place_sources` entity.
-   [ ] Create the `place_categories` entity.
-   [ ] Create category relations if multi-category support is needed.
-   [ ] Add spatial and relational indexes.
-   [ ] Define the canonical Place interface.
-   [ ] Define the provider interface.

### Phase 2 --- First provider integration

-   [ ] Implement one provider adapter.
-   [ ] Normalize provider responses.
-   [ ] Validate normalized data.
-   [ ] Map provider categories to internal categories.
-   [ ] Implement provider error handling.
-   [ ] Document provider storage and attribution restrictions.

### Phase 3 --- Search pipeline

-   [ ] Implement Redis place cache.
-   [ ] Implement Redis search cache.
-   [ ] Implement cache-key normalization.
-   [ ] Implement PostGIS nearby search.
-   [ ] Implement local result sufficiency rules.
-   [ ] Implement provider fallback.
-   [ ] Implement canonical matching and deduplication.
-   [ ] Implement transactional persistence.
-   [ ] Return standardized API responses.

### Phase 4 --- Reliability and optimization

-   [ ] Implement request coalescing.
-   [ ] Implement bounded retries and timeouts.
-   [ ] Implement cache invalidation.
-   [ ] Implement stale-while-revalidate.
-   [ ] Add structured logs and metrics.
-   [ ] Test Redis outage behavior.
-   [ ] Test provider outage behavior.
-   [ ] Test concurrent requests and duplicate provider results.

### Phase 5 --- Dataset expansion

-   [ ] Add geographic coverage tracking.
-   [ ] Add background synchronization jobs.
-   [ ] Add scheduled refresh policies.
-   [ ] Add additional provider adapters.
-   [ ] Add data quality review tooling.
-   [ ] Add optional place photos with compliant storage.
-   [ ] Track provider usage and local dataset coverage.

### Phase 6 --- Feature integration

-   [ ] Integrate tourist spot recommendations.
-   [ ] Integrate itinerary location search.
-   [ ] Integrate SOS Nearby Help.
-   [ ] Integrate Tara AI travel suggestions.

------------------------------------------------------------------------

## 18. Testing Requirements

At minimum, test the following scenarios.

  -----------------------------------------------------------------------
  Scenario                            Expected behavior
  ----------------------------------- -----------------------------------
  Redis search cache hit              Return cached results without
                                      provider call

  Redis miss, PostgreSQL sufficient   Return local results and populate
                                      Redis

  Redis miss, PostgreSQL empty        Query provider, persist permitted
                                      data, cache result

  PostgreSQL has partial results      Merge local and provider results
                                      without duplicates

  Provider returns an existing place  Reuse canonical place and
                                      attach/update source mapping

  Provider returns a new place        Create canonical place and source
                                      mapping

  Same provider result arrives        Do not create duplicate source
  concurrently                        mappings

  Redis is unavailable                Continue using PostgreSQL and
                                      provider fallback

  Provider is unavailable, local      Return local results with
  results exist                       incomplete/stale metadata where
                                      appropriate

  Provider is unavailable, no local   Return a controlled error
  results exist                       

  Place becomes closed                Update status when supported and
                                      invalidate affected caches

  Invalid coordinates                 Return validation error

  Similar names at different          Do not incorrectly merge
  locations                           

  Provider data is not retainable     Do not persist restricted fields
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 19. Decisions for the Initial MVP

To avoid overengineering, the first implementation should include only
what is needed to establish the correct foundations.

  -----------------------------------------------------------------------
  Area                                MVP decision
  ----------------------------------- -----------------------------------
  Database                            PostgreSQL + PostGIS

  Cache                               Existing Redis

  Providers                           One provider initially, behind an
                                      interface

  Canonical place ID                  UUID generated by TaraHive

  Geographic search                   PostGIS radius search

  Search cache                        Redis with TTL

  Place cache                         Redis with TTL

  Deduplication                       Provider ID first, then
                                      conservative geographic/name
                                      matching

  Persistence                         Transactional upsert

  Freshness                           `lastVerifiedAt` and source
                                      `fetchedAt`

  Background jobs                     Add when refresh/enrichment is
                                      needed

  Coverage tracking                   Later phase

  Recommendation scoring              Separate Recommendation module

  AI                                  Not required for core Places
                                      retrieval
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 20. Final Architectural Recommendation

The Places module should be treated as a reusable geographic data
service, not merely an endpoint that calls a third-party API.

Its responsibility is to provide TaraHive with a consistent, canonical,
and increasingly useful places dataset.

The intended long-term flow is:

``` text
User Request
    |
    v
Redis
    |
    | Miss
    v
PostgreSQL + PostGIS
    |
    | Insufficient or stale
    v
External Provider(s)
    |
    v
Normalize
    |
    v
Validate
    |
    v
Deduplicate
    |
    v
Persist permitted data
    |
    v
Update cache
    |
    v
Return canonical TaraHive places
```

The most important architectural choices are:

1.  Keep canonical places separate from provider source records.
2.  Use PostGIS from the beginning.
3.  Cache search results and individual place details separately.
4.  Make provider integrations replaceable.
5.  Prevent duplicate provider requests and duplicate place records.
6.  Track freshness and geographic coverage.
7.  Respect provider licensing and retention rules.
8.  Keep recommendation logic separate from place retrieval.

With these foundations, TaraHive can start with a small dataset and one
external provider, then expand to multiple providers, regional imports,
background synchronization, and its own curated places dataset without
fundamentally changing the frontend or the consuming modules.
