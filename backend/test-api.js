const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testAPI() {
  console.log('🧪 Testing Social Commerce AI Platform API...\n');

  try {
    // Test health endpoint
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health:', healthResponse.data);
    console.log('');

    // Test user registration
    console.log('2️⃣ Testing User Registration...');
    const registerData = {
      username: 'testuser_' + Date.now(),
      email: `test${Date.now()}@example.com`,
      password: 'testpassword123',
      displayName: 'Test User'
    };
    
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, registerData);
    console.log('✅ Registration successful!');
    console.log('User ID:', registerResponse.data.user.id);
    console.log('Token received:', registerResponse.data.token.substring(0, 20) + '...');
    
    const token = registerResponse.data.token;
    const userId = registerResponse.data.user.id;
    console.log('');

    // Test authenticated endpoint
    console.log('3️⃣ Testing Authenticated Endpoint...');
    const meResponse = await axios.get(`${BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Current user data retrieved:');
    console.log('Username:', meResponse.data.user.username);
    console.log('Email:', meResponse.data.user.email);
    console.log('');

    // Test creating a post
    console.log('4️⃣ Testing Post Creation...');
    const postData = {
      content: 'Hello from the Social Commerce AI Platform! 🚀 #test #socialcommerce',
      hashtags: ['test', 'socialcommerce'],
      type: 'text'
    };
    
    const postResponse = await axios.post(`${BASE_URL}/posts`, postData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Post created successfully!');
    console.log('Post ID:', postResponse.data.post._id);
    console.log('Content:', postResponse.data.post.content);
    console.log('');

    // Test getting trending posts (public endpoint)
    console.log('5️⃣ Testing Public Endpoints...');
    const trendingResponse = await axios.get(`${BASE_URL}/posts/trending`);
    console.log('✅ Trending posts retrieved:');
    console.log('Posts count:', trendingResponse.data.posts.length);
    console.log('');

    // Test product trending (public endpoint)
    console.log('6️⃣ Testing Product Endpoints...');
    const trendingProductsResponse = await axios.get(`${BASE_URL}/products/trending`);
    console.log('✅ Trending products retrieved:');
    console.log('Products count:', trendingProductsResponse.data.products.length);
    console.log('');

    console.log('🎉 All API tests passed! The backend is working correctly.');

  } catch (error) {
    console.error('❌ API Test Failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run the test
testAPI();