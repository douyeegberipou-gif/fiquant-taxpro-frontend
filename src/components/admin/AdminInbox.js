import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Inbox, 
  Mail, 
  MailOpen,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  Archive,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  User,
  Phone,
  Tag,
  MessageSquare,
  StickyNote,
  ExternalLink
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const AdminInbox = () => {
  const [messages, setMessages] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messageDetail, setMessageDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [sendEmail, setSendEmail] = useState(true);
  const [markResolved, setMarkResolved] = useState(false);
  const [internalNotes, setInternalNotes] = useState('');
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    fetchMessages();
  }, [statusFilter, categoryFilter, currentPage]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (categoryFilter) params.append('category', categoryFilter);
      params.append('limit', pageSize);
      params.append('skip', currentPage * pageSize);
      
      const response = await axios.get(
        `${API_URL}/api/admin/inbox/messages?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessages(response.data.messages);
      setStatusCounts(response.data.status_counts);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessageDetail = async (messageId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/api/admin/inbox/messages/${messageId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessageDetail(response.data);
      setInternalNotes(response.data.message.internal_notes || '');
      // Refresh list to update status counts
      fetchMessages();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSelectMessage = (msg) => {
    setSelectedMessage(msg);
    setReplyText('');
    setMarkResolved(false);
    fetchMessageDetail(msg.id);
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    
    try {
      setReplyLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.post(
        `${API_URL}/api/admin/inbox/messages/${selectedMessage.id}/reply`,
        {
          reply_text: replyText,
          send_email: sendEmail,
          mark_resolved: markResolved
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setReplyText('');
      fetchMessageDetail(selectedMessage.id);
      fetchMessages();
    } catch (err) {
      setError(err.message);
    } finally {
      setReplyLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/admin/inbox/messages/${selectedMessage.id}/status?status=${newStatus}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchMessageDetail(selectedMessage.id);
      fetchMessages();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSaveNotes = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/admin/inbox/messages/${selectedMessage.id}/notes?notes=${encodeURIComponent(internalNotes)}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      new: 'bg-blue-100 text-blue-800 border-blue-200',
      read: 'bg-gray-100 text-gray-800 border-gray-200',
      in_progress: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      replied: 'bg-green-100 text-green-800 border-green-200',
      resolved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      archived: 'bg-slate-100 text-slate-800 border-slate-200'
    };
    return styles[status] || styles.new;
  };

  const getCategoryBadge = (category) => {
    const styles = {
      general: 'bg-blue-50 text-blue-700',
      support: 'bg-purple-50 text-purple-700',
      billing: 'bg-green-50 text-green-700',
      bug_report: 'bg-red-50 text-red-700',
      feature_request: 'bg-amber-50 text-amber-700',
      partnership: 'bg-indigo-50 text-indigo-700',
      other: 'bg-gray-50 text-gray-700'
    };
    return styles[category] || styles.general;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredMessages = messages.filter(msg => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      msg.sender_name?.toLowerCase().includes(query) ||
      msg.sender_email?.toLowerCase().includes(query) ||
      msg.subject?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card 
          className={`cursor-pointer transition-all ${!statusFilter ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => setStatusFilter('')}
        >
          <CardContent className="p-4 text-center">
            <Inbox className="h-6 w-6 mx-auto mb-2 text-blue-600" />
            <p className="text-2xl font-bold text-gray-900">
              {Object.values(statusCounts).reduce((a, b) => a + b, 0)}
            </p>
            <p className="text-xs text-gray-500">All Messages</p>
          </CardContent>
        </Card>
        
        <Card 
          className={`cursor-pointer transition-all ${statusFilter === 'new' ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => setStatusFilter('new')}
        >
          <CardContent className="p-4 text-center">
            <Mail className="h-6 w-6 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold text-blue-600">{statusCounts.new || 0}</p>
            <p className="text-xs text-gray-500">New</p>
          </CardContent>
        </Card>
        
        <Card 
          className={`cursor-pointer transition-all ${statusFilter === 'read' ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => setStatusFilter('read')}
        >
          <CardContent className="p-4 text-center">
            <MailOpen className="h-6 w-6 mx-auto mb-2 text-gray-500" />
            <p className="text-2xl font-bold text-gray-600">{statusCounts.read || 0}</p>
            <p className="text-xs text-gray-500">Read</p>
          </CardContent>
        </Card>
        
        <Card 
          className={`cursor-pointer transition-all ${statusFilter === 'in_progress' ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => setStatusFilter('in_progress')}
        >
          <CardContent className="p-4 text-center">
            <Clock className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
            <p className="text-2xl font-bold text-yellow-600">{statusCounts.in_progress || 0}</p>
            <p className="text-xs text-gray-500">In Progress</p>
          </CardContent>
        </Card>
        
        <Card 
          className={`cursor-pointer transition-all ${statusFilter === 'replied' ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => setStatusFilter('replied')}
        >
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold text-green-600">{statusCounts.replied || 0}</p>
            <p className="text-xs text-gray-500">Replied</p>
          </CardContent>
        </Card>
        
        <Card 
          className={`cursor-pointer transition-all ${statusFilter === 'resolved' ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => setStatusFilter('resolved')}
        >
          <CardContent className="p-4 text-center">
            <Archive className="h-6 w-6 mx-auto mb-2 text-emerald-500" />
            <p className="text-2xl font-bold text-emerald-600">{statusCounts.resolved || 0}</p>
            <p className="text-xs text-gray-500">Resolved</p>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Message List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center">
                  <Inbox className="h-5 w-5 mr-2 text-blue-600" />
                  Messages
                </CardTitle>
                <Button size="sm" variant="ghost" onClick={fetchMessages}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              {/* Search */}
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="mt-2 w-full h-9 px-3 rounded-md border border-gray-200 bg-white text-sm"
              >
                <option value="">All Categories</option>
                <option value="general">General</option>
                <option value="support">Support</option>
                <option value="billing">Billing</option>
                <option value="bug_report">Bug Report</option>
                <option value="feature_request">Feature Request</option>
                <option value="partnership">Partnership</option>
                <option value="other">Other</option>
              </select>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 text-center">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                  <p className="text-gray-500 mt-2">Loading messages...</p>
                </div>
              ) : filteredMessages.length === 0 ? (
                <div className="p-8 text-center">
                  <Inbox className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">No messages found</p>
                </div>
              ) : (
                <div className="divide-y max-h-[600px] overflow-y-auto">
                  {filteredMessages.map((msg) => (
                    <div
                      key={msg.id}
                      onClick={() => handleSelectMessage(msg)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedMessage?.id === msg.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      } ${msg.status === 'new' ? 'bg-blue-50/50' : ''}`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <span className={`font-medium text-sm ${msg.status === 'new' ? 'text-blue-900' : 'text-gray-900'}`}>
                            {msg.sender_name}
                          </span>
                          {msg.source === 'resend_inbound' && (
                            <Badge className="text-[9px] bg-purple-100 text-purple-700 border-purple-200">
                              <Mail className="h-2 w-2 mr-1" />
                              Email
                            </Badge>
                          )}
                        </div>
                        <Badge className={`text-[10px] ${getStatusBadge(msg.status)}`}>
                          {msg.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium text-gray-800 truncate mb-1">
                        {msg.subject}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {msg.message?.substring(0, 60)}...
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge className={`text-[10px] ${getCategoryBadge(msg.category)}`}>
                          {msg.category}
                        </Badge>
                        <span className="text-[10px] text-gray-400">
                          {formatDate(msg.created_at)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Pagination */}
              <div className="p-3 border-t flex items-center justify-between">
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={currentPage === 0}
                  onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-500">Page {currentPage + 1}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={filteredMessages.length < pageSize}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2">
          {selectedMessage && messageDetail ? (
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{messageDetail.message.subject}</CardTitle>
                    <CardDescription className="flex items-center space-x-4 mt-2">
                      <span className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {messageDetail.message.sender_name}
                      </span>
                      <span className="flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        {messageDetail.message.sender_email}
                      </span>
                      {messageDetail.message.sender_phone && (
                        <span className="flex items-center">
                          <Phone className="h-4 w-4 mr-1" />
                          {messageDetail.message.sender_phone}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getCategoryBadge(messageDetail.message.category)}>
                      <Tag className="h-3 w-3 mr-1" />
                      {messageDetail.message.category}
                    </Badge>
                    <Badge className={getStatusBadge(messageDetail.message.status)}>
                      {messageDetail.message.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6 space-y-6">
                {/* Source Badge */}
                {messageDetail.message.source === 'resend_inbound' && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium text-purple-800">Received via Email</p>
                      <p className="text-xs text-purple-600">
                        This message was sent to your Resend inbound email address
                        {messageDetail.message.original_to && ` (${messageDetail.message.original_to.join(', ')})`}
                      </p>
                    </div>
                  </div>
                )}

                {/* Original Message */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-2">
                    Received: {formatDate(messageDetail.message.created_at)}
                    {messageDetail.message.source === 'contact_form' && ' via Contact Form'}
                    {messageDetail.message.source === 'resend_inbound' && ' via Email'}
                  </p>
                  <p className="text-gray-800 whitespace-pre-wrap">
                    {messageDetail.message.message}
                  </p>
                </div>

                {/* Previous Replies */}
                {messageDetail.replies && messageDetail.replies.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-700 flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Conversation History
                    </h4>
                    {messageDetail.replies.map((reply) => (
                      <div key={reply.id} className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-blue-800">
                            {reply.admin_email}
                          </span>
                          <span className="text-xs text-blue-600">
                            {formatDate(reply.created_at)}
                            {reply.email_sent && (
                              <Badge className="ml-2 bg-green-100 text-green-700 text-[10px]">
                                Email sent
                              </Badge>
                            )}
                          </span>
                        </div>
                        <p className="text-gray-800 whitespace-pre-wrap">{reply.reply_text}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Status Actions */}
                <div className="flex items-center space-x-2 pt-4 border-t">
                  <span className="text-sm text-gray-500">Change Status:</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdateStatus('in_progress')}
                    disabled={messageDetail.message.status === 'in_progress'}
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    In Progress
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdateStatus('resolved')}
                    disabled={messageDetail.message.status === 'resolved'}
                    className="text-green-600 border-green-200 hover:bg-green-50"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Resolve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdateStatus('archived')}
                    className="text-gray-600"
                  >
                    <Archive className="h-3 w-3 mr-1" />
                    Archive
                  </Button>
                </div>

                {/* Internal Notes */}
                <div className="space-y-2">
                  <Label className="flex items-center text-gray-700">
                    <StickyNote className="h-4 w-4 mr-2" />
                    Internal Notes (not visible to customer)
                  </Label>
                  <textarea
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    onBlur={handleSaveNotes}
                    placeholder="Add internal notes about this conversation..."
                    rows={2}
                    className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Reply Form */}
                <div className="space-y-4 pt-4 border-t">
                  <Label className="flex items-center text-gray-700 font-semibold">
                    <Send className="h-4 w-4 mr-2" />
                    Send Reply
                  </Label>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply here..."
                    rows={4}
                    className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={sendEmail}
                          onChange={(e) => setSendEmail(e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <span>Send via email</span>
                      </label>
                      <label className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={markResolved}
                          onChange={(e) => setMarkResolved(e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <span>Mark as resolved</span>
                      </label>
                    </div>
                    <Button
                      onClick={handleSendReply}
                      disabled={!replyText.trim() || replyLoading}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {replyLoading ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Reply
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-[600px] flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Mail className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Select a message</p>
                <p className="text-sm">Choose a message from the list to view details</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminInbox;
