module.exports = ({ env }) => ({
  connection: {
    client: env('DATABASE_CLIENT', 'sqlite'),
    connection: env('DATABASE_CLIENT') === 'postgres' ? {
      host: env('DATABASE_HOST', 'localhost'),
      port: env.int('DATABASE_PORT', 5432),
      database: env('DATABASE_NAME', 'audiostems'),
      user: env('DATABASE_USERNAME', 'audiostems'),
      password: env('DATABASE_PASSWORD', 'audiostems123'),
      ssl: env.bool('DATABASE_SSL', false) ? {
        rejectUnauthorized: false
      } : false,
    } : {
      filename: env('DATABASE_FILENAME', '.tmp/data.db'),
    },
    useNullAsDefault: true,
  },
});
