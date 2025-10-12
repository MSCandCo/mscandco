// Production Health Check API
// Monitors system status and production readiness

import { createClient } from '@supabase/supabase-js';
import { validateProductionReadiness, getConfigSummary } from '@/lib/production-config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Test database connectivity
async function testDatabase() {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1);
    
    return {
      status: 'healthy',
      connected: true,
      error: null
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      connected: false,
      error: error.message
    };
  }
}

// Test Chartmetric API
async function testChartmetric() {
  if (!process.env.CHARTMETRIC_REFRESH_TOKEN) {
    return {
      status: 'not_configured',
      configured: false,
      error: 'CHARTMETRIC_REFRESH_TOKEN not set'
    };
  }

  try {
    const response = await fetch('https://api.chartmetric.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        refreshtoken: process.env.CHARTMETRIC_REFRESH_TOKEN
      })
    });

    if (response.ok) {
      return {
        status: 'healthy',
        configured: true,
        error: null
      };
    } else {
      return {
        status: 'unhealthy',
        configured: true,
        error: `HTTP ${response.status}: ${response.statusText}`
      };
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      configured: true,
      error: error.message
    };
  }
}

// Test Revolut API
async function testRevolut() {
  if (!process.env.REVOLUT_API_KEY) {
    return {
      status: 'not_configured',
      configured: false,
      error: 'REVOLUT_API_KEY not set'
    };
  }

  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://merchant.revolut.com/api'
    : 'https://sandbox-merchant.revolut.com/api';

  try {
    // Test with a simple API call (this might need adjustment based on Revolut's API)
    const response = await fetch(`${baseUrl}/orders`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.REVOLUT_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      status: response.ok ? 'healthy' : 'unhealthy',
      configured: true,
      error: response.ok ? null : `HTTP ${response.status}: ${response.statusText}`
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      configured: true,
      error: error.message
    };
  }
}

// Check system resources and performance
function getSystemHealth() {
  const memoryUsage = process.memoryUsage();
  const uptime = process.uptime();
  
  return {
    uptime: Math.floor(uptime),
    memory: {
      used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      external: Math.round(memoryUsage.external / 1024 / 1024)
    },
    nodeVersion: process.version,
    platform: process.platform
  };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const startTime = Date.now();

  try {
    // Run all health checks in parallel
    const [
      databaseHealth,
      chartmetricHealth,
      revolutHealth,
      systemHealth,
      configSummary
    ] = await Promise.all([
      testDatabase(),
      testChartmetric(),
      testRevolut(),
      getSystemHealth(),
      Promise.resolve(getConfigSummary())
    ]);

    const responseTime = Date.now() - startTime;
    
    // Determine overall health status
    const criticalServices = [databaseHealth];
    const optionalServices = [chartmetricHealth, revolutHealth];
    
    const criticalHealthy = criticalServices.every(service => 
      service.status === 'healthy'
    );
    
    const optionalHealthy = optionalServices.filter(service => 
      service.status === 'healthy' || service.status === 'not_configured'
    ).length;

    const overallStatus = criticalHealthy ? 
      (optionalHealthy === optionalServices.length ? 'healthy' : 'degraded') : 
      'unhealthy';

    const healthCheck = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      responseTime,
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      
      services: {
        database: databaseHealth,
        chartmetric: chartmetricHealth,
        revolut: revolutHealth
      },
      
      system: systemHealth,
      configuration: configSummary,
      
      productionReadiness: validateProductionReadiness(),
      
      // Additional metadata
      checks: {
        total: 3,
        healthy: Object.values({
          database: databaseHealth,
          chartmetric: chartmetricHealth,
          revolut: revolutHealth
        }).filter(s => s.status === 'healthy').length,
        configured: Object.values({
          database: databaseHealth,
          chartmetric: chartmetricHealth,
          revolut: revolutHealth
        }).filter(s => s.configured !== false).length
      }
    };

    // Set appropriate HTTP status code
    const statusCode = overallStatus === 'healthy' ? 200 : 
                      overallStatus === 'degraded' ? 200 : 503;

    res.status(statusCode).json(healthCheck);

  } catch (error) {
    console.error('Health check failed:', error);
    
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      responseTime: Date.now() - startTime
    });
  }
}
