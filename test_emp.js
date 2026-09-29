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
    const loginRes = await request('/auth/login', 'POST', { username: 'admin@hrms.com', password: 'Admin123' });
    const loginData = JSON.parse(loginRes.body);
    const token = loginData.data.token;
    const res = await request('/employees', 'GET', null, token);
    console.log(res.body);
  } catch (err) {
    console.error(err);
  }
})();
