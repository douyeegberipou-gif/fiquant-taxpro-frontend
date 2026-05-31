import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Mail, 
  MessageSquare, 
  Bell, 
  Users, 
  Send,
  Calendar,
  BarChart3,
  Settings,
  Plus,
  Eye,
  Edit,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Target,
  RefreshCw,
  XCircle
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const MessagingDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [templates, setTemplates] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [segments, setSegments] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [sentEmails, setSentEmails] = useState([]);
  const [loading, setLoading] = useState(true);

  // Template Creation State
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    channel: 'email',
    subject_template: '',
    body_template: '',
    merge_tags: [],
    need_approval: false
  });

  // Campaign Creation State
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [campaignForm, setCampaignForm] = useState({
    campaign_name: '',
    channel: 'email',
    template_id: '',
    subject_template: '',
    body_template: '',
    segment_id: '',
    scheduled_at: '',
    need_approval: false
  });

  // Segment Creation State
  const [showSegmentForm, setShowSegmentForm] = useState(false);
  const [segmentForm, setSegmentForm] = useState({
    name: '',
    description: '',
    filters_json: {
      tier: [],
      trial_status: [],
      last_active_days: 30
    }
  });

  // Compose Email State
  const [composeForm, setComposeForm] = useState({
    recipient_type: 'all',
    recipient_email: '',
    subject: '',
    message: '',
    priority: 'normal'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [templatesRes, campaignsRes, segmentsRes, analyticsRes, sentEmailsRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/admin/messaging/templates`, { headers }),
        axios.get(`${BACKEND_URL}/api/admin/messaging/campaigns`, { headers }),
        axios.get(`${BACKEND_URL}/api/admin/messaging/segments`, { headers }),
        axios.get(`${BACKEND_URL}/api/admin/messaging/analytics/dashboard`, { headers }),
        axios.get(`${BACKEND_URL}/api/admin/messaging/sent-emails`, { headers })
      ]);

      console.log('Templates loaded:', templatesRes.data); // Debug log
      setTemplates(templatesRes.data || []);
      setCampaigns(campaignsRes.data || []);
      setSegments(segmentsRes.data || []);
      setAnalytics(analyticsRes.data || {});
      setSentEmails(sentEmailsRes.data || []);
    } catch (error) {
      console.error('Error fetching messaging data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${BACKEND_URL}/api/admin/messaging/templates`, templateForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setShowTemplateForm(false);
      setTemplateForm({
        name: '',
        channel: 'email',
        subject_template: '',
        body_template: '',
        merge_tags: [],
        need_approval: false
      });
      fetchData();
      alert('Template created successfully!');
    } catch (error) {
      console.error('Error creating template:', error);
      alert('Failed to create template');
    }
  };

  const createCampaign = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${BACKEND_URL}/api/admin/messaging/campaigns`, campaignForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setShowCampaignForm(false);
      setCampaignForm({
        campaign_name: '',
        channel: 'email',
        template_id: '',
        subject_template: '',
        body_template: '',
        segment_id: '',
        scheduled_at: '',
        need_approval: false
      });
      fetchData();
      alert('Campaign created successfully!');
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Failed to create campaign');
    }
  };

  const createSegment = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${BACKEND_URL}/api/admin/messaging/segments`, segmentForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setShowSegmentForm(false);
      setSegmentForm({
        name: '',
        description: '',
        filters_json: {
          tier: [],
          trial_status: [],
          last_active_days: 30
        }
      });
      fetchData();
      alert(`Segment created successfully! Estimated reach: ${response.data.estimated_count} users`);
    } catch (error) {
      console.error('Error creating segment:', error);
      alert('Failed to create segment');
    }
  };

  const sendCampaign = async (campaignId) => {
    if (!window.confirm('Are you sure you want to send this campaign?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${BACKEND_URL}/api/admin/messaging/campaigns/${campaignId}/send`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert(`Campaign sent successfully to ${response.data.sent_count} users!`);
      fetchData();
    } catch (error) {
      console.error('Error sending campaign:', error);
      alert('Failed to send campaign');
    }
  };

  const quickSendTemplate = async (template) => {
    // Create a quick campaign from template and send immediately
    const campaignName = `Quick Send: ${template.name} - ${new Date().toLocaleString()}`;
    
    if (!window.confirm(`Send "${template.name}" template immediately to all users? This will create and send a campaign.`)) return;
    
    try {
      const token = localStorage.getItem('token');
      
      // First create a campaign using the template
      const campaignData = {
        campaign_name: campaignName,
        channel: template.channel,
        template_id: template.id,
        subject_template: template.subject_template,
        body_template: template.body_template,
        segment_id: '', // Send to all users
        scheduled_at: '', // Send immediately
        need_approval: false
      };
      
      const createResponse = await axios.post(`${BACKEND_URL}/api/admin/messaging/campaigns`, campaignData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Then send the campaign immediately
      const sendResponse = await axios.post(`${BACKEND_URL}/api/admin/messaging/campaigns/${createResponse.data.campaign_id}/send`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert(`✅ Template "${template.name}" sent successfully to ${sendResponse.data.sent_count} users!`);
      fetchData(); // Refresh data to show new campaign
    } catch (error) {
      console.error('Error with quick send:', error);
      alert('❌ Failed to send template. Please check your configuration and try again.');
    }
  };

  const sendQuickEmail = async () => {
    if (!composeForm.subject || !composeForm.message) {
      alert('Please fill in both subject and message fields.');
      return;
    }

    if (composeForm.recipient_type === 'individual' && !composeForm.recipient_email) {
      alert('Please enter the recipient email address for individual user sending.');
      return;
    }

    const confirmMessage = `Send email "${composeForm.subject}" to ${
      composeForm.recipient_type === 'all' ? 'all users' : 
      composeForm.recipient_type === 'segment' ? 'selected segment' : 
      `${composeForm.recipient_email}`
    }?`;
    
    if (!window.confirm(confirmMessage)) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${BACKEND_URL}/api/admin/messaging/send-quick-email`, composeForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert(`✅ Email sent successfully to ${response.data.sent_count} users!`);
      
      // Reset form
      setComposeForm({
        recipient_type: 'all',
        recipient_email: '',
        subject: '',
        message: '',
        priority: 'normal'
      });
      
      fetchData(); // Refresh analytics
    } catch (error) {
      console.error('Error sending quick email:', error);
      alert('❌ Failed to send email. Please check your configuration and try again.');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'scheduled':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'draft':
        return <Edit className="h-4 w-4 text-gray-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
    }
  };

  const getChannelIcon = (channel) => {
    switch (channel) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'sms':
        return <MessageSquare className="h-4 w-4" />;
      case 'in_app':
        return <Bell className="h-4 w-4" />;
      default:
        return <Send className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">Messaging & Compliance</h1>
          <p className="text-gray-600 mt-2">Manage user communications and compliance reminders</p>
        </div>
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
          <Send className="h-4 w-4 mr-2" />
          Admin Messaging
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="compose">Compose & Send</TabsTrigger>
          <TabsTrigger value="sent-emails">Sent Emails</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="segments">Segments</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.total_campaigns || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Messages Sent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.total_sent || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Delivery Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{analytics.delivery_rate || 0}%</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Open Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{analytics.open_rate || 0}%</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.recent_campaigns?.map((campaign, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getChannelIcon(campaign.channel)}
                      <div>
                        <div className="font-medium">{campaign.campaign_name}</div>
                        <div className="text-sm text-gray-600">
                          {campaign.sent_count} sent • {campaign.delivery_rate}% delivered
                          {campaign.open_rate && ` • ${campaign.open_rate}% opened`}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(campaign.sent_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compose & Send Tab */}
        <TabsContent value="compose" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Compose & Send Email</h2>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Email Composer</CardTitle>
              <CardDescription>Send an email directly to users without creating templates or campaigns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Recipient Type</Label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={composeForm.recipient_type}
                    onChange={(e) => setComposeForm({...composeForm, recipient_type: e.target.value})}
                  >
                    <option value="all">All Users</option>
                    <option value="segment">Select Segment</option>
                    <option value="individual">Individual User</option>
                  </select>
                </div>
                <div>
                  <Label>Priority</Label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={composeForm.priority}
                    onChange={(e) => setComposeForm({...composeForm, priority: e.target.value})}
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {/* Individual User Email Field */}
              {composeForm.recipient_type === 'individual' && (
                <div>
                  <Label>Recipient Email Address</Label>
                  <Input 
                    type="email"
                    placeholder="Enter user email address..."
                    value={composeForm.recipient_email}
                    onChange={(e) => setComposeForm({...composeForm, recipient_email: e.target.value})}
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter the email address of the specific user you want to send to</p>
                </div>
              )}

              <div>
                <Label>Subject</Label>
                <Input 
                  placeholder="Enter email subject..."
                  value={composeForm.subject}
                  onChange={(e) => setComposeForm({...composeForm, subject: e.target.value})}
                />
              </div>

              <div>
                <Label>Message</Label>
                <textarea
                  className="w-full p-3 border rounded-md h-40"
                  placeholder="Type your message here..."
                  value={composeForm.message}
                  onChange={(e) => setComposeForm({...composeForm, message: e.target.value})}
                />
              </div>

              <div className="flex items-center space-x-4">
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={sendQuickEmail}
                  disabled={
                    !composeForm.subject || 
                    !composeForm.message || 
                    (composeForm.recipient_type === 'individual' && !composeForm.recipient_email)
                  }
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Now
                </Button>
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button variant="outline">
                  Save as Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Message Templates</h2>
            <Button onClick={() => setShowTemplateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>

          {showTemplateForm && (
            <Card>
              <CardHeader>
                <CardTitle>Create New Template</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Template Name</Label>
                    <Input
                      value={templateForm.name}
                      onChange={(e) => setTemplateForm({...templateForm, name: e.target.value})}
                      placeholder="e.g., Tax Filing Reminder"
                    />
                  </div>
                  <div>
                    <Label>Channel</Label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={templateForm.channel}
                      onChange={(e) => setTemplateForm({...templateForm, channel: e.target.value})}
                    >
                      <option value="email">Email</option>
                      <option value="sms">SMS</option>
                      <option value="in_app">In-App</option>
                    </select>
                  </div>
                </div>

                {templateForm.channel === 'email' && (
                  <div>
                    <Label>Subject Template</Label>
                    <Input
                      value={templateForm.subject_template}
                      onChange={(e) => setTemplateForm({...templateForm, subject_template: e.target.value})}
                      placeholder="e.g., {{FirstName}}, your tax filing is due in {{DaysLeft}} days"
                    />
                  </div>
                )}

                <div>
                  <Label>Body Template</Label>
                  <textarea
                    className="w-full p-3 border rounded-md h-32"
                    value={templateForm.body_template}
                    onChange={(e) => setTemplateForm({...templateForm, body_template: e.target.value})}
                    placeholder={templateForm.channel === 'email' 
                      ? "Dear {{FirstName}},\n\nThis is a reminder that your tax filing deadline is approaching..."
                      : "Hi {{FirstName}}! Tax filing due in {{DaysLeft}} days. File now to avoid penalties."}
                  />
                </div>

                <div className="text-sm text-gray-600">
                  <strong>Available merge tags:</strong> {'{{'}}FirstName{'}}'}, {'{{'}}Tier{'}}'}, {'{{'}}TrialEnds{'}}'}, {'{{'}}StaffCount{'}}'}, {'{{'}}DaysLeft{'}}'}
                </div>

                <div className="flex space-x-2">
                  <Button onClick={createTemplate}>Create Template</Button>
                  <Button variant="outline" onClick={() => setShowTemplateForm(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4">
            {templates.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="font-medium text-gray-900 mb-2">No Templates Yet</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Create your first email template to get started with messaging campaigns.
                    </p>
                    <Button onClick={() => setShowTemplateForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      {getChannelIcon(template.channel)}
                      <span className="ml-2">{template.name}</span>
                    </CardTitle>
                    <Badge variant={template.channel === 'email' ? 'default' : template.channel === 'sms' ? 'secondary' : 'outline'}>
                      {template.channel.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {template.subject_template && (
                    <div className="mb-2">
                      <strong>Subject:</strong> {template.subject_template}
                    </div>
                  )}
                  <div className="text-sm text-gray-600 line-clamp-2">
                    {template.body_template}
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-xs text-gray-500">
                      Created {new Date(template.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => quickSendTemplate(template)}
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Quick Send
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Message Campaigns</h2>
            <Button onClick={() => setShowCampaignForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </div>

          {showCampaignForm && (
            <Card>
              <CardHeader>
                <CardTitle>Create New Campaign</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Campaign Name</Label>
                    <Input
                      value={campaignForm.campaign_name}
                      onChange={(e) => setCampaignForm({...campaignForm, campaign_name: e.target.value})}
                      placeholder="e.g., January Tax Filing Reminder"
                    />
                  </div>
                  <div>
                    <Label>Channel</Label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={campaignForm.channel}
                      onChange={(e) => setCampaignForm({...campaignForm, channel: e.target.value})}
                    >
                      <option value="email">Email</option>
                      <option value="sms">SMS</option>
                      <option value="in_app">In-App</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Template (Optional)</Label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={campaignForm.template_id}
                      onChange={(e) => setCampaignForm({...campaignForm, template_id: e.target.value})}
                    >
                      <option value="">Select a template...</option>
                      {templates.filter(t => t.channel === campaignForm.channel).map(template => (
                        <option key={template.id} value={template.id}>{template.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Target Segment</Label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={campaignForm.segment_id}
                      onChange={(e) => setCampaignForm({...campaignForm, segment_id: e.target.value})}
                    >
                      <option value="">Select a segment...</option>
                      {segments.map(segment => (
                        <option key={segment.id} value={segment.id}>
                          {segment.name} ({segment.estimated_count} users)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {campaignForm.channel === 'email' && (
                  <div>
                    <Label>Subject</Label>
                    <Input
                      value={campaignForm.subject_template}
                      onChange={(e) => setCampaignForm({...campaignForm, subject_template: e.target.value})}
                      placeholder="Email subject line"
                    />
                  </div>
                )}

                <div>
                  <Label>Message Body</Label>
                  <textarea
                    className="w-full p-3 border rounded-md h-32"
                    value={campaignForm.body_template}
                    onChange={(e) => setCampaignForm({...campaignForm, body_template: e.target.value})}
                    placeholder="Your message content..."
                  />
                </div>

                <div>
                  <Label>Schedule (Optional)</Label>
                  <Input
                    type="datetime-local"
                    value={campaignForm.scheduled_at}
                    onChange={(e) => setCampaignForm({...campaignForm, scheduled_at: e.target.value})}
                  />
                </div>

                <div className="flex space-x-2">
                  <Button onClick={createCampaign}>Create Campaign</Button>
                  <Button variant="outline" onClick={() => setShowCampaignForm(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4">
            {campaigns.map((campaign) => (
              <Card key={campaign.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      {getChannelIcon(campaign.channel)}
                      <span className="ml-2">{campaign.campaign_name}</span>
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(campaign.status)}
                      <Badge variant="outline">
                        {campaign.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Channel:</strong> {campaign.channel.toUpperCase()}
                      </div>
                      <div>
                        <strong>Created:</strong> {new Date(campaign.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    
                    {campaign.sent_count > 0 && (
                      <div className="grid grid-cols-3 gap-4 text-sm mt-4 p-3 bg-gray-50 rounded">
                        <div>
                          <strong>Sent:</strong> {campaign.sent_count}
                        </div>
                        <div>
                          <strong>Delivered:</strong> {campaign.delivered_count}
                        </div>
                        <div>
                          <strong>Opened:</strong> {campaign.opened_count}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2 mt-4">
                    {campaign.status === 'draft' && (
                      <Button size="sm" onClick={() => sendCampaign(campaign.id)}>
                        <Send className="h-4 w-4 mr-1" />
                        Send Now
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <BarChart3 className="h-4 w-4 mr-1" />
                      Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Segments Tab */}
        <TabsContent value="segments" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">User Segments</h2>
            <Button onClick={() => setShowSegmentForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Segment
            </Button>
          </div>

          {showSegmentForm && (
            <Card>
              <CardHeader>
                <CardTitle>Create New Segment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Segment Name</Label>
                  <Input
                    value={segmentForm.name}
                    onChange={(e) => setSegmentForm({...segmentForm, name: e.target.value})}
                    placeholder="e.g., Premium Users - Active Trial"
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Input
                    value={segmentForm.description}
                    onChange={(e) => setSegmentForm({...segmentForm, description: e.target.value})}
                    placeholder="Brief description of this segment"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>User Tiers</Label>
                    <div className="space-y-2 mt-2">
                      {['free', 'pro', 'premium', 'enterprise'].map(tier => (
                        <label key={tier} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={segmentForm.filters_json.tier.includes(tier)}
                            onChange={(e) => {
                              const tiers = segmentForm.filters_json.tier;
                              if (e.target.checked) {
                                setSegmentForm({
                                  ...segmentForm,
                                  filters_json: {
                                    ...segmentForm.filters_json,
                                    tier: [...tiers, tier]
                                  }
                                });
                              } else {
                                setSegmentForm({
                                  ...segmentForm,
                                  filters_json: {
                                    ...segmentForm.filters_json,
                                    tier: tiers.filter(t => t !== tier)
                                  }
                                });
                              }
                            }}
                          />
                          <span className="capitalize">{tier}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Last Active (Days)</Label>
                    <Input
                      type="number"
                      value={segmentForm.filters_json.last_active_days}
                      onChange={(e) => setSegmentForm({
                        ...segmentForm,
                        filters_json: {
                          ...segmentForm.filters_json,
                          last_active_days: parseInt(e.target.value)
                        }
                      })}
                      placeholder="30"
                    />
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button onClick={createSegment}>Create Segment</Button>
                  <Button variant="outline" onClick={() => setShowSegmentForm(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4">
            {segments.map((segment) => (
              <Card key={segment.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Target className="h-5 w-5 mr-2 text-blue-600" />
                      {segment.name}
                    </CardTitle>
                    <Badge variant="outline">
                      {segment.estimated_count} users
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{segment.description}</p>
                  <div className="text-xs text-gray-500">
                    Created {new Date(segment.created_at).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Sent Emails Tab */}
        <TabsContent value="sent-emails" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Sent Emails Log</h2>
            <Button onClick={fetchData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-blue-600" />
                Email History & Status
              </CardTitle>
              <CardDescription>
                View all emails sent from the admin dashboard with delivery status and details
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sentEmails.length === 0 ? (
                <div className="text-center py-8">
                  <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="font-medium text-gray-900 mb-2">No Emails Sent Yet</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Emails sent from the Compose & Send tab will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sentEmails.map((email) => (
                    <div key={email.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${
                            email.status === 'sent' ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            {email.status === 'sent' ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{email.subject}</div>
                            <div className="text-sm text-gray-600">To: {email.recipient}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={`${
                            email.status === 'sent' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {email.status.toUpperCase()}
                          </Badge>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(email.sent_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-700 mb-2 line-clamp-2">
                        {email.message}
                      </div>
                      
                      {email.error_message && (
                        <Alert className="mt-3">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription className="text-sm">
                            <strong>Error:</strong> {email.error_message}
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      <div className="flex items-center justify-between mt-3 pt-3 border-t">
                        <div className="text-xs text-gray-500">
                          Priority: <span className="capitalize">{email.priority}</span>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3 mr-1" />
                            View Full
                          </Button>
                          {email.status === 'failed' && (
                            <Button size="sm" variant="outline">
                              <Send className="h-3 w-3 mr-1" />
                              Retry
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Compliance Management</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Compliance Reminder
            </Button>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Compliance reminders are automatically sent to Premium and Enterprise users based on Nigerian tax laws and filing deadlines.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4">
            {/* Mock compliance reminders */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-red-600" />
                    Corporate Income Tax Filing
                  </CardTitle>
                  <Badge className="bg-red-100 text-red-800">Due Jan 31</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Annual CIT filing deadline for companies. Reminders sent 7, 3, and 1 days before due date.
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    Applies to: Premium, Enterprise • Active
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">Edit</Button>
                    <Button size="sm" variant="outline">View History</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-orange-600" />
                    VAT Return Filing
                  </CardTitle>
                  <Badge className="bg-orange-100 text-orange-800">Monthly</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Monthly VAT return filing deadline (21st of following month). SMS and email reminders.
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    Applies to: Premium, Enterprise • Active
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">Edit</Button>
                    <Button size="sm" variant="outline">View History</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-yellow-600" />
                    PAYE Remittance
                  </CardTitle>
                  <Badge className="bg-yellow-100 text-yellow-800">Monthly</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Monthly PAYE tax remittance deadline (10th of following month). Includes penalty warnings.
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    Applies to: Premium, Enterprise • Active
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">Edit</Button>
                    <Button size="sm" variant="outline">View History</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MessagingDashboard;