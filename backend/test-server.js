// Simple test script to verify the Express server
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001';

async function testEndpoints() {
  console.log('🧪 Testing FoodCast Backend API...\n');

  try {
    // Test health endpoint
    console.log('1. Testing /health endpoint...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.status);
    console.log('');

    // Test signup endpoint
    console.log('2. Testing /signup endpoint...');
    const signupResponse = await fetch(`${BASE_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword123',
        userType: 'store',
        profileData: {
          name: 'Test Store',
          contact_email: 'test@example.com',
          phone: '555-0123'
        }
      })
    });
    const signupData = await signupResponse.json();
    console.log('✅ Signup response:', signupData.success ? 'Success' : 'Failed');
    console.log('');

    // Test analytics endpoint
    console.log('3. Testing /analytics endpoint...');
    const analyticsResponse = await fetch(`${BASE_URL}/analytics`);
    const analyticsData = await analyticsResponse.json();
    console.log('✅ Analytics response:', analyticsData.success ? 'Success' : 'Failed');
    if (analyticsData.success) {
      console.log('   - Food rescued:', analyticsData.data.foodRescued.totalUnits, 'units');
      console.log('   - CO2 saved:', analyticsData.data.environmentalImpact.co2SavedKg, 'kg');
    }
    console.log('');

    console.log('🎉 All tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run tests if server is running
testEndpoints();
