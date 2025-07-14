# Testing Documentation

## Overview

This document outlines the comprehensive testing strategy for the Financial Chart Dashboard project, including unit tests, integration tests, mutation testing, and static code analysis.

## Testing Stack

### Core Testing Framework
- **Jest**: JavaScript testing framework with TypeScript support
- **@testing-library/react**: Simple and complete testing utilities for React components
- **@testing-library/user-event**: User interaction simulation
- **@testing-library/jest-dom**: Custom Jest matchers for DOM testing

### Code Quality & Analysis
- **ESLint**: Static code analysis for JavaScript/TypeScript
- **TypeScript Compiler**: Type checking and compilation validation
- **SonarQube**: Comprehensive code quality analysis
- **Stryker Mutator**: Mutation testing for test quality validation

### Test Types
- **Unit Tests**: Individual function and component testing
- **Integration Tests**: API routes and service layer testing
- **Mutation Tests**: Test quality and effectiveness validation
- **Static Analysis**: Code quality and security scanning

## Test Structure

### Frontend Tests
```
client/src/
├── components/
│   ├── chart/__tests__/
│   │   └── chart-container.test.tsx
│   └── ui/__tests__/
│       └── button.test.tsx
├── hooks/__tests__/
│   └── use-websocket.test.ts
├── services/__tests__/
│   └── chart-service.test.ts
├── store/__tests__/
│   └── chart-store.test.ts
├── utils/__tests__/
│   └── chart-utils.test.ts
└── setupTests.ts
```

### Backend Tests
```
server/
├── __tests__/
│   ├── routes.test.ts
│   └── storage.test.ts
└── index.ts
```

## Configuration Files

### Jest Configuration (`jest.config.mjs`)
```javascript
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/client/src/setupTests.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/client/src/$1',
    '^@assets/(.*)$': '<rootDir>/attached_assets/$1',
    '^@shared/(.*)$': '<rootDir>/shared/$1',
  },
  // ... additional configuration
};
```

### ESLint Configuration (`.eslintrc.mjs`)
- TypeScript-specific rules
- React and JSX accessibility rules
- Import/export validation
- Code style consistency

### Stryker Configuration (`stryker.config.mjs`)
- Mutation testing setup
- Test quality validation
- Coverage analysis
- HTML reporting

### SonarQube Configuration (`sonar-project.properties`)
- Project metadata
- Source code paths
- Coverage report paths
- Quality gate settings

## Available NPM Scripts

### Basic Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for CI/CD
npm run test:ci
```

### Advanced Testing
```bash
# Run mutation tests
npm run test:mutate

# Run complete test suite
npm run test:all

# Run code quality checks
npm run quality

# Run SonarQube analysis
npm run sonar
```

### Code Quality
```bash
# Run ESLint
npm run lint

# Fix ESLint issues
npm run lint:fix

# TypeScript compilation check
npm run check
```

## Test Categories

### Unit Tests

#### Component Tests
- **Chart Components**: Canvas rendering, user interactions, data visualization
- **UI Components**: Button behaviors, form validations, responsive design
- **Hook Tests**: Custom hooks for WebSocket connections, chart management

#### Service Tests
- **Chart Service**: Data fetching, transformation, chart configuration
- **WebSocket Service**: Real-time data handling, connection management
- **Dummy Data Service**: Mock data generation for development

#### Utility Tests
- **Chart Utils**: Price formatting, volume calculations, percentage changes
- **Data Validation**: OHLCV data validation, pattern detection
- **Time Handling**: Timeframe conversions, label generation

### Integration Tests

#### API Route Tests
- **Symbol Endpoints**: GET, POST operations for symbol data
- **Chart Data**: Historical data retrieval with various timeframes
- **WebSocket Routes**: Real-time data streaming endpoints
- **Error Handling**: 404, 400, 500 error scenarios

#### Database Tests
- **Storage Operations**: CRUD operations for all entities
- **Data Integrity**: Constraint validation, relationship testing
- **Performance**: Query optimization, bulk operations

### Mutation Testing

#### Test Quality Validation
- **Code Coverage**: Ensuring tests actually validate logic
- **Edge Cases**: Testing boundary conditions and error paths
- **False Positives**: Identifying tests that pass incorrectly
- **Test Effectiveness**: Measuring real test value vs. coverage metrics

## Quality Metrics

### Coverage Targets
- **Statement Coverage**: >80%
- **Branch Coverage**: >75%
- **Function Coverage**: >85%
- **Line Coverage**: >80%

### SonarQube Quality Gates
- **Bugs**: 0 critical/major bugs
- **Vulnerabilities**: 0 security vulnerabilities
- **Code Smells**: <5% technical debt ratio
- **Duplicated Code**: <3% duplication
- **Test Coverage**: >80% coverage

### Mutation Testing Thresholds
- **Mutation Score**: >80% (high quality)
- **Survival Rate**: <20% (low surviving mutants)
- **Timeout Factor**: 1.5x (performance consideration)

## CI/CD Integration

### GitHub Actions Workflow
The CI/CD pipeline includes:
1. **TypeScript Compilation**: Validates type safety
2. **ESLint Analysis**: Code quality and style checks
3. **Jest Unit Tests**: Comprehensive test execution
4. **Stryker Mutation Testing**: Test quality validation
5. **SonarQube Analysis**: Static code analysis
6. **Coverage Reports**: Test coverage tracking
7. **Artifact Generation**: Test reports and build assets

### Quality Gates
- All tests must pass
- Coverage thresholds must be met
- ESLint must pass with 0 warnings
- SonarQube quality gate must pass
- Mutation testing score must be >60%

## Running Tests

### Local Development
```bash
# Install dependencies
npm install

