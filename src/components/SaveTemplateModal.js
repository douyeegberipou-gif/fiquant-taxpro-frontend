import React, { useState } from 'react';
import { X, Save, FileText, Repeat } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

const SaveTemplateModal = ({ 
  isOpen, 
  onClose, 
  onSave,
  calculationType,
  isLoading = false
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  const handleSave = () => {
    if (!name.trim()) {
      alert('Please enter a template name');
      return;
    }
    onSave({
      name: name.trim(),
      description: description.trim() || null
    });
  };
  
  if (!isOpen) return null;
  
  const getCalculationTypeLabel = (type) => {
    const labels = {
      paye: 'PAYE',
      cit: 'Companies Income Tax',
      vat: 'VAT',
      cgt: 'Capital Gains Tax'
    };
    return labels[type] || type?.toUpperCase();
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-md rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(30, 41, 59, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors z-10"
        >
          <X className="h-5 w-5 text-gray-400" />
        </button>
        
        {/* Content */}
        <div className="p-6 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <img 
              src="/fiquant-logo-bold-diamond.png" 
              alt="Fiquant" 
              className="h-14 w-14 object-contain"
            />
          </div>
          
          {/* Brand */}
          <p className="text-white font-semibold mb-3">Fiquant TaxPro</p>
          
          {/* Title */}
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
            <Repeat className="h-6 w-6" />
            Save as Template
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            {getCalculationTypeLabel(calculationType)} Calculation Template
          </p>
          
          {/* Info box */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-6 text-left">
            <FileText className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-100">
              Templates save your input values so you can quickly re-run calculations for recurring scenarios like monthly payroll.
            </p>
          </div>
          
          {/* Form */}
          <div className="space-y-4 text-left mb-6">
            {/* Name input */}
            <div>
              <Label className="text-gray-300 text-sm mb-2 block">Template Name *</Label>
              <Input
                type="text"
                placeholder="E.g., Monthly Payroll - John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-amber-500"
                maxLength={100}
              />
            </div>
            
            {/* Description input */}
            <div>
              <Label className="text-gray-300 text-sm mb-2 block">Description (optional)</Label>
              <Input
                type="text"
                placeholder="E.g., Senior Developer, Lagos office"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-amber-500"
                maxLength={500}
              />
            </div>
          </div>
          
          {/* Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleSave}
              disabled={isLoading || !name.trim()}
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg"
            >
              {isLoading ? (
                <>⏳ Saving...</>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Template
                </>
              )}
            </Button>
            
            <Button
              onClick={onClose}
              variant="ghost"
              className="w-full py-3 text-gray-400 hover:text-white hover:bg-white/5"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaveTemplateModal;
