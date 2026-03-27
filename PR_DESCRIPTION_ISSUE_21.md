# Backend: Logging — integrate structured logging with Winston

## Description

This PR implements structured logging with Winston to replace console.log statements and NestJS default logger, providing production-ready logging capabilities for the Brain-Storm backend API.

## Changes Made

### 🆕 New Dependencies
- **`winston`** (^3.19.0): Core Winston logging library
- **`nest-winston`** (^1.10.2): NestJS integration for Winston
- **Additional dependencies**: `@nestjs/cache-manager`, `cache-manager-redis-store`, `@nestjs/event-emitter` (for fixing existing build issues)

### 📁 New Files Created
- **`apps/backend/src/common/logger/logger.module.ts`**: Winston configuration module with environment-based setup
- **`apps/backend/src/common/logger/logger.service.ts`**: Custom logger service implementing NestJS LoggerService interface
- **`apps/backend/src/common/logger/index.ts`**: Barrel export for easy imports
- **`apps/backend/src/common/logger/logger.example.ts`**: Usage examples and best practices
- **`apps/backend/src/common/logger/README.md`**: Comprehensive documentation

### 📝 Modified Files
- **`apps/backend/src/app.module.ts`**: 
  - Added LoggerModule import and configuration
  - Fixed duplicate providers issue
- **`apps/backend/src/main.ts`**: 
  - Replaced `console.log` with Winston logger
  - Configured Winston as default NestJS logger
- **`.env.example`**: 
  - Added `LOG_LEVEL=info` environment variable

## Features Implemented

### ✅ All Requirements Met
- [x] **Install nest-winston and winston** - Dependencies added to package.json
- [x] **Configure Winston with JSON format in production, colorize in development** - Environment-based format configuration
- [x] **Add log levels: error, warn, info, debug** - All levels implemented plus verbose
- [x] **Replace all console.log calls with the injected logger** - Replaced the single console.log in main.ts
- [x] **Add LOG_LEVEL env var (default: info)** - Added to .env.example with info default
- [x] **Ship logs to stdout so container orchestrators can collect them** - Console transport configured

### 🚀 Additional Features
- **Context Support**: Child loggers with context prefixes for better traceability
- **Error Handling**: Proper error stack trace logging
- **TypeScript Support**: Full type safety with NestJS LoggerService interface
- **Comprehensive Documentation**: Usage examples and migration guide

## Configuration

### Environment Variables
```bash
LOG_LEVEL=info  # Options: error, warn, info, debug, verbose (default: info)
NODE_ENV=production  # Affects log format (JSON vs colorized)
```

### Log Formats

**Development:**
```
2024-01-15T10:30:45.123Z info: [Bootstrap] Brain-Storm API running on port 3000
```

**Production:**
```json
{"timestamp":"2024-01-15T10:30:45.123Z","level":"info","message":"Brain-Storm API running on port 3000","context":"Bootstrap"}
```

## Usage Examples

### Basic Usage
```typescript
import { Injectable } from '@nestjs/common';
import { CustomLoggerService } from '../common/logger';

@Injectable()
export class MyService {
  private readonly logger = new CustomLoggerService();

  constructor() {
    this.logger.setContext('MyService');
  }

  async someMethod() {
    this.logger.info('Operation started');
    this.logger.debug('Debug information');
    this.logger.error('Error occurred', error.stack);
  }
}
```

### Child Loggers
```typescript
const childLogger = this.logger.child('SpecificContext');
childLogger.info('Message with specific context');
```

## Container Orchestration Ready

Logs are sent to stdout making them compatible with:
- Docker containers
- Kubernetes
- Docker Compose  
- Cloud logging services (AWS CloudWatch, Google Cloud Logging, etc.)

## Testing

The implementation has been tested with:
- ✅ Environment-based configuration (development vs production)
- ✅ All log levels (error, warn, info, debug, verbose)
- ✅ Context and child logger functionality
- ✅ JSON formatting in production mode
- ✅ Colorized formatting in development mode
- ✅ Integration with NestJS application lifecycle

## Migration Guide

For future development, replace console statements with logger methods:

```typescript
// Before
console.log('User logged in');
console.error('Database connection failed', error);

// After  
this.logger.info('User logged in');
this.logger.error('Database connection failed', error.stack);
```

## Impact

This implementation provides:
- **Production-ready logging** with structured JSON output
- **Better debugging** with context and log levels
- **Container compatibility** for modern deployment strategies
- **Consistent logging** across the entire application
- **Performance monitoring** capabilities through structured logs

## Notes

- The existing codebase had some pre-existing TypeScript compilation errors that are unrelated to this logging implementation
- Only one `console.log` statement was found and replaced (in `main.ts`)
- Additional dependencies were installed to resolve some existing build issues
- The logger is configured as a global module and can be used throughout the application

Closes #21