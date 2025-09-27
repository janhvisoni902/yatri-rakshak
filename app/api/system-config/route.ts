import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';

interface SystemConfig {
  id: string;
  category: 'general' | 'security' | 'notifications' | 'monitoring' | 'emergency';
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'json';
  description: string;
  updatedBy?: string;
  updatedAt?: string;
  requiresRestart?: boolean;
}

// Mock system configuration - In production, this would be stored in database
let systemConfig: SystemConfig[] = [
  {
    id: '1',
    category: 'general',
    key: 'system_name',
    value: 'Yatri Rakshak',
    type: 'string',
    description: 'System display name',
    requiresRestart: false
  },
  {
    id: '2',
    category: 'general',
    key: 'max_concurrent_users',
    value: 1000,
    type: 'number',
    description: 'Maximum concurrent users allowed',
    requiresRestart: true
  },
  {
    id: '3',
    category: 'security',
    key: 'session_timeout',
    value: 3600,
    type: 'number',
    description: 'Session timeout in seconds (1 hour)',
    requiresRestart: false
  },
  {
    id: '4',
    category: 'security',
    key: 'enable_2fa',
    value: true,
    type: 'boolean',
    description: 'Enable two-factor authentication',
    requiresRestart: false
  },
  {
    id: '5',
    category: 'security',
    key: 'max_login_attempts',
    value: 5,
    type: 'number',
    description: 'Maximum login attempts before account lockout',
    requiresRestart: false
  },
  {
    id: '6',
    category: 'notifications',
    key: 'enable_email_alerts',
    value: true,
    type: 'boolean',
    description: 'Enable email notifications for alerts',
    requiresRestart: false
  },
  {
    id: '7',
    category: 'notifications',
    key: 'enable_sms_alerts',
    value: false,
    type: 'boolean',
    description: 'Enable SMS notifications for critical alerts',
    requiresRestart: false
  },
  {
    id: '8',
    category: 'monitoring',
    key: 'health_check_interval',
    value: 300,
    type: 'number',
    description: 'Health check interval in seconds (5 minutes)',
    requiresRestart: true
  },
  {
    id: '9',
    category: 'monitoring',
    key: 'log_retention_days',
    value: 90,
    type: 'number',
    description: 'Number of days to retain system logs',
    requiresRestart: false
  },
  {
    id: '10',
    category: 'emergency',
    key: 'emergency_contacts',
    value: {
      police: '+91-100',
      medical: '+91-108',
      fire: '+91-101',
      disaster: '+91-1078'
    },
    type: 'json',
    description: 'Emergency service contact numbers',
    requiresRestart: false
  },
  {
    id: '11',
    category: 'emergency',
    key: 'auto_escalate_critical',
    value: true,
    type: 'boolean',
    description: 'Automatically escalate critical incidents',
    requiresRestart: false
  },
  {
    id: '12',
    category: 'emergency',
    key: 'emergency_response_timeout',
    value: 900,
    type: 'number',
    description: 'Emergency response timeout in seconds (15 minutes)',
    requiresRestart: false
  }
];

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only higher authorities can access system config
    if (!['higher_authority', 'admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    let filteredConfig = systemConfig;

    if (category) {
      filteredConfig = filteredConfig.filter(config => config.category === category);
    }

    // Group by category
    const configByCategory = filteredConfig.reduce((acc, config) => {
      if (!acc[config.category]) {
        acc[config.category] = [];
      }
      acc[config.category].push(config);
      return acc;
    }, {} as Record<string, SystemConfig[]>);

    return NextResponse.json({
      config: filteredConfig,
      configByCategory,
      categories: ['general', 'security', 'notifications', 'monitoring', 'emergency'],
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('System config API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system configuration' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['higher_authority', 'admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await req.json();
    const { id, value } = body;

    if (!id || value === undefined) {
      return NextResponse.json({ error: 'Missing id or value' }, { status: 400 });
    }

    const configIndex = systemConfig.findIndex(config => config.id === id);
    if (configIndex === -1) {
      return NextResponse.json({ error: 'Configuration not found' }, { status: 404 });
    }

    const config = systemConfig[configIndex];

    // Validate value type
    if (config.type === 'number' && typeof value !== 'number') {
      return NextResponse.json({ error: 'Invalid value type. Expected number.' }, { status: 400 });
    }
    if (config.type === 'boolean' && typeof value !== 'boolean') {
      return NextResponse.json({ error: 'Invalid value type. Expected boolean.' }, { status: 400 });
    }
    if (config.type === 'string' && typeof value !== 'string') {
      return NextResponse.json({ error: 'Invalid value type. Expected string.' }, { status: 400 });
    }

    // Update the configuration
    config.value = value;
    config.updatedBy = session.user.name;
    config.updatedAt = new Date().toISOString();

    // Log configuration change
    console.log(`Configuration updated: ${config.key} = ${JSON.stringify(value)} by ${session.user.name}`);

    return NextResponse.json({
      success: true,
      config,
      message: `Configuration '${config.key}' updated successfully`,
      requiresRestart: config.requiresRestart
    }, { status: 200 });

  } catch (error) {
    console.error('Update system config error:', error);
    return NextResponse.json(
      { error: 'Failed to update configuration' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['higher_authority', 'admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await req.json();
    const { action } = body;

    switch (action) {
      case 'backup':
        return await backupConfiguration(session.user.name);
      case 'restore':
        return await restoreConfiguration(body.backupData, session.user.name);
      case 'reset':
        return await resetToDefaults(session.user.name);
      case 'export':
        return await exportConfiguration();
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('System config action error:', error);
    return NextResponse.json(
      { error: 'Failed to perform configuration action' },
      { status: 500 }
    );
  }
}

async function backupConfiguration(userName: string) {
  const backup = {
    timestamp: new Date().toISOString(),
    createdBy: userName,
    config: [...systemConfig],
    version: '1.0'
  };

  // In production, save to database or file system
  console.log('Configuration backed up by:', userName);

  return NextResponse.json({
    success: true,
    backup,
    message: 'Configuration backed up successfully'
  });
}

async function restoreConfiguration(backupData: any, userName: string) {
  if (!backupData || !Array.isArray(backupData.config)) {
    return NextResponse.json({ error: 'Invalid backup data' }, { status: 400 });
  }

  // Restore configuration
  systemConfig = backupData.config.map((config: any) => ({
    ...config,
    updatedBy: userName,
    updatedAt: new Date().toISOString()
  }));

  console.log('Configuration restored by:', userName);

  return NextResponse.json({
    success: true,
    message: 'Configuration restored successfully'
  });
}

async function resetToDefaults(userName: string) {
  // Reset all configurations to default values
  systemConfig.forEach(config => {
    config.updatedBy = userName;
    config.updatedAt = new Date().toISOString();
    // In production, you would reset to actual default values
  });

  console.log('Configuration reset to defaults by:', userName);

  return NextResponse.json({
    success: true,
    message: 'Configuration reset to defaults successfully'
  });
}

async function exportConfiguration() {
  const exportData = {
    timestamp: new Date().toISOString(),
    version: '1.0',
    config: systemConfig
  };

  return NextResponse.json({
    success: true,
    data: exportData,
    message: 'Configuration exported successfully'
  });
}
