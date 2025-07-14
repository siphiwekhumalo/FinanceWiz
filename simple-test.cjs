// Simple test runner to verify our setup
const { execSync } = require('child_process');

console.log('🧪 Financial Chart Dashboard - Testing Suite Setup');
console.log('==================================================');

// Test 1: TypeScript compilation
console.log('\n1. Testing TypeScript compilation...');
try {
  execSync('npx tsc --noEmit', { stdio: 'inherit' });
  console.log('✅ TypeScript compilation successful');
} catch (error) {
  console.log('❌ TypeScript compilation failed');
  process.exit(1);
}

// Test 2: ESLint
console.log('\n2. Testing ESLint...');
try {
  execSync('npx eslint client/src/main.tsx --quiet', { stdio: 'inherit' });
  console.log('✅ ESLint successful');
} catch (error) {
  console.log('❌ ESLint failed');
  process.exit(1);
}

// Test 3: SonarQube Scanner availability
console.log('\n3. Testing SonarQube scanner...');
try {
  execSync('npx sonar-scanner --version', { stdio: 'inherit' });
  console.log('✅ SonarQube scanner available');
} catch (error) {
  console.log('❌ SonarQube scanner not available');
}

console.log('\n🎉 Testing suite setup completed successfully!');
console.log('📋 Next steps:');
console.log('   - Run: node simple-test.js');
console.log('   - Start SonarQube server: docker run -d -p 9000:9000 sonarqube');
console.log('   - Run full analysis: ./run-tests.sh');