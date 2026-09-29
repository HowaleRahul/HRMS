import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { config } from './config/config.js';
import logger from './utils/logger.js';
import { errorResponse } from './utils/apiResponse.js';
import { apiLimiter } from './middleware/rateLimiter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: config.clientUrl,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(apiLimiter);

// Serve static files
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// Create logs directory
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Routes loader
const loadRoutes = async () => {
  const routes = [
    { path: '/api/auth', module: './routes/auth.routes.js' },
    { path: '/api/employees', module: './routes/employee.routes.js' },
    { path: '/api/departments', module: './routes/department.routes.js' },
    { path: '/api/designations', module: './routes/designation.routes.js' },
    { path: '/api/attendance', module: './routes/attendance.routes.js' },
    { path: '/api/leaves', module: './routes/leave.routes.js' },
    { path: '/api/payroll', module: './routes/payroll.routes.js' },
    { path: '/api/recruitment', module: './routes/recruitment.routes.js' },
    { path: '/api/documents', module: './routes/document.routes.js' },
    { path: '/api/performance', module: './routes/performance.routes.js' },
    { path: '/api/assets', module: './routes/asset.routes.js' },
    { path: '/api/notices', module: './routes/notice.routes.js' },
    { path: '/api/holidays', module: './routes/holiday.routes.js' },
    { path: '/api/reports', module: './routes/report.routes.js' },
    { path: '/api/users', module: './routes/user.routes.js' },
    { path: '/api/dashboard', module: './routes/dashboard.routes.js' },
    { path: '/api/notifications', module: './routes/notification.routes.js' }
  ];

  for (const route of routes) {
    try {
      if (fs.existsSync(path.join(__dirname, route.module))) {
        const routerModule = await import(route.module);
        app.use(route.path, routerModule.default);
      }
    } catch (error) {
      logger.error(`Failed to load route ${route.path}: ${error.message}`);
    }
  }
};

await loadRoutes();

// 404 Handler
app.use((req, res) => {
  errorResponse(res, 'Route not found', 404);
});

// Global Error Handler
app.use((err, req, res, next) => {
  logger.error(err.stack);
  
  if (err.code === 'ER_DUP_ENTRY') {
    return errorResponse(res, 'A record with this information already exists (Duplicate Entry).', 400);
  }
  if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_ROW_IS_REFERENCED') {
    return errorResponse(res, 'Cannot delete this record because it is referenced by other data.', 400);
  }
  
  errorResponse(res, 'Internal Server Error', 500, process.env.NODE_ENV === 'development' ? err.message : null);
});

app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port}`);
});

export default app;
