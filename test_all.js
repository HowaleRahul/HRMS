const http = require('http');

const request = (path, method = 'GET', data = null, token = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api' + path,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    if (token) options.headers['Authorization'] = 'Bearer ' + token;

    const req = http.request(options, res => {
      let body = '';
      res.on('data', chunk => body += chunk.toString());
      res.on('end', () => {
        resolve({ status: res.statusCode, body });
      });
    });
    
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
};

(async () => {
  try {
    console.log('Logging in...');
    const loginRes = await request('/auth/login', 'POST', { username: 'admin@hrms.com', password: 'password' });
    const loginData = JSON.parse(loginRes.body);
    if (!loginData.success) {
      console.log('Login failed:', loginData.message);
      return;
    }
    const token = loginData.data.token;
    console.log('Logged in successfully!');

    const endpoints = [
      '/employees',
      '/departments',
      '/designations',
      '/attendance',
      '/leaves/requests',
      '/payroll',
      '/recruitment/jobs',
      '/recruitment/candidates',
      '/recruitment/applications',
      '/documents',
      '/performance/reviews',
      '/assets',
      '/notices',
      '/holidays',
      '/dashboard'
    ];

    for (const ep of endpoints) {
      console.log(`Testing GET ${ep}...`);
      const res = await request(ep, 'GET', null, token);
      if (res.status >= 400) {
        console.log(`❌ ERROR on ${ep}: Status ${res.status} - ${res.body.slice(0, 100)}`);
      } else {
        console.log(`✅ OK on ${ep}`);
      }
    }
  } catch (err) {
    console.error('Test crashed:', err);
  }
})();