# Run quick test
npm test

# Run with coverage
npm run test:coverage

# Run full test suite
chmod +x run-tests.sh
./run-tests.sh
```

### CI/CD Environment
```bash
# Complete pipeline
npm run test:ci
npm run test:mutate
npm run sonar
```

### SonarQube Setup
```bash
# Start SonarQube server
docker run -d --name sonarqube -p 9000:9000 sonarqube:latest

# Wait for server to start
curl -f http://localhost:9000/api/system/status

# Run analysis
npm run sonar
```

## Test Writing Guidelines

### Component Tests
```typescript
// Use React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';

// Test user interactions
fireEvent.click(screen.getByRole('button'));

// Assert expected behavior
expect(screen.getByText('Expected Text')).toBeInTheDocument();
```

### Service Tests
```typescript
// Mock external dependencies
jest.mock('@/services/websocket-service');

// Test async operations
await expect(service.fetchData()).resolves.toEqual(expectedData);

// Test error scenarios
await expect(service.fetchData()).rejects.toThrow('Expected Error');
```

### Utility Tests
```typescript
// Test pure functions
expect(ChartUtils.formatPrice(123.456)).toBe('123.46');

// Test edge cases
expect(ChartUtils.formatPrice(0)).toBe('0.00');
expect(ChartUtils.formatPrice(-123.456)).toBe('-123.46');
```

## Best Practices

### Test Organization
- Group related tests in describe blocks
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Keep tests focused and independent

### Mocking Strategy
- Mock external dependencies
- Use Jest mocks for third-party libraries
- Mock API calls for consistent testing
- Avoid mocking implementation details

### Coverage Strategy
- Aim for meaningful coverage, not just numbers
- Test edge cases and error conditions
- Use mutation testing to validate test quality
- Focus on critical business logic

### Performance
- Use `beforeEach` for common setup
- Clean up after tests (timers, DOM, etc.)
- Optimize test execution time
- Use test filtering for development

## Troubleshooting

### Common Issues
1. **Tests timeout**: Increase timeout values, check async operations
2. **Coverage gaps**: Add tests for uncovered branches
3. **Mutation survivors**: Improve test assertions
4. **SonarQube connection**: Verify server is running on port 9000

### Debug Tips
```bash
# Run specific test file
npm test -- chart-utils.test.ts

# Run tests with verbose output
npm test -- --verbose

# Debug failing tests
npm test -- --runInBand

# Check test coverage
npm run test:coverage
```

## Reporting

### Test Reports
- **HTML Coverage Report**: `coverage/lcov-report/index.html`
- **Mutation Report**: `stryker-reports/mutation-report.html`
- **ESLint Report**: `reports/eslint-report.json`
- **SonarQube Dashboard**: `http://localhost:9000/dashboard`

### Metrics Dashboard
- Test execution results
- Coverage trends over time
- Code quality metrics
- Mutation testing scores
- Performance benchmarks

## Continuous Improvement

### Regular Activities
1. **Review test coverage** weekly
2. **Analyze mutation testing** results
3. **Update test cases** for new features
4. **Refactor tests** for maintainability
5. **Monitor quality metrics** trends

### Quality Assurance
- Regular code reviews include test quality
- Peer testing of new features
- Documentation updates with code changes
- Performance impact assessment
- Security vulnerability scanning

This comprehensive testing strategy ensures high code quality, reliability, and maintainability of the Financial Chart Dashboard project.