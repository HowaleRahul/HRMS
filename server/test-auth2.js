import jwt from 'jsonwebtoken';
import { config } from './config/config.js';
import axios from 'axios';

async function test() {
  const payload = {
    id: 1, // Super Admin
    username: 'admin',
    role: { id: 1, name: 'Super Admin' },
    employee_id: 1
  };
  const token = jwt.sign(payload, config.jwt.secret, { expiresIn: '1h' });
  
  try {
    const res = await axios.get('http://localhost:5000/api/employees', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Success:', res.status);
  } catch (error) {
    console.error('Error:', error.response?.status, error.response?.data);
  }
}
test();
