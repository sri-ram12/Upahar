const endpoints = [
  '/',
  '/menu',
  '/menu/ghee-karam-dosa',
  '/about',
  '/experience',
  '/gallery',
  '/contact',
  '/admin/login',
  '/api/restaurant',
  '/api/menu',
  '/api/categories',
  '/api/gallery'
];

async function testAll() {
  console.log('Testing UPAHAR Showcase Platform Endpoints on http://localhost:3000...\n');
  let allOk = true;

  for (const ep of endpoints) {
    try {
      const res = await fetch(`http://localhost:3000${ep}`);
      console.log(`[PASS] ${ep.padEnd(25)} => Status: ${res.status} ${res.statusText}`);
      if (!res.ok) allOk = false;
    } catch (err) {
      console.error(`[FAIL] ${ep.padEnd(25)} => Error: ${err.message}`);
      allOk = false;
    }
  }

  // Test Contact Form Inquiry Submission via POST
  console.log('\nTesting Guest Inquiry Submission via POST /api/contact...');
  try {
    const inquiryPayload = {
      name: 'Ramesh Sharma',
      contact: '9876543210',
      email: 'ramesh@example.com',
      subject: 'Family Dining & Morning Tiffins Inquiry',
      message: 'Looking forward to visiting your Sangivalasa restaurant this weekend!'
    };

    const contactRes = await fetch('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inquiryPayload)
    });

    const contactData = await contactRes.json();
    console.log(`[PASS] POST /api/contact => Status: ${contactRes.status}, Result: ${contactData.message}`);
    if (!contactRes.ok) allOk = false;
  } catch (err) {
    console.error(`[FAIL] Contact submission: ${err.message}`);
    allOk = false;
  }

  console.log(`\nAll Automated Showcase Tests Passed: ${allOk ? 'YES' : 'NO'}`);
}

testAll();
