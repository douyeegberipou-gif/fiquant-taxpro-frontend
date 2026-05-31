import React, { useState } from 'react';
import { X, Send, MessageSquare, Mail, Phone, User, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const ContactUsModal = ({ isOpen, onClose, user = null }) => {
  const [formData, setFormData] = useState({
    sender_name: user?.full_name || '',
    sender_email: user?.email || '',
    sender_phone: '',
    subject: '',
    message: '',
    category: 'general'
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'support', label: 'Technical Support' },
    { value: 'billing', label: 'Billing & Payments' },
    { value: 'bug_report', label: 'Report a Bug' },
    { value: 'feature_request', label: 'Feature Request' },
    { value: 'partnership', label: 'Partnership / Business' },
    { value: 'other', label: 'Other' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.sender_name.trim()) return 'Please enter your name';
    if (!formData.sender_email.trim()) return 'Please enter your email';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.sender_email)) return 'Please enter a valid email';
    if (!formData.subject.trim()) return 'Please enter a subject';
    if (!formData.message.trim()) return 'Please enter your message';
    if (formData.message.length < 10) return 'Message must be at least 10 characters';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/api/contact/submit`, {
        method: 'POST',
        headers,
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
      } else {
        setError(data.error || 'Failed to send message. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      sender_name: user?.full_name || '',
      sender_email: user?.email || '',
      sender_phone: '',
      subject: '',
      message: '',
      category: 'general'
    });
    setSubmitted(false);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleClose}
    >
      <div 
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        data-testid="contact-modal"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            data-testid="contact-close-btn"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Contact Us</h2>
              <p className="text-blue-100 text-sm">We'd love to hear from you</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {submitted ? (
            // Success State
            <div className="text-center py-8" data-testid="contact-success">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Message Sent!</h3>
              <p className="text-gray-600 mb-6">
                Thank you for reaching out. We'll get back to you as soon as possible.
              </p>
              <Button onClick={handleClose} className="bg-blue-600 hover:bg-blue-700">
                Close
              </Button>
            </div>
          ) : (
            // Form
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <Label htmlFor="sender_name" className="text-gray-700">
                    <User className="h-3 w-3 inline mr-1" />
                    Your Name *
                  </Label>
                  <Input
                    id="sender_name"
                    name="sender_name"
                    value={formData.sender_name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="mt-1"
                    data-testid="contact-name-input"
                  />
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="sender_email" className="text-gray-700">
                    <Mail className="h-3 w-3 inline mr-1" />
                    Email Address *
                  </Label>
                  <Input
                    id="sender_email"
                    name="sender_email"
                    type="email"
                    value={formData.sender_email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className="mt-1"
                    data-testid="contact-email-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Phone (Optional) */}
                <div>
                  <Label htmlFor="sender_phone" className="text-gray-700">
                    <Phone className="h-3 w-3 inline mr-1" />
                    Phone (Optional)
                  </Label>
                  <Input
                    id="sender_phone"
                    name="sender_phone"
                    value={formData.sender_phone}
                    onChange={handleChange}
                    placeholder="+234 xxx xxx xxxx"
                    className="mt-1"
                  />
                </div>

                {/* Category */}
                <div>
                  <Label htmlFor="category" className="text-gray-700">
                    Category
                  </Label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="mt-1 w-full h-10 px-3 rounded-md border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subject */}
              <div>
                <Label htmlFor="subject" className="text-gray-700">
                  Subject *
                </Label>
                <Input
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="How can we help you?"
                  className="mt-1"
                  data-testid="contact-subject-input"
                />
              </div>

              {/* Message */}
              <div>
                <Label htmlFor="message" className="text-gray-700">
                  Message *
                </Label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Please describe your question or concern in detail..."
                  rows={4}
                  className="mt-1 w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  data-testid="contact-message-input"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.message.length} / 2000 characters
                </p>
              </div>

              {/* Submit */}
              <div className="flex justify-end space-x-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                  data-testid="contact-submit-btn"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs text-gray-500 text-center pt-2">
                By sending this message, you agree to our Privacy Policy and Terms of Service.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactUsModal;
