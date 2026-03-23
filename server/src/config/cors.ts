/**
 * CORS Configuration for Nexora
 * Поддерживает production (Render) и development
 */

export const getCorsConfig = () => {
  const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
  const ADMIN_URL = process.env.ADMIN_URL || 'http://localhost:5174';
  
  const allowedOrigins = [
    CLIENT_URL,
    ADMIN_URL,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
  ];

  // Filter out undefined values
  const validOrigins = allowedOrigins.filter(Boolean);

  return {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (mobile apps, curl, etc.) in development
      if (!origin) {
        if (process.env.NODE_ENV === 'production') {
          return callback(new Error('Missing origin'), false);
        }
        return callback(null, true);
      }

      // Check if origin is allowed
      if (validOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Block unknown origins in production
      callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
    maxAge: 86400, // 24 hours
  };
};

export const socketCorsConfig = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
    const ADMIN_URL = process.env.ADMIN_URL || 'http://localhost:5174';
    
    const allowedOrigins = [
      CLIENT_URL,
      ADMIN_URL,
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
    ].filter(Boolean);

    if (!origin) {
      if (process.env.NODE_ENV === 'production') {
        return callback(new Error('Missing origin'), false);
      }
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
