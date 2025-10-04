// Test script to verify frontend-backend integration
const fetch = require('node-fetch');

const BACKEND_URL = 'http://localhost:3001';
const FRONTEND_URL = 'http://localhost:3000';

async function testBackendConnection() {
  console.log('🧪 Testing Backend Connection...\n');

  try {
    // Test health endpoint
    console.log('1. Testing backend health...');
    const healthResponse = await fetch(`${BACKEND_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Backend health:', healthData.status);
    console.log('');

    // Test signup endpoint
    console.log('2. Testing signup endpoint...');
    const signupResponse = await fetch(`${BACKEND_URL}/signup`, {
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
    if (!signupData.success) {
      console.log('   Error:', signupData.error);
    }
    console.log('');

    // Test login endpoint
    console.log('3. Testing login endpoint...');
    const loginResponse = await fetch(`${BACKEND_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword123'
      })
    });
    const loginData = await loginResponse.json();
    console.log('✅ Login response:', loginData.success ? 'Success' : 'Failed');
    if (!loginData.success) {
      console.log('   Error:', loginData.error);
    }
    console.log('');

    // Test analytics endpoint
    console.log('4. Testing analytics endpoint...');
    const analyticsResponse = await fetch(`${BACKEND_URL}/analytics`);
    const analyticsData = await analyticsResponse.json();
    console.log('✅ Analytics response:', analyticsData.success ? 'Success' : 'Failed');
    if (analyticsData.success) {
      console.log('   - Food rescued:', analyticsData.data.foodRescued.totalUnits, 'units');
      console.log('   - CO2 saved:', analyticsData.data.environmentalImpact.co2SavedKg, 'kg');
    }
    console.log('');

    console.log('🎉 Backend integration test completed!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Start the frontend: cd frontend-mvp && npm run dev');
    console.log('2. Visit http://localhost:3000/login');
    console.log('3. Try signing up with a new account');
    console.log('4. Try logging in with existing credentials');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('1. Make sure the backend is running: cd backend && npm start');
    console.log('2. Check that the backend is accessible at http://localhost:3001');
  }
}

// Run the test
testBackendConnection();
