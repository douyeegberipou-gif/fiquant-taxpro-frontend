import React, { useState } from 'react';
import axios from 'axios';
import { FileText, Repeat, HelpCircle, Download, Save, ChevronUp, ChevronDown, Lock, Crown, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useFeatureGate } from '../../contexts/FeatureGateContext';
import { generatePayeReport, generateCITReport } from '../../utils/pdfGenerator';
import UserGuideModal from '../UserGuideModal';
import SaveTemplateModal from '../SaveTemplateModal';
import TemplatesModal from '../TemplatesModal';
import TemplateGateModal from '../TemplateGateModal';
import FeatureGateModal from '../FeatureGateModal';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = BACKEND_URL ? `${BACKEND_URL}/api` : null;

/**
 * MobileActionPanel - Reusable action panel for mobile calculators
 * Provides: PDF Export, Save Template, Load Template, User Guide
 */
const MobileActionPanel = ({ 
  calculatorType, // 'paye', 'cit', 'vat', 'cgt'
  inputData,
  resultData,
  onLoadTemplate, // Callback when a template is loaded
  onShowUpgradeModal
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showUserGuide, setShowUserGuide] = useState(false);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showTemplateGate, setShowTemplateGate] = useState(false);
  const [showPdfGate, setShowPdfGate] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  
  const { isAuthenticated } = useAuth();
  const { hasFeature, getUserTier } = useFeatureGate();
  
  const userTier = getUserTier ? getUserTier() : 'free';
  const isPaidUser = userTier === 'pro' || userTier === 'premium' || userTier === 'enterprise' || userTier === 'starter';
  const canExportPdf = hasFeature ? hasFeature('pdf_export') : isPaidUser;
  const canUseTemplates = hasFeature ? hasFeature('templates') : isPaidUser;
  
  const glassStyle = {
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  };

  // Get calculator type label for display
  const getTypeLabel = () => {
    const labels = {
      paye: 'PAYE',
      cit: 'CIT',
      vat: 'VAT',
      cgt: 'CGT'
    };
    return labels[calculatorType] || calculatorType?.toUpperCase();
  };

  // Get guide type for UserGuideModal
  const getGuideType = () => {
    const types = {
      paye: 'PAYE',
      cit: 'CIT',
      vat: 'VAT',
      cgt: 'CGT'
    };
    return types[calculatorType] || 'PAYE';
  };

  // Handle PDF Export
  const handlePdfExport = () => {
    if (!canExportPdf) {
      setShowPdfGate(true);
      return;
    }
    
    if (!resultData) {
      alert('Please calculate first before exporting PDF');
      return;
    }
    
    setIsPdfGenerating(true);
    try {
      if (calculatorType === 'paye') {
        generatePayeReport(inputData, resultData);
      } else if (calculatorType === 'cit') {
        generateCITReport(inputData, resultData);
      } else {
        // For VAT and CGT, we'll use a simple PDF generation
        generateSimplePdf(calculatorType, inputData, resultData);
      }
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsPdfGenerating(false);
    }
  };

  // Simple PDF generator for VAT and CGT
  const generateSimplePdf = (type, input, result) => {
    // Use jsPDF directly for simple reports
    import('jspdf').then(({ jsPDF }) => {
      const doc = new jsPDF();
      const title = `${type.toUpperCase()} Tax Calculation Report`;
      
      // Header
      doc.setFillColor(0, 0, 0);
      doc.rect(0, 0, 210, 25, 'F');
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 215, 0);
      doc.text('FIQUANT TAXPRO', 15, 12);
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text(`${type.toUpperCase()} Calculator Report`, 15, 20);
      
      // Title
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text(title, 15, 35);
      
      // Date
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated: ${new Date().toLocaleString('en-NG')}`, 15, 42);
      
      // Results
      let y = 55;
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('Calculation Results:', 15, y);
      y += 10;
      
      doc.setFontSize(10);
      Object.entries(result).forEach(([key, value]) => {
        if (typeof value !== 'object' && key !== 'timestamp' && key !== 'transaction_breakdown') {
          const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          const displayValue = typeof value === 'number' 
            ? `N ${value.toLocaleString('en-NG', { minimumFractionDigits: 2 })}` 
            : String(value);
          doc.text(`${label}: ${displayValue}`, 20, y);
          y += 7;
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
        }
      });
      
      // Footer
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      doc.text('This report is generated by Fiquant TaxPro - NTA 2025 Compliant', 15, 285);
      
      doc.save(`${type}_calculation_${new Date().toISOString().split('T')[0]}.pdf`);
    });
  };

  // Handle Save Template
  const handleOpenSaveTemplate = () => {
    if (!isAuthenticated || !isAuthenticated()) {
      alert('Please log in to save templates');
      return;
    }
    
    if (!canUseTemplates) {
      setShowTemplateGate(true);
      return;
    }
    
    setShowSaveTemplate(true);
  };

  // Handle template save
  const handleSaveTemplate = async ({ name, description }) => {
    setIsSavingTemplate(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/templates`, {
        name,
        description,
        calculation_type: calculatorType,
        input_data: inputData
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Template saved successfully!');
      setShowSaveTemplate(false);
    } catch (error) {
      console.error('Error saving template:', error);
      alert(error.response?.data?.detail || 'Failed to save template');
    } finally {
      setIsSavingTemplate(false);
    }
  };

  // Handle Load Templates
  const handleOpenTemplates = () => {
    if (!isAuthenticated || !isAuthenticated()) {
      alert('Please log in to use templates');
      return;
    }
    
    if (!canUseTemplates) {
      setShowTemplateGate(true);
      return;
    }
    
    setShowTemplates(true);
  };

  // Handle template selection
  const handleSelectTemplate = (template) => {
    if (onLoadTemplate && template.input_data) {
      onLoadTemplate(template.input_data);
      alert(`Template "${template.name}" loaded! Review the fields and click Calculate.`);
    }
    setShowTemplates(false);
  };

  return (
    <>
      {/* Collapsible Action Panel */}
      <div className="rounded-xl overflow-hidden" style={glassStyle}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-4 flex items-center justify-between bg-gradient-to-r from-blue-500/20 to-blue-600/10"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/30 flex items-center justify-center">
              <FileText className="h-4 w-4 text-blue-400" />
            </div>
            <span className="font-semibold text-white">Actions & Tools</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </button>
        
        {isExpanded && (
          <div className="p-4 space-y-3">
            {/* PDF Export */}
            <ActionButton
              icon={Download}
              label="Export PDF"
              description="Download calculation report"
              onClick={handlePdfExport}
              isLoading={isPdfGenerating}
              isPremium={!canExportPdf}
              disabled={!resultData}
              color="green"
            />
            
            {/* Save Template */}
            <ActionButton
              icon={Save}
              label="Save as Template"
              description="Save inputs for reuse"
              onClick={handleOpenSaveTemplate}
              isPremium={!canUseTemplates}
              color="amber"
            />
            
            {/* Load Templates */}
            <ActionButton
              icon={Repeat}
              label="Load Template"
              description="Use a saved template"
              onClick={handleOpenTemplates}
              isPremium={!canUseTemplates}
              color="purple"
            />
            
            {/* User Guide */}
            <ActionButton
              icon={HelpCircle}
              label="User Guide"
              description={`How to use ${getTypeLabel()} calculator`}
              onClick={() => setShowUserGuide(true)}
              color="blue"
            />
            
            {/* Upgrade prompt for free users */}
            {!isPaidUser && (
              <div className="mt-3 p-3 rounded-lg" style={{ background: 'rgba(234, 179, 8, 0.15)', border: '1px solid rgba(234, 179, 8, 0.3)' }}>
                <p className="text-xs text-amber-300 mb-2">
                  <Crown className="h-3 w-3 inline mr-1" />
                  Upgrade to unlock PDF exports and templates
                </p>
                <button
                  onClick={onShowUpgradeModal}
                  className="w-full py-2 px-3 rounded-lg text-xs font-medium text-black"
                  style={{ background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)' }}
                >
                  View Plans
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Modals */}
      <UserGuideModal
        isOpen={showUserGuide}
        onClose={() => setShowUserGuide(false)}
        calculatorType={getGuideType()}
      />
      
      <SaveTemplateModal
        isOpen={showSaveTemplate}
        onClose={() => setShowSaveTemplate(false)}
        onSave={handleSaveTemplate}
        calculationType={calculatorType}
        isLoading={isSavingTemplate}
      />
      
      <TemplatesModal
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelectTemplate={handleSelectTemplate}
        calculationType={calculatorType}
        hasAccess={canUseTemplates}
        onUpgrade={onShowUpgradeModal}
      />
      
      <TemplateGateModal
        isOpen={showTemplateGate}
        onClose={() => setShowTemplateGate(false)}
        onUpgrade={onShowUpgradeModal}
      />
      
      <FeatureGateModal
        isOpen={showPdfGate}
        onClose={() => setShowPdfGate(false)}
        feature="pdf_export"
        onUpgrade={onShowUpgradeModal}
      />
    </>
  );
};

// Action Button Component
const ActionButton = ({ icon: Icon, label, description, onClick, isLoading, isPremium, disabled, color = 'white' }) => {
  const colors = {
    green: { bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.3)', icon: 'text-green-400' },
    amber: { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)', icon: 'text-amber-400' },
    purple: { bg: 'rgba(139, 92, 246, 0.15)', border: 'rgba(139, 92, 246, 0.3)', icon: 'text-purple-400' },
    blue: { bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.3)', icon: 'text-blue-400' },
    white: { bg: 'rgba(255, 255, 255, 0.05)', border: 'rgba(255, 255, 255, 0.1)', icon: 'text-gray-400' }
  };
  
  const colorStyle = colors[color] || colors.white;
  
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`w-full p-3 rounded-lg flex items-center justify-between transition-all active:scale-[0.98] ${disabled ? 'opacity-50' : ''}`}
      style={{ background: colorStyle.bg, border: `1px solid ${colorStyle.border}` }}
    >
      <div className="flex items-center space-x-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colorStyle.icon}`} style={{ background: colorStyle.bg }}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Icon className="h-4 w-4" />
          )}
        </div>
        <div className="text-left">
          <p className="text-sm font-medium text-white">{label}</p>
          <p className="text-xs text-gray-400">{description}</p>
        </div>
      </div>
      {isPremium && (
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/20">
          <Lock className="h-3 w-3 text-amber-400" />
          <span className="text-xs text-amber-400">Pro</span>
        </div>
      )}
    </button>
  );
};

export default MobileActionPanel;
