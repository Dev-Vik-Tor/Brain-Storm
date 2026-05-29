# Test Data Management

## Overview

Brain-Storm provides factories and utilities for generating and managing test data consistently across the test suite.

## Test Data Factories

### UserFactory

Generate test users with realistic data:

```typescript
import { UserFactory } from '@/test/factories';

// Create single user
const user = UserFactory.create();

// Create with overrides
const admin = UserFactory.create({ role: 'admin' });

// Create multiple users
const users = UserFactory.createMany(10);
```

### CourseFactory

Generate test courses:

```typescript
import { CourseFactory } from '@/test/factories';

const course = CourseFactory.create({
  title: 'Advanced Blockchain',
  instructorId: 'user-123',
});

const courses = CourseFactory.createMany(5);
```

### EnrollmentFactory

Generate test enrollments:

```typescript
import { EnrollmentFactory } from '@/test/factories';

const enrollment = EnrollmentFactory.create({
  userId: 'user-1',
  courseId: 'course-1',
  progress: 75,
});
```

### QuizFactory

Generate test quizzes:

```typescript
import { QuizFactory } from '@/test/factories';

const quiz = QuizFactory.create({
  courseId: 'course-1',
  questions: 10,
});
```

## Test Data Manager

Manage database state during tests:

```typescript
import { TestDataManager } from '@/test/test-data.manager';

describe('Course Service', () => {
  let dataManager: TestDataManager;

  beforeAll(async () => {
    dataManager = new TestDataManager(dataSource);
    await dataManager.seedDatabase();
  });

  afterEach(async () => {
    await dataManager.cleanDatabase();
  });

  it('should fetch courses', async () => {
    // Test with seeded data
  });
});
```

## Seeding Test Data

### Manual Seeding

```bash
npm run seed:test
```

### CI/CD Integration

Test data is automatically seeded in CI pipelines before running integration tests.

## Data Cleanup

Always clean up test data after tests:

```typescript
afterEach(async () => {
  await dataManager.cleanDatabase();
});
```

## Versioning

Test data versions are tracked in `.test-data-version`:

```
1.0.0 - Initial test data schema
1.1.0 - Added quiz data
1.2.0 - Added enrollment progress tracking
```

Update version when modifying test data structure.

## Best Practices

1. **Use factories** - Always use factories instead of hardcoding test data
2. **Clean up** - Clean database after each test
3. **Isolate tests** - Each test should be independent
4. **Use overrides** - Customize factory data with overrides
5. **Document** - Document custom test data requirements
