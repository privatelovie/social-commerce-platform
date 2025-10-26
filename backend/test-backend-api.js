const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';
let authToken = null;
let testUserId = null;

// Test data
const testUser = {
  username: 'testuser_' + Date.now(),
  email: `testuser_${Date.now()}@example.com`,
  password: 'testpassword123',
  displayName: 'Test User'
};

// Helper function to make authenticated requests
const makeAuthenticatedRequest = (method, url, data = null) => {
  const config = {
    method,
    url: `${API_BASE_URL}${url}`,
    headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
  };
  
  if (data) {
    config.data = data;
  }
  
  return axios(config);
};

// Test functions
const testHealthEndpoint = async () => {
  console.log('🔍 Testing health endpoint...');
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health check passed:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
};

const testUserRegistration = async () => {
  console.log('🔍 Testing user registration...');
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, testUser);
    authToken = response.data.token;
    testUserId = response.data.user.id;
    console.log('✅ User registration successful:', {
      username: response.data.user.username,
      email: response.data.user.email,
      token: authToken ? 'Token received' : 'No token'
    });
    return true;
  } catch (error) {
    console.error('❌ User registration failed:', error.response?.data || error.message);
    return false;
  }
};

const testUserLogin = async () => {
  console.log('🔍 Testing user login...');
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    authToken = response.data.token;
    console.log('✅ User login successful:', {
      username: response.data.user.username,
      token: authToken ? 'Token received' : 'No token'
    });
    return true;
  } catch (error) {
    console.error('❌ User login failed:', error.response?.data || error.message);
    return false;
  }
};

const testGetCurrentUser = async () => {
  console.log('🔍 Testing get current user...');
  try {
    const response = await makeAuthenticatedRequest('GET', '/auth/me');
    console.log('✅ Get current user successful:', {
      username: response.data.user.username,
      email: response.data.user.email
    });
    return true;
  } catch (error) {
    console.error('❌ Get current user failed:', error.response?.data || error.message);
    return false;
  }
};

const testCartEndpoints = async () => {
  console.log('🔍 Testing cart endpoints...');
  try {
    // Get empty cart
    const cartResponse = await makeAuthenticatedRequest('GET', '/cart');
    console.log('✅ Get cart successful:', {
      totalItems: cartResponse.data.cart.totalItems,
      total: cartResponse.data.cart.total
    });
    
    // Note: Adding items to cart would require actual product IDs
    // This would be implemented once we have product data
    console.log('ℹ️  Cart item operations require product data (skipped)');
    return true;
  } catch (error) {
    console.error('❌ Cart endpoints test failed:', error.response?.data || error.message);
    return false;
  }
};

const testMessagingEndpoints = async () => {
  console.log('🔍 Testing messaging endpoints...');
  try {
    // Get conversations (should be empty for new user)
    const conversationsResponse = await makeAuthenticatedRequest('GET', '/messages/conversations');
    console.log('✅ Get conversations successful:', {
      conversationsCount: conversationsResponse.data.conversations.length
    });
    
    console.log('ℹ️  Message operations require multiple users (skipped)');
    return true;
  } catch (error) {
    console.error('❌ Messaging endpoints test failed:', error.response?.data || error.message);
    return false;
  }
};

// Main test runner
const runTests = async () => {
  console.log('🚀 Starting Backend API Tests...\n');
  
  const tests = [
    { name: 'Health Check', fn: testHealthEndpoint },
    { name: 'User Registration', fn: testUserRegistration },
    { name: 'User Login', fn: testUserLogin },
    { name: 'Get Current User', fn: testGetCurrentUser },
    { name: 'Cart Endpoints', fn: testCartEndpoints },
    { name: 'Messaging Endpoints', fn: testMessagingEndpoints }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    console.log(`\n📋 Running: ${test.name}`);
    console.log('─'.repeat(50));
    
    try {
      const result = await test.fn();
      if (result) {
        passed++;
        console.log(`✅ ${test.name} - PASSED`);
      } else {
        failed++;
        console.log(`❌ ${test.name} - FAILED`);
      }
    } catch (error) {
      failed++;
      console.log(`❌ ${test.name} - FAILED:`, error.message);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST RESULTS');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Backend API is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the server and try again.');
  }
  
  process.exit(failed === 0 ? 0 : 1);
};

// Handle process interruption
process.on('SIGINT', () => {
  console.log('\n🛑 Tests interrupted by user');
  process.exit(1);
});

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the tests
console.log('⏳ Please ensure the backend server is running on http://localhost:5000');
console.log('🔄 Starting tests in 2 seconds...\n');

setTimeout(runTests, 2000);