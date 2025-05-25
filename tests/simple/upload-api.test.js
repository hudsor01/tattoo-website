// Simple API test - no complex frameworks
const fs = require('fs');
const path = require('path');

async function testUploadAPI() {
  console.log('🧪 Testing Upload API...');
  
  try {
    // Create a simple test image buffer
    const testImageBuffer = Buffer.from('fake-image-data');
    
    // Create FormData
    const formData = new FormData();
    const blob = new Blob([testImageBuffer], { type: 'image/jpeg' });
    formData.append('file', blob, 'test.jpg');
    formData.append('title', 'Test Upload');
    formData.append('category', 'traditional');
    
    const response = await fetch('http://localhost:3001/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Upload API works!', result);
      return true;
    } else {
      console.log('❌ Upload API failed:', result);
      return false;
    }
  } catch (error) {
    console.log('❌ Upload test error:', error.message);
    return false;
  }
}

// Run if server is running
testUploadAPI().then(success => {
  console.log(success ? '🎉 Upload API is working!' : '💥 Upload API needs fixing');
  process.exit(success ? 0 : 1);
});