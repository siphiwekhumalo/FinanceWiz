#!/bin/bash

# Financial Chart Dashboard - Complete Test Suite Runner
# This script runs the complete testing suite including Jest, ESLint, Stryker, and SonarQube analysis

echo "🧪 Starting Financial Chart Dashboard Complete Test Suite"
echo "=========================================================="

# Check if SonarQube server is running (optional)
check_sonar_server() {
    echo "🔍 Checking SonarQube server availability..."
    if curl -s http://localhost:9000/api/system/status > /dev/null 2>&1; then
        echo "✅ SonarQube server is running"
        return 0
    else
        echo "⚠️  SonarQube server not detected. You can start it with: docker run -d --name sonarqube -p 9000:9000 sonarqube:latest"
        return 1
    fi
}

# Create reports directory
mkdir -p reports stryker-reports coverage

# Run TypeScript compilation check
echo "🔧 Running TypeScript compilation check..."
npx tsc --noEmit
if [ $? -ne 0 ]; then
    echo "❌ TypeScript compilation failed"
    exit 1
fi
echo "✅ TypeScript compilation passed"

# Run ESLint with detailed output
echo "🔍 Running ESLint code quality analysis..."
npx eslint . --ext .ts,.tsx --report-unused-disable-directives --max-warnings 0 --output-file reports/eslint-report.json --format json
ESLINT_EXIT_CODE=$?

if [ $ESLINT_EXIT_CODE -ne 0 ]; then
    echo "❌ ESLint found issues"
    npx eslint . --ext .ts,.tsx --report-unused-disable-directives --max-warnings 0
    exit 1
fi
echo "✅ ESLint passed"

# Run Jest tests with coverage
echo "🧪 Running Jest unit tests with coverage..."
npx jest --config jest.config.mjs --coverage --ci --watchAll=false --verbose --testResultsProcessor=jest-sonar-reporter
if [ $? -ne 0 ]; then
    echo "❌ Jest tests failed"
    exit 1
fi
echo "✅ Jest tests passed"

# Run Stryker mutation tests
echo "🔬 Running Stryker mutation tests..."
npx stryker run --logLevel info
STRYKER_EXIT_CODE=$?

if [ $STRYKER_EXIT_CODE -ne 0 ]; then
    echo "⚠️  Stryker mutation tests completed with issues (continuing)"
else
    echo "✅ Stryker mutation tests passed"
fi

# Generate test summary report
echo "📊 Generating test summary report..."
cat > reports/test-summary.md << EOF
# Test Summary Report

## Test Results
- **TypeScript Compilation**: ✅ Passed
- **ESLint Code Quality**: ✅ Passed
- **Jest Unit Tests**: ✅ Passed
- **Stryker Mutation Tests**: $([ $STRYKER_EXIT_CODE -eq 0 ] && echo "✅ Passed" || echo "⚠️ Issues found")

## Coverage Reports
- **Unit Test Coverage**: coverage/lcov-report/index.html
- **Mutation Test Report**: stryker-reports/mutation-report.html
- **ESLint Report**: reports/eslint-report.json

## Generated: $(date)
EOF

# Run SonarQube analysis
echo "🔍 Running SonarQube static code analysis..."
if check_sonar_server; then
    npx sonar-scanner \
        -Dsonar.projectKey=financial-chart-dashboard \
        -Dsonar.projectName="Financial Chart Dashboard" \
        -Dsonar.sources=client/src,server,shared \
        -Dsonar.tests=client/src,server \
        -Dsonar.host.url=http://localhost:9000 \
        -Dsonar.login=admin \
        -Dsonar.password=admin \
        -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
        -Dsonar.testExecutionReportPaths=reports/test-report.xml \
        -Dsonar.coverage.exclusions=**/*.test.ts,**/*.test.tsx,**/*.spec.ts,**/*.spec.tsx,**/setupTests.ts \
        -Dsonar.cpd.exclusions=**/*.test.ts,**/*.test.tsx,**/*.spec.ts,**/*.spec.tsx \
        -Dsonar.exclusions=**/node_modules/**,**/dist/**,**/build/**,**/*.test.ts,**/*.test.tsx,**/*.spec.ts,**/*.spec.tsx,**/setupTests.ts,**/stryker-tmp/**
    
    if [ $? -ne 0 ]; then
        echo "❌ SonarQube analysis failed"
        exit 1
    fi
    echo "✅ SonarQube analysis completed"
else
    echo "⚠️  Skipping SonarQube analysis (server not available)"
fi

echo ""
echo "🎉 Complete test suite finished successfully!"
echo "=========================================================="
echo "📊 **Test Reports Available:**"
echo "   • Unit Test Coverage: coverage/lcov-report/index.html"
echo "   • Mutation Test Report: stryker-reports/mutation-report.html"
echo "   • ESLint Report: reports/eslint-report.json"
echo "   • Test Summary: reports/test-summary.md"
echo ""
echo "🔍 **SonarQube Dashboard:**"
echo "   • http://localhost:9000/dashboard?id=financial-chart-dashboard"
echo ""
echo "🚀 **Next Steps:**"
echo "   • Review coverage reports for areas needing more tests"
echo "   • Check mutation test results for test quality"
echo "   • Monitor SonarQube dashboard for code quality metrics"
echo "   • Run 'npm run test:watch' for continuous testing during development"
echo "=========================================================="