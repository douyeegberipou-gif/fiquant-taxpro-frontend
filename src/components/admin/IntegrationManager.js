import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  CreditCard, 
  Mail, 
  BarChart3,
  Settings, 
  Eye, 
  EyeOff,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Key,
  Globe,
  Shield,
  Activity,
  Clock,
  Zap
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const IntegrationManager = () => {
  const [integrations, setIntegrations] = useState({});
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('payments');
  const [showSecrets, setShowSecrets] = useState({});

  // Mock integration configurations
  const integrationCategories = {
    deployment: {
      name: 'Deployment & Hosting',
      icon: Settings,
      color: 'blue',
      services: {
        vercel: {
          name: 'Vercel (Frontend)',
          description: 'Frontend deployment on Vercel',
          status: 'connected',
          environment: 'production',
          config: {
            project_name: 'fiquant-taxpro',
            root_directory: 'frontend',
            build_command: 'yarn build',
            output_directory: 'build',
            install_command: 'yarn install'
          },
          endpoints: {
            dashboard_url: 'https://vercel.com/dashboard',
            docs_url: 'https://vercel.com/docs'
          },
          environment_vars: {
            'REACT_APP_BACKEND_URL': '${supabase-backend-url}',
            'REACT_APP_ENVIRONMENT': 'production'
          },
          features: ['Static Site Hosting', 'Auto Deploy', 'Custom Domains', 'Analytics'],
          lastSync: '2024-01-15T10:30:00Z',
          requestCount: 0,
          errorCount: 0
        },
        supabase: {
          name: 'Supabase (Backend + DB)',
          description: 'Backend API and PostgreSQL database',
          status: 'connected',
          environment: 'production',
          config: {
            project_name: 'fiquant-taxpro-backend',
            database_url: 'postgresql://[ref].[region].supabase.co:5432/postgres',
            api_url: 'https://[ref].supabase.co',
            anon_key: 'eyJ***',
            service_role_key: 'eyJ***'
          },
          endpoints: {
            dashboard_url: 'https://supabase.com/dashboard',
            docs_url: 'https://supabase.com/docs'
          },
          environment_vars: {
            'DATABASE_URL': '${supabase-database-url}',
            'JWT_SECRET': '${random-secure-key}',
            'ENCRYPTION_MASTER_KEY': '${base64-encoded-key}',
            'SUPABASE_URL': '${supabase-api-url}',
            'SUPABASE_ANON_KEY': '${supabase-anon-key}',
            'SUPABASE_SERVICE_ROLE_KEY': '${supabase-service-role-key}'
          },
          features: ['PostgreSQL DB', 'FastAPI Backend', 'Auth', 'Real-time', 'Storage'],
          lastSync: '2024-01-15T09:45:00Z',
          requestCount: 2341,
          errorCount: 0
        },
        security: {
          name: 'Security Configuration',
          description: 'Production security settings',
          status: 'configured',
          environment: 'production',
          config: {
            https_only: true,
            security_headers: true,
            rate_limiting: true,
            field_encryption: true
          },
          endpoints: {
            docs_url: 'https://docs.security-config.com'
          },
          environment_vars: {
            'ENCRYPTION_MASTER_KEY': 'Generate with: python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"',
            'JWT_SECRET': 'Generate with: python -c "import secrets; print(secrets.token_urlsafe(32))"',
            'RATE_LIMIT_PER_MINUTE': '100',
            'ADMIN_IP_WHITELIST': 'comma,separated,ips'
          },
          features: ['HTTPS Enforcement', 'Security Headers', 'Rate Limiting', 'PII Encryption'],
          lastSync: '2024-01-15T11:00:00Z',
          requestCount: 0,
          errorCount: 0
        }
      }
    },
    payments: {
      name: 'Payment Processors',
      icon: CreditCard,
      color: 'green',
      services: {
        stripe: {
          name: 'Stripe',
          description: 'Global payment processing platform',
          status: 'disconnected',
          environment: 'sandbox',
          config: {
            publishable_key: '',
            secret_key: '',
            webhook_secret: '',
            currency: 'NGN'
          },
          endpoints: {
            base_url: 'https://api.stripe.com/v1',
            webhook_url: '/api/webhooks/stripe'
          },
          features: ['Subscriptions', 'Cards', 'Bank Transfers', 'Webhooks'],
          lastSync: null,
          requestCount: 0,
          errorCount: 0
        },
        paystack: {
          name: 'Paystack',
          description: 'African payment gateway',
          status: 'connected',
          environment: 'sandbox',
          config: {
            public_key: 'pk_test_***',
            secret_key: 'sk_test_***',
            webhook_secret: '***'
          },
          endpoints: {
            base_url: 'https://api.paystack.co',
            webhook_url: '/api/webhooks/paystack'
          },
          features: ['Cards', 'Bank Transfer', 'USSD', 'QR Code'],
          lastSync: '2024-01-15T10:30:00Z',
          requestCount: 1247,
          errorCount: 3
        },
        flutterwave: {
          name: 'Flutterwave',
          description: 'Global payment infrastructure for Africa',
          status: 'disconnected',
          environment: 'sandbox',
          config: {
            public_key: '',
            secret_key: '',
            encryption_key: ''
          },
          endpoints: {
            base_url: 'https://api.flutterwave.com/v3',
            webhook_url: '/api/webhooks/flutterwave'
          },
          features: ['Cards', 'Mobile Money', 'Bank Transfer', 'Crypto'],
          lastSync: null,
          requestCount: 0,
          errorCount: 0
        }
      }
    },
    communications: {
      name: 'Communication Services',
      icon: Mail,
      color: 'blue',
      services: {
        sendgrid: {
          name: 'SendGrid',
          description: 'Email delivery service',
          status: 'connected',
          environment: 'production',
          config: {
            api_key: 'SG.***',
            from_email: 'noreply@fiquantconsult.com',
            from_name: 'Fiquant TaxPro'
          },
          endpoints: {
            base_url: 'https://api.sendgrid.com/v3',
            webhook_url: '/api/webhooks/sendgrid'
          },
          features: ['Transactional Email', 'Marketing Campaigns', 'Analytics'],
          lastSync: '2024-01-15T09:45:00Z',
          requestCount: 892,
          errorCount: 1
        },
        mailgun: {
          name: 'Mailgun',
          description: 'Email automation service (Backup)',
          status: 'standby',
          environment: 'production',
          config: {
            api_key: '',
            domain: '',
            from_email: 'noreply@fiquantconsult.com'
          },
          endpoints: {
            base_url: 'https://api.mailgun.net/v3',
            webhook_url: '/api/webhooks/mailgun'
          },
          features: ['Email Sending', 'Email Validation', 'Analytics'],
          lastSync: null,
          requestCount: 0,
          errorCount: 0
        },
        twilio: {
          name: 'Twilio',
          description: 'SMS and voice communication',
          status: 'disconnected',
          environment: 'sandbox',
          config: {
            account_sid: '',
            auth_token: '',
            phone_number: ''
          },
          endpoints: {
            base_url: 'https://api.twilio.com/2010-04-01',
            webhook_url: '/api/webhooks/twilio'
          },
          features: ['SMS', 'Voice Calls', 'WhatsApp', 'Verify'],
          lastSync: null,
          requestCount: 0,
          errorCount: 0
        },
        namecheap: {
          name: 'Namecheap Email',
          description: 'Custom domain email hosting via Namecheap',
          status: 'disconnected',
          environment: 'production',
          config: {
            smtp_host: 'mail.privateemail.com',
            smtp_port: '465',
            smtp_username: '',
            smtp_password: '',
            from_email: '',
            from_name: 'Fiquant TaxPro',
            use_ssl: 'true'
          },
          endpoints: {
            smtp_server: 'mail.privateemail.com',
            webmail_url: 'https://privateemail.com',
            docs_url: 'https://www.namecheap.com/support/knowledgebase/subcategory/1/email/'
          },
          features: ['Custom Domain Email', 'SMTP Sending', 'Email Forwarding', 'Webmail Access'],
          lastSync: null,
          requestCount: 0,
          errorCount: 0
        }
      }
    },
    analytics: {
      name: 'Analytics & Tracking',
      icon: BarChart3,
      color: 'purple',
      services: {
        google_analytics: {
          name: 'Google Analytics',
          description: 'Web analytics service',
          status: 'connected',
          environment: 'production',
          config: {
            tracking_id: 'GA4-***',
            measurement_id: 'G-***',
            api_secret: '***'
          },
          endpoints: {
            base_url: 'https://www.google-analytics.com',
            api_url: 'https://analyticsreporting.googleapis.com/v4'
          },
          features: ['Page Views', 'Events', 'Conversions', 'Real-time'],
          lastSync: '2024-01-15T11:00:00Z',
          requestCount: 2341,
          errorCount: 0
        },
        mixpanel: {
          name: 'Mixpanel',
          description: 'Product analytics platform',
          status: 'disconnected',
          environment: 'production',
          config: {
            project_token: '',
            api_secret: ''
          },
          endpoints: {
            base_url: 'https://api.mixpanel.com',
            webhook_url: '/api/webhooks/mixpanel'
          },
          features: ['Event Tracking', 'Funnel Analysis', 'Cohort Analysis'],
          lastSync: null,
          requestCount: 0,
          errorCount: 0
        },
        segment: {
          name: 'Segment',
          description: 'Customer data platform',
          status: 'disconnected',
          environment: 'production',
          config: {
            write_key: '',
            workspace_slug: ''
          },
          endpoints: {
            base_url: 'https://api.segment.io/v1',
            webhook_url: '/api/webhooks/segment'
          },
          features: ['Data Collection', 'Identity Resolution', 'Destinations'],
          lastSync: null,
          requestCount: 0,
          errorCount: 0
        }
      }
    }
  };

  useEffect(() => {
    fetchIntegrations();
    fetchLogs();
  }, []);

  const fetchIntegrations = async () => {
    try {
      // Mock API call - replace with actual endpoint later
      setIntegrations(integrationCategories);
    } catch (error) {
      console.error('Error fetching integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      // Mock logs data
      const mockLogs = [
        {
          id: 1,
          service: 'paystack',
          category: 'payments',
          event: 'webhook_received',
          status: 'success',
          message: 'Payment successful webhook processed',
          timestamp: '2024-01-15T11:30:00Z'
        },
        {
          id: 2,
          service: 'sendgrid',
          category: 'communications',
          event: 'email_sent',
          status: 'success',
          message: 'Welcome email sent to user@example.com',
          timestamp: '2024-01-15T11:15:00Z'
        },
        {
          id: 3,
          service: 'stripe',
          category: 'payments',
          event: 'api_call',
          status: 'error',
          message: 'Authentication failed - invalid API key',
          timestamp: '2024-01-15T10:45:00Z'
        }
      ];
      setLogs(mockLogs);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  const toggleIntegration = async (category, service, enabled) => {
    try {
      // Mock API call
      const updatedIntegrations = { ...integrations };
      updatedIntegrations[category].services[service].status = enabled ? 'connected' : 'disconnected';
      updatedIntegrations[category].services[service].lastSync = enabled ? new Date().toISOString() : null;
      
      setIntegrations(updatedIntegrations);
      
      // Add log entry
      const newLog = {
        id: Date.now(),
        service: service,
        category: category,
        event: enabled ? 'integration_enabled' : 'integration_disabled',
        status: 'success',
        message: `${integrations[category].services[service].name} ${enabled ? 'enabled' : 'disabled'} by admin`,
        timestamp: new Date().toISOString()
      };
      setLogs(prev => [newLog, ...prev]);
      
    } catch (error) {
      console.error('Error toggling integration:', error);
    }
  };

  const updateConfig = async (category, service, configKey, value) => {
    try {
      const updatedIntegrations = { ...integrations };
      updatedIntegrations[category].services[service].config[configKey] = value;
      setIntegrations(updatedIntegrations);
    } catch (error) {
      console.error('Error updating config:', error);
    }
  };

  const saveConfiguration = async (category, service) => {
    try {
      const token = localStorage.getItem('token');
      const serviceConfig = integrations[category].services[service].config;
      
      const response = await axios.post(`${BACKEND_URL}/api/admin/integrations/${category}/${service}/config`, serviceConfig, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update service status to connected after successful configuration
      const updatedIntegrations = { ...integrations };
      updatedIntegrations[category].services[service].status = 'connected';
      updatedIntegrations[category].services[service].lastSync = new Date().toISOString();
      setIntegrations(updatedIntegrations);
      
      alert(`✅ ${integrations[category].services[service].name} configuration saved successfully!`);
    } catch (error) {
      console.error('Error saving configuration:', error);
      alert(`❌ Failed to save ${integrations[category].services[service].name} configuration`);
    }
  };

  const testConnection = async (category, service) => {
    try {
      // Mock connection test
      const updatedIntegrations = { ...integrations };
      updatedIntegrations[category].services[service].lastSync = new Date().toISOString();
      updatedIntegrations[category].services[service].status = 'connected';
      setIntegrations(updatedIntegrations);
      
      alert(`✅ Connection test successful for ${integrations[category].services[service].name}`);
    } catch (error) {
      alert(`❌ Connection test failed for ${integrations[category].services[service].name}`);
    }
  };

  const toggleSecretVisibility = (category, service, field) => {
    const key = `${category}-${service}-${field}`;
    setShowSecrets(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'standby':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'disconnected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'standby':
        return 'bg-yellow-100 text-yellow-800';
      case 'disconnected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  const renderServiceCard = (category, serviceKey, service) => (
    <Card key={serviceKey} className="border-2 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg bg-${integrationCategories[category].color}-100`}>
              {React.createElement(integrationCategories[category].icon, {
                className: `h-5 w-5 text-${integrationCategories[category].color}-600`
              })}
            </div>
            <div>
              <CardTitle className="text-lg">{service.name}</CardTitle>
              <CardDescription className="text-sm">{service.description}</CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon(service.status)}
            <Badge className={getStatusColor(service.status)}>
              {service.status.toUpperCase()}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Environment & Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Environment:</span>
              <Badge variant="outline">{service.environment.toUpperCase()}</Badge>
            </div>
          </div>
          <Switch
            checked={service.status === 'connected'}
            onCheckedChange={(enabled) => toggleIntegration(category, serviceKey, enabled)}
            className="data-[state=checked]:bg-green-600"
          />
        </div>

        {/* Configuration */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Key className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Configuration</span>
          </div>
          
          {Object.entries(service.config).map(([key, value]) => (
            <div key={key} className="space-y-1">
              <Label htmlFor={`${serviceKey}-${key}`} className="text-xs text-gray-600 capitalize">
                {key.replace(/_/g, ' ')}
              </Label>
              <div className="flex space-x-2">
                <Input
                  id={`${serviceKey}-${key}`}
                  type={showSecrets[`${category}-${serviceKey}-${key}`] ? 'text' : 'password'}
                  value={value}
                  onChange={(e) => updateConfig(category, serviceKey, key, e.target.value)}
                  placeholder={`Enter ${key.replace(/_/g, ' ')}`}
                  className="text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleSecretVisibility(category, serviceKey, key)}
                  className="px-3"
                >
                  {showSecrets[`${category}-${serviceKey}-${key}`] ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Features</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {service.features.map((feature) => (
              <Badge key={feature} variant="secondary" className="text-xs">
                {feature}
              </Badge>
            ))}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{service.requestCount}</div>
            <div className="text-xs text-gray-600">Requests</div>
          </div>
          <div className="text-center">
            <div className={`text-lg font-bold ${service.errorCount > 0 ? 'text-red-600' : 'text-gray-900'}`}>
              {service.errorCount}
            </div>
            <div className="text-xs text-gray-600">Errors</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-900 font-medium">Last Sync</div>
            <div className="text-xs text-gray-600">{formatDate(service.lastSync)}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => testConnection(category, serviceKey)}
            disabled={service.status === 'disconnected'}
            className="flex-1"
          >
            <Activity className="h-4 w-4 mr-2" />
            Test Connection
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => saveConfiguration(category, serviceKey)}
            className="flex-1"
          >
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Integration Manager</h1>
          <p className="text-gray-600 mt-2">Manage external service integrations and API configurations</p>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <Shield className="h-4 w-4 mr-2" />
          Super Admin Only
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="deployment">Deployment</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="logs">Activity Logs</TabsTrigger>
        </TabsList>

        {/* Deployment Tab */}
        <TabsContent value="deployment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2 text-blue-600" />
                Deployment & Hosting Configuration
              </CardTitle>
              <CardDescription>
                Manage your production deployment settings, environment variables, and hosting configurations
              </CardDescription>
            </CardHeader>
          </Card>
          
          <div className="grid grid-cols-1 gap-6">
            {Object.entries(integrations.deployment?.services || {}).map(([key, service]) =>
              renderServiceCard('deployment', key, service)
            )}
          </div>

          {/* Quick Setup Guide */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Deployment Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-green-700 mb-2">Vercel Frontend Setup</h4>
                  <div className="bg-green-50 p-3 rounded text-sm space-y-2">
                    <div><strong>Root Directory:</strong> <code>frontend</code></div>
                    <div><strong>Build Command:</strong> <code>yarn build</code></div>
                    <div><strong>Output Directory:</strong> <code>build</code></div>
                    <div><strong>Install Command:</strong> <code>yarn install</code></div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-purple-700 mb-2">Supabase Backend Setup</h4>
                  <div className="bg-purple-50 p-3 rounded text-sm space-y-2">
                    <div><strong>Project Type:</strong> Backend API</div>
                    <div><strong>Runtime:</strong> Python 3.9+</div>
                    <div><strong>Start Command:</strong> <code>uvicorn server:app --host 0.0.0.0 --port $PORT</code></div>
                    <div><strong>Dependencies:</strong> <code>pip install -r requirements.txt</code></div>
                  </div>
                </div>
              </div>
              
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Security Note:</strong> Always set ENCRYPTION_MASTER_KEY and JWT_SECRET in production environment variables. Never commit secrets to git.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-green-600" />
                Payment Processors
              </CardTitle>
              <CardDescription>
                Manage payment gateways for subscription billing and transactions
              </CardDescription>
            </CardHeader>
          </Card>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(integrations.payments?.services || {}).map(([key, service]) =>
              renderServiceCard('payments', key, service)
            )}
          </div>
        </TabsContent>

        {/* Communications Tab */}
        <TabsContent value="communications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-blue-600" />
                Communication Services
              </CardTitle>
              <CardDescription>
                Configure email, SMS, and messaging service providers
              </CardDescription>
            </CardHeader>
          </Card>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(integrations.communications?.services || {}).map(([key, service]) =>
              renderServiceCard('communications', key, service)
            )}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
                Analytics & Tracking
              </CardTitle>
              <CardDescription>
                Setup analytics platforms for user behavior and business insights
              </CardDescription>
            </CardHeader>
          </Card>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(integrations.analytics?.services || {}).map(([key, service]) =>
              renderServiceCard('analytics', key, service)
            )}
          </div>
        </TabsContent>

        {/* Activity Logs Tab */}
        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2 text-gray-600" />
                Integration Activity Logs
              </CardTitle>
              <CardDescription>
                Monitor API requests, webhooks, and integration events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${
                        log.status === 'success' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {log.status === 'success' ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium capitalize">{log.service}</div>
                        <div className="text-sm text-gray-600">{log.message}</div>
                        <div className="text-xs text-gray-500">
                          {formatDate(log.timestamp)} • {log.event.replace(/_/g, ' ')}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className={`capitalize ${
                      log.status === 'success' ? 'text-green-700 border-green-200' : 'text-red-700 border-red-200'
                    }`}>
                      {log.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegrationManager;