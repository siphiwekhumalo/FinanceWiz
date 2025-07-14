#!/bin/bash

# Financial Chart Dashboard - Test Runner Script
# This script runs the complete testing suite including Jest, ESLint, and SonarQube analysis

echo "🧪 Starting Financial Chart Dashboard Test Suite"
echo "================================================="

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

# Run TypeScript compilation check
echo "🔧 Running TypeScript compilation check..."
npx tsc --noEmit
if [ $? -ne 0 ]; then
    echo "❌ TypeScript compilation failed"
    exit 1
fi
echo "✅ TypeScript compilation passed"

# Run ESLint
echo "🔍 Running ESLint..."
npx eslint . --ext .ts,.tsx --report-unused-disable-directives --max-warnings 0
if [ $? -ne 0 ]; then
    echo "❌ ESLint failed"
    exit 1
fi
echo "✅ ESLint passed"

# Run Jest tests with coverage
echo "🧪 Running Jest tests with coverage..."
npx jest --coverage --ci --watchAll=false
if [ $? -ne 0 ]; then
    echo "❌ Jest tests failed"
    exit 1
fi
echo "✅ Jest tests passed"

# Run SonarQube analysis
echo "🔍 Running SonarQube analysis..."
if check_sonar_server; then
    npx sonar-scanner \
        -Dsonar.projectKey=financial-chart-dashboard \
        -Dsonar.sources=client/src,server,shared \
        -Dsonar.host.url=http://localhost:9000 \
        -Dsonar.login=admin \
        -Dsonar.password=admin
    
    if [ $? -ne 0 ]; then
        echo "❌ SonarQube analysis failed"
        exit 1
    fi
    echo "✅ SonarQube analysis completed"
else
    echo "⚠️  Skipping SonarQube analysis (server not available)"
fi

echo ""
echo "🎉 All tests completed successfully!"
echo "📊 Coverage report available at: coverage/lcov-report/index.html"
echo "🔍 SonarQube results available at: http://localhost:9000/dashboard?id=financial-chart-dashboard"
echo "================================================="