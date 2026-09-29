import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const setupDatabase = async () => {
  console.log('Starting database setup...');
  
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    });

    console.log('Connected to MySQL server.');

    const schemaPath = path.join(__dirname, 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
      console.log('schema.sql not found. Creating a minimal one...');
      fs.writeFileSync(schemaPath, `
        CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'hrms_db'}\`;
        USE \`${process.env.DB_NAME || 'hrms_db'}\`;
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(50) NOT NULL,
          password VARCHAR(255) NOT NULL,
          role_id INT DEFAULT 2,
          is_active TINYINT DEFAULT 1,
          is_deleted TINYINT DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          deleted_at DATETIME NULL
        );
      `);
    }

    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Executing schema...');
    await connection.query(schema);
    
    console.log('Database setup completed successfully.');
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
};

setupDatabase();
