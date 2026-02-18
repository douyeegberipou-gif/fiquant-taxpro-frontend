import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Repeat, FileText, Trash2, Clock, Calendar, ChevronRight, Loader2, Lock, Users, Building2, Receipt, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

const API = process.env.REACT_APP_BACKEND_URL;

const TemplatesModal = ({ 
  isOpen, 
  onClose, 
  onSelectTemplate,
  calculationType,
  hasAccess = false,
  onUpgrade
}) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [accessInfo, setAccessInfo] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  
  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen, calculationType]);
  
  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setTemplates([]);
        setAccessInfo({ has_access: false });
        return;
      }
      
      const response = await axios.get(
        `${API}/api/templates${calculationType ? `?calculation_type=${calculationType}` : ''}`, 
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setTemplates(response.data.templates || []);
      setAccessInfo({
        has_access: response.data.has_access,
        total: response.data.total,
        limit: response.data.limit
      });
    } catch (error) {
      console.error('Error fetching templates:', error);
      if (error.response?.status === 403) {
        setAccessInfo({ has_access: false });
      }
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (templateId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this template?')) return;
    
    setDeletingId(templateId);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/api/templates/${templateId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Failed to delete template');
    } finally {
      setDeletingId(null);
    }
  };
  
  const handleSelect = async (template) => {
    try {
      const token = localStorage.getItem('token');
      // Fetch full template data (this also updates use_count)
      const response = await axios.get(`${API}/api/templates/${template.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onSelectTemplate(response.data);
      onClose();
    } catch (error) {
      console.error('Error loading template:', error);
      // Fallback to using cached data
      onSelectTemplate(template);
      onClose();
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const getCalcTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'paye': return <Users className="h-4 w-4 text-emerald-600" />;
      case 'cit': return <Building2 className="h-4 w-4 text-blue-600" />;
      case 'vat': return <Receipt className="h-4 w-4 text-purple-600" />;
      case 'cgt': return <TrendingUp className="h-4 w-4 text-orange-600" />;
      default: return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };
  
  const getCalcTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'paye': return 'bg-emerald-100';
      case 'cit': return 'bg-blue-100';
      case 'vat': return 'bg-purple-100';
      case 'cgt': return 'bg-orange-100';
      default: return 'bg-gray-100';
    }
  };
  
  const getCalcTypeBadgeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'paye': return 'bg-emerald-100 text-emerald-700';
      case 'cit': return 'bg-blue-100 text-blue-700';
      case 'vat': return 'bg-purple-100 text-purple-700';
      case 'cgt': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-lg rounded-2xl overflow-hidden max-h-[80vh] flex flex-col"
        style={{
          background: 'rgba(30, 41, 59, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors z-10"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Repeat className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Calculation Templates</h2>
              <p className="text-sm text-gray-400">
                {calculationType 
                  ? `${calculationType.toUpperCase()} templates`
                  : 'All saved templates'
                }
              </p>
            </div>
          </div>
          
          {accessInfo?.has_access && (
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
              <span>Templates: {accessInfo.total || 0} of {accessInfo.limit === 999999 ? '∞' : accessInfo.limit}</span>
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 text-amber-400 animate-spin mx-auto mb-3" />
              <p className="text-gray-400">Loading templates...</p>
            </div>
          ) : !accessInfo?.has_access ? (
            /* No Access State */
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="h-8 w-8 text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Premium Feature</h3>
              <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">
                Calculation templates are available for Premium and Enterprise users. Save time with reusable templates for recurring calculations.
              </p>
              <div className="space-y-2 text-left max-w-xs mx-auto mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <Badge className="bg-amber-500/20 text-amber-300 border-0">Premium</Badge>
                  <span className="text-gray-300">20 templates</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Badge className="bg-purple-500/20 text-purple-300 border-0">Enterprise</Badge>
                  <span className="text-gray-300">Unlimited templates</span>
                </div>
              </div>
              <Button
                onClick={onUpgrade}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                Upgrade to Premium
              </Button>
            </div>
          ) : templates.length === 0 ? (
            /* Empty State */
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No Templates Yet</h3>
              <p className="text-gray-400 text-sm max-w-xs mx-auto">
                After completing a calculation, click "Set up as recurrent calculation template" to save it for future use.
              </p>
            </div>
          ) : (
            /* Templates List */
            <div className="space-y-2">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleSelect(template)}
                  className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/50 transition-all text-left group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getCalcTypeColor(template.calculation_type)}`}>
                        {getCalcTypeIcon(template.calculation_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-white truncate">{template.name}</h4>
                          <Badge className={`text-[10px] px-2 py-0.5 border-0 ${getCalcTypeBadgeColor(template.calculation_type)}`}>
                            {template.calculation_type?.toUpperCase()}
                          </Badge>
                        </div>
                        {template.description && (
                          <p className="text-sm text-gray-400 truncate mb-2">{template.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Created {formatDate(template.created_at)}
                          </span>
                          {template.use_count > 0 && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Used {template.use_count}x
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <button
                        onClick={(e) => handleDelete(template.id, e)}
                        disabled={deletingId === template.id}
                        className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                      >
                        {deletingId === template.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                      <ChevronRight className="h-5 w-5 text-gray-500 group-hover:text-amber-400 transition-colors" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full text-gray-400 hover:text-white hover:bg-white/5"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TemplatesModal;
