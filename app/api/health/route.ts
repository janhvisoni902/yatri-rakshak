import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';
import os from 'os';

export async function GET(req: NextRequest) {
  const startTime = Date.now();

  try {
    // Check database connection
    let dbStatus = 'unknown';
    let dbResponseTime = null;
    
    try {
      const dbStartTime = Date.now();
      await connectDB();
      
      // Test database with a simple query
      const dbState = mongoose.connection.readyState;
      dbStatus = dbState === 1 ? 'connected' : 'disconnected';
      dbResponseTime = Date.now() - dbStartTime;
    } catch (dbError) {
      dbStatus = 'error';
      console.error('Database health check failed:', dbError);
    }

    // System information
    const systemInfo = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
      },
      cpu: {
        loadAverage: os.loadavg(),
      }
    };

    // Overall health status
    const isHealthy = dbStatus === 'connected';
    const responseTime = Date.now() - startTime;

    const healthData = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: systemInfo.timestamp,
      uptime: `${Math.floor(systemInfo.uptime / 3600)}h ${Math.floor((systemInfo.uptime % 3600) / 60)}m ${Math.floor(systemInfo.uptime % 60)}s`,
      version: process.env.APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: {
          status: dbStatus,
          responseTime: dbResponseTime ? `${dbResponseTime}ms` : 'N/A',
          connection: mongoose.connection.readyState === 1 ? 'active' : 'inactive'
        },
        api: {
          status: 'healthy',
          responseTime: `${responseTime}ms`
        }
      },
      system: {
        nodeVersion: systemInfo.nodeVersion,
        platform: `${systemInfo.platform}-${systemInfo.arch}`,
        memory: {
          used: `${systemInfo.memory.used}MB`,
          total: `${systemInfo.memory.total}MB`,
          rss: `${systemInfo.memory.rss}MB`
        },
        loadAverage: systemInfo.cpu.loadAverage || 'N/A'
      },
      checks: {
        database: dbStatus === 'connected',
        api: true,
        memory: systemInfo.memory.used < 1000, // Alert if using more than 1GB
        uptime: systemInfo.uptime > 60 // Alert if uptime is less than 1 minute
      }
    };

    // Return appropriate status code
    const statusCode = isHealthy ? 200 : 503;

    return NextResponse.json(healthData, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
}

// Support HEAD requests for load balancers
export async function HEAD(req: NextRequest) {
  try {
    await connectDB();
    const isHealthy = mongoose.connection.readyState === 1;
    
    return new NextResponse(null, { 
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    return new NextResponse(null, { status: 503 });
  }
}
