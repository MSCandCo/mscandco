module.exports = ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host: env('DATABASE_HOST', 'localhost'),
      port: env.int('DATABASE_PORT', 5432),
      database: env('DATABASE_NAME', 'audiostems'),
      user: env('DATABASE_USERNAME', 'audiostems_admin'),
      password: env('DATABASE_PASSWORD', ''),
      ssl: env.bool('DATABASE_SSL', true) ? {
        rejectUnauthorized: false,
        ca: env('DATABASE_SSL_CA', ''),
        cert: env('DATABASE_SSL_CERT', ''),
        key: env('DATABASE_SSL_KEY', ''),
      } : false,
      schema: env('DATABASE_SCHEMA', 'public'),
    },
    pool: {
      min: env.int('DATABASE_POOL_MIN', 2),
      max: env.int('DATABASE_POOL_MAX', 10),
    },
    acquireConnectionTimeout: env.int('DATABASE_TIMEOUT', 60000),
    debug: env.bool('DATABASE_DEBUG', false),
  },
});
