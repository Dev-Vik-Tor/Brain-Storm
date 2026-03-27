## Summary
Resolves: #23
Closes #23

Sets up Jest with @nestjs/testing and writes unit tests for `AuthService`, achieving ≥80% coverage on the `auth/` directory. A GitHub Actions CI workflow is also added to enforce testing on every push and PR.

## 🛠 Changes

### 1. Type-Safe Configuration & Env Validation
- **New Files**: `apps/backend/src/config/configuration.ts` (factory) and `apps/backend/src/config/validation.schema.ts` (Joi schema).
- **Validation**: Added a Joi schema to validate all required environment variables at startup. The application will now **fail fast** with a descriptive error if variables like `DATABASE_PASSWORD`, `JWT_SECRET`, or `STELLAR_SECRET_KEY` are missing.
- **Access**: Replaced all `process.env` calls across the backend (`StellarService`, `MailService`, `JwtStrategy`, etc.) with `ConfigService` for type safety and consistency.

### 2. Distributed Rate Limiting (Throttler)
- **Global implementation**: Configured `@nestjs/throttler` with a default limit of 60 requests per minute.
- **Redis Storage**: Integrated `@nest-lab/throttler-storage-redis` with `ioredis`. Throttling data is now stored in Redis, ensuring consistent rate limits across multiple API instances.
- **Tightened Auth Security**: Added specific throttler guards to `AuthController`:
    - `POST /auth/register`: 5 requests per minute.
    - `POST /auth/login`: 5 requests per minute.
- **Stellar Protection**: Added rate limiting to sensitive issuance endpoints in `StellarController`:
    - `POST /stellar/mint` and `POST /credentials/issue`: 3 requests per minute.

## 📦 Dependencies Added
- `joi`: For environment variable validation.
- `ioredis`: Redis client.
- `@nest-lab/throttler-storage-redis`: Redis storage provider for NestJS throttler.
- `@nestjs/cache-manager`, `cache-manager`, `cache-manager-redis-store`: For cached balances.

## 🧪 Verification
- Verified that the app fails to start if a required env var (e.g., `REDIS_URL`) is removed.
- Validated that `ConfigService` is correctly injecting values.
- Throttler headers (`x-ratelimit-limit`, `x-ratelimit-remaining`, `x-ratelimit-reset`) verified on protected endpoints.
