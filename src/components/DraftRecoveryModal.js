import React, { useState } from 'react';
import { FileText, Clock, Check, X, Trash2 } from 'lucide-react';
import { useDrafts } from '../contexts/DraftContext';

const DraftRecoveryModal = () => {
  const { 
    showRecoveryModal, 
    pendingDrafts, 
    restoreDrafts, 
    discardDrafts,
    setShowRecoveryModal 
  } = useDrafts() || {};
  
  const [selectedDrafts, setSelectedDrafts] = useState([]);

  if (!showRecoveryModal || !pendingDrafts || pendingDrafts.length === 0) {
    return null;
  }

  // Initialize selected drafts
  React.useEffect(() => {
    setSelectedDrafts(pendingDrafts.map(d => d.draft_type));
  }, [pendingDrafts]);

  const toggleDraft = (draftType) => {
    setSelectedDrafts(prev => 
      prev.includes(draftType)
        ? prev.filter(t => t !== draftType)
        : [...prev, draftType]
    );
  };

  const handleRestore = () => {
    const draftsToRestore = pendingDrafts.filter(d => 
      selectedDrafts.includes(d.draft_type)
    );
    restoreDrafts(draftsToRestore);
    
    // Navigate to the first restored draft's page
    if (draftsToRestore.length > 0 && draftsToRestore[0].page_path) {
      // Use router or window.location based on your setup
      window.location.href = draftsToRestore[0].page_path;
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  };

  const getDraftTitle = (draft) => {
    const titles = {
      calculator_form: 'PAYE Calculator',
      bulk_paye: `Bulk PAYE (${draft.form_data?.employees?.length || 0} employees)`,
      cgt_form: 'CGT Calculator',
      cit_form: 'CIT Calculator',
      vat_form: 'VAT Calculator',
      report_config: 'Report Configuration'
    };
    return titles[draft.draft_type] || draft.draft_type;
  };

  const getDraftPreview = (draft) => {
    const data = draft.form_data || {};
    
    switch (draft.draft_type) {
      case 'calculator_form':
        return data.annual_salary 
          ? `Salary: ₦${Number(data.annual_salary).toLocaleString()}`
          : 'Incomplete form';
      case 'bulk_paye':
        return `${data.employees?.length || 0} employees entered`;
      case 'cgt_form':
        return data.disposal_value
          ? `Disposal: ₦${Number(data.disposal_value).toLocaleString()}`
          : 'Incomplete form';
      case 'cit_form':
        return data.taxable_profit
          ? `Profit: ₦${Number(data.taxable_profit).toLocaleString()}`
          : 'Incomplete form';
      case 'vat_form':
        return data.amount
          ? `Amount: ₦${Number(data.amount).toLocaleString()}`
          : 'Incomplete form';
      default:
        return 'Draft data available';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-[9998]" />
      
      {/* Modal */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 text-white">
            <div className="flex items-center gap-2">
              <FileText className="w-6 h-6" />
              <h2 className="text-xl font-bold">
                {pendingDrafts.length === 1 
                  ? 'Resume Your Last Session?' 
                  : 'Resume Your Work?'}
              </h2>
            </div>
          </div>
          
          {/* Content */}
          <div className="px-6 py-5">
            <p className="text-gray-600 mb-4">
              {pendingDrafts.length === 1
                ? 'We found unsaved work from your previous session:'
                : `You have ${pendingDrafts.length} unsaved sessions:`}
            </p>
            
            {/* Draft List */}
            <div className="space-y-3 mb-5 max-h-64 overflow-y-auto">
              {pendingDrafts.map((draft) => (
                <div 
                  key={draft.draft_type}
                  onClick={() => toggleDraft(draft.draft_type)}
                  className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer border-2 transition-all ${
                    selectedDrafts.includes(draft.draft_type)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                  }`}
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
                    selectedDrafts.includes(draft.draft_type)
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedDrafts.includes(draft.draft_type) && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800">
                        {getDraftTitle(draft)}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(draft.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate mt-0.5">
                      {getDraftPreview(draft)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Helpful text */}
            <p className="text-sm text-gray-500 mb-5">
              Would you like to restore this work?
            </p>
            
            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleRestore}
                disabled={selectedDrafts.length === 0}
                className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                data-testid="restore-drafts-btn"
              >
                <Check className="w-5 h-5" />
                {selectedDrafts.length === pendingDrafts.length 
                  ? 'Restore Work'
                  : `Restore Selected (${selectedDrafts.length})`}
              </button>
              <button
                onClick={discardDrafts}
                className="flex items-center gap-2 text-gray-500 hover:text-red-500 font-medium py-3 px-4 rounded-xl hover:bg-red-50 transition-colors"
                data-testid="discard-drafts-btn"
              >
                <Trash2 className="w-5 h-5" />
                Discard
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DraftRecoveryModal;
