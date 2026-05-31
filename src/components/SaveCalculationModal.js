import React, { useState, useEffect } from 'react';
import { X, Save, Tag, Info, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

const SaveCalculationModal = ({ 
  isOpen, 
  onClose, 
  onSave,
  calculationType,
  savesUsed = 0,
  savesLimit = 5,
  isLoading = false
}) => {
  const [name, setName] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [includeInAnalytics, setIncludeInAnalytics] = useState(true);
  
  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName('');
      setTagInput('');
      setTags([]);
      setIncludeInAnalytics(true);
    }
  }, [isOpen]);
  
  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };
  
  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const handleSave = () => {
    onSave({
      name: name.trim() || null,
      tags,
      includeInAnalytics
    });
  };
  
  if (!isOpen) return null;
  
  const getCalculationTypeLabel = (type) => {
    const labels = {
      paye: 'PAYE',
      cit: 'Companies Income Tax',
      vat: 'VAT',
      cgt: 'Capital Gains Tax',
      bulk_paye: 'Bulk PAYE'
    };
    return labels[type] || type.toUpperCase();
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-md rounded-2xl"
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
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-white/10 transition-colors z-10"
        >
          <X className="h-5 w-5 text-gray-400" />
        </button>
        
        {/* Content */}
        <div className="p-5 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-3">
            <img 
              src="/fiquant-logo-bold-diamond.png" 
              alt="Fiquant" 
              className="h-10 w-10 object-contain"
            />
          </div>
          
          {/* Brand */}
          <p className="text-white font-semibold text-sm mb-2">Fiquant TaxPro</p>
          
          {/* Title */}
          <h2 className="text-xl font-bold text-white mb-1 flex items-center justify-center gap-2">
            <Save className="h-5 w-5" />
            Save This Calculation
          </h2>
          <p className="text-gray-400 text-xs mb-4">
            {getCalculationTypeLabel(calculationType)} Calculation
          </p>
          
          {/* Save counter */}
          <div className="flex items-center justify-center gap-2 mb-4 text-xs">
            <span className="text-gray-400">Saves used:</span>
            <span className="text-white font-semibold">{savesUsed} of {savesLimit}</span>
            {savesUsed >= savesLimit * 0.8 && (
              <a href="#pricing" className="text-amber-400 hover:text-amber-300 ml-2">
                Upgrade →
              </a>
            )}
          </div>
          
          {/* Form */}
          <div className="space-y-3 text-left mb-4">
            {/* Name input */}
            <div>
              <Label className="text-gray-300 text-xs mb-1.5 block">Name (optional)</Label>
              <Input
                type="text"
                placeholder="E.g., January 2026 Tax Return"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-teal-500 h-9 text-sm"
              />
            </div>
            
            {/* Tags */}
            <div>
              <Label className="text-gray-300 text-xs mb-1.5 block">Tags (press Enter to add)</Label>
              <div className="flex flex-wrap gap-1.5 mb-1.5">
                {tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-teal-500/20 text-teal-300 border border-teal-500/30"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                    <button onClick={() => removeTag(tag)} className="ml-1 hover:text-white">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <Input
                type="text"
                placeholder="Add tags..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-teal-500 h-9 text-sm"
              />
            </div>
            
            {/* Analytics opt-in */}
            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <input
                type="checkbox"
                id="analytics-opt-in"
                checked={includeInAnalytics}
                onChange={(e) => setIncludeInAnalytics(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-600 bg-gray-700 text-teal-500 focus:ring-teal-500"
              />
              <div>
                <label htmlFor="analytics-opt-in" className="text-xs text-white cursor-pointer">
                  Include in analytics
                </label>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  <Info className="inline h-3 w-3 mr-1" />
                  Used to generate personalized tax insights
                </p>
              </div>
            </div>
          </div>
          
          {/* Buttons */}
          <div className="space-y-2">
            <Button
              onClick={handleSave}
              disabled={isLoading || savesUsed >= savesLimit}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm"
            >
              {isLoading ? (
                <>⏳ Saving...</>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Calculation
                </>
              )}
            </Button>
            
            <Button
              onClick={onClose}
              variant="ghost"
              className="w-full py-2.5 text-gray-400 hover:text-white hover:bg-white/5 text-sm"
            >
              Cancel
            </Button>
          </div>
          
          {savesUsed >= savesLimit && (
            <p className="text-[10px] text-amber-400 mt-2">
              You've reached your save limit. Upgrade to save more.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SaveCalculationModal;
