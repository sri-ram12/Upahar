const http = require('http');

const urls = [
  'http://localhost:3000',
  'http://localhost:3000/menu',
  'http://localhost:3000/offers',
  'http://localhost:3000/about',
  'http://localhost:3000/gallery',
  'http://localhost:3000/contact',
  'http://localhost:3000/cart',
  'http://localhost:3000/checkout',
  'http://localhost:3000/order-tracking',
  'http://localhost:3000/admin/login',
  'http://localhost:3000/api/menu',
  'http://localhost:3000/api/restaurant',
  'http://localhost:3000/api/categories',
  'http://localhost:3000/api/offers',
];

async function checkUrl(url) {
  try {
    const res = await fetch(url);
    console.log(`[PASS] ${res.status} : ${url}`);
  } catch (err) {
    console.error(`[FAIL] ${url} : ${err.message}`);
  }
}

async function run() {
  console.log('Testing UPAHAR website endpoints...');
  for (const url of urls) {
    await checkUrl(url);
  }
}

run();
