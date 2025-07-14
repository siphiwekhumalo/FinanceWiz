# Testing Documentation

## Overview

This document outlines the comprehensive testing strategy for the Financial Chart Dashboard project, including unit tests, integration tests, code quality analysis, and SonarQube integration.

## Testing Stack

### Core Testing Tools
- **Jest**: JavaScript testing framework with coverage reporting
- **@testing-library/react**: React component testing utilities
- **@testing-library/jest-dom**: Custom Jest matchers for DOM elements
- **@testing-library/user-event**: User interaction simulation
- **TypeScript**: Static type checking
- **ESLint**: Code quality and style enforcement

### Code Quality & Analysis
- **SonarQube**: Static code analysis, bug detection, and code quality metrics
- **Coverage Reports**: Line, branch, and function coverage tracking
- **TypeScript Compiler**: Type checking and compilation validation

## Test Structure

### Frontend Tests (`client/src/`)
```
__tests__/
├── components/
│   └── chart/
│       └── chart-container.test.tsx
├── services/
│   └── chart-service.test.ts
├── store/
│   └── chart-store.test.ts
└── setupTests.ts
```

### Backend Tests (`server/`)
```
__tests__/
├── storage.test.ts
├── routes.test.ts (to be created)
└── index.test.ts (to be created)
```

## Running Tests

### Quick Test Commands
```bash
# Run all tests
npx jest

# Run tests with coverage
npx jest --coverage

# Run tests in watch mode
npx jest --watch

# Run specific test file
npx jest chart-container.test.tsx

# Run tests with continuous integration settings
npx jest --ci --coverage --watchAll=false
```

### Complete Test Suite
```bash
# Run comprehensive test suite (includes linting, testing, and SonarQube)
./run-tests.sh
```

### Manual Test Commands
```bash
# TypeScript compilation check
npx tsc --noEmit

# ESLint code quality check
npx eslint . --ext .ts,.tsx --report-unused-disable-directives --max-warnings 0

# ESLint with auto-fix
npx eslint . --ext .ts,.tsx --fix

# SonarQube analysis (requires SonarQube server)
npx sonar-scanner
```

## Test Coverage

### Coverage Targets
- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 85%
- **Lines**: > 80%

### Coverage Reports
- **HTML Report**: `coverage/lcov-report/index.html`
- **LCOV Report**: `coverage/lcov.info`
- **JSON Report**: `coverage/coverage-final.json`

## SonarQube Integration

### Local SonarQube Server
```bash
# Start SonarQube with Docker
docker run -d --name sonarqube -p 9000:9000 sonarqube:latest

# Access SonarQube dashboard
http://localhost:9000

# Default credentials
Username: admin
Password: admin
```

### SonarQube Configuration
- **Project Key**: financial-chart-dashboard
- **Project Name**: Financial Chart Dashboard
- **Quality Gate**: Default (customizable)

### Code Quality Metrics
- **Bugs**: Critical issues that need immediate attention
- **Vulnerabilities**: Security-related code issues
- **Code Smells**: Maintainability issues
- **Coverage**: Test coverage percentage
- **Duplicated Lines**: Code duplication detection

## Test Categories

### Unit Tests
- **Components**: Individual React component testing
- **Services**: Business logic and API service testing
- **Stores**: State management testing
- **Utilities**: Helper function testing

### Integration Tests
- **API Routes**: Backend endpoint testing
- **Database**: Storage layer testing
- **WebSocket**: Real-time communication testing

### End-to-End Tests (Future)
- **User Workflows**: Complete user journey testing
- **Cross-browser**: Browser compatibility testing
- **Performance**: Load and stress testing

## Mocking Strategy

### Frontend Mocks
- **Canvas API**: Chart rendering mocks
- **WebSocket**: Real-time data mocks
- **ResizeObserver**: Component resizing mocks
- **matchMedia**: Media query mocks

### Backend Mocks
- **Database**: In-memory storage mocks
- **External APIs**: Third-party service mocks
- **File System**: Asset and file mocks

## Continuous Integration

### CI/CD Pipeline (Future)
```yaml
# Example GitHub Actions workflow
name: CI/CD Pipeline
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:ci
      - run: npm run lint
      - run: npm run build
```

### Quality Gates
- All tests must pass
- Coverage must meet minimum thresholds
- No ESLint errors
- SonarQube quality gate must pass

## Test Data Strategy

### Dummy Data
- **Chart Data**: Realistic OHLCV data generation
- **Symbol Data**: Mock financial symbols
- **User Data**: Test user accounts and preferences
- **Market Data**: Simulated market conditions

### Test Fixtures
- **Consistent Data**: Predictable test data sets
- **Edge Cases**: Boundary condition testing
- **Error Scenarios**: Failure condition testing

## Best Practices

### Test Writing
- **AAA Pattern**: Arrange, Act, Assert
- **Clear Naming**: Descriptive test names
- **Single Responsibility**: One assertion per test
- **Mock External Dependencies**: Isolate units under test

### Code Quality
- **Type Safety**: Comprehensive TypeScript usage
- **Error Handling**: Proper error boundary testing
- **Performance**: Memory leak and performance testing
- **Accessibility**: A11y compliance testing

## Troubleshooting

### Common Issues
- **Canvas Context**: Ensure proper mocking for chart tests
- **Async Operations**: Use proper async/await patterns
- **State Management**: Reset store state between tests
- **DOM Cleanup**: Proper component unmounting

### Debug Commands
```bash
# Run tests with verbose output
npx jest --verbose

# Run tests with debugging
npx jest --detectOpenHandles

# Run specific test with debugging
npx jest --testNamePattern="should render" --verbose
```

## Reporting

### Test Results
- **Console Output**: Real-time test results
- **HTML Coverage**: Visual coverage reports
- **SonarQube Dashboard**: Comprehensive quality metrics
- **CI/CD Reports**: Automated pipeline results

### Metrics Tracking
- **Test Count**: Number of tests written
- **Coverage Trends**: Coverage over time
- **Quality Trends**: Code quality improvements
- **Bug Detection**: Issues found and resolved