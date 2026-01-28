import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Calculator, BookOpen, Receipt, Building2, TrendingUp, CreditCard, History, FileText, ChevronRight, User, Scale } from 'lucide-react';
import { Input } from './ui/input';

const GlobalSearch = ({ 
  onNavigate, 
  isAuthenticated, 
  hasFeature, 
  history = [], 
  citHistory = [] 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  // Define searchable modules/features
  const modules = [
    { id: 'calculator', name: 'PAYE Calculator', keywords: ['paye', 'salary', 'income tax', 'payroll', 'employee', 'personal income', 'tax calculator', 'calculate'], icon: Calculator, tab: 'calculator', color: 'emerald' },
    { id: 'bulk-paye', name: 'Bulk PAYE Calculator', keywords: ['bulk paye', 'bulk payroll', 'multiple employees', 'payroll batch', 'batch'], icon: Calculator, tab: 'calculator', mode: 'bulk', color: 'blue', tier: 'PRO+', featureKey: 'bulk_paye' },
    { id: 'cit', name: 'CIT Calculator', keywords: ['cit', 'corporate', 'company tax', 'business tax', 'corporate income', 'profit'], icon: Building2, tab: 'cit', color: 'blue', tier: 'PREMIUM+', featureKey: 'cit_calc' },
    { id: 'vat', name: 'VAT Calculator', keywords: ['vat', 'value added', 'sales tax', 'output vat', 'input vat', '7.5'], icon: Receipt, tab: 'vat', color: 'purple', tier: 'PRO+', featureKey: 'vat_calc' },
    { id: 'bulk-vat', name: 'Bulk VAT Calculator', keywords: ['bulk vat', 'multiple vat', 'vat batch', 'vat transactions'], icon: Receipt, tab: 'vat', mode: 'bulk', color: 'purple', tier: 'PRO+', featureKey: 'bulk_vat' },
    { id: 'cgt', name: 'CGT Calculator', keywords: ['cgt', 'capital gains', 'asset sale', 'property sale', 'shares', 'disposal'], icon: Scale, tab: 'cgt', color: 'orange' },
    { id: 'payment', name: 'Vendor Payments', keywords: ['payment', 'vendor', 'wht', 'withholding', 'contractor', 'bulk payment'], icon: CreditCard, tab: 'payment', color: 'indigo' },
    { id: 'tax-library', name: 'Tax Library', keywords: ['tax library', 'tax guide', 'tax information', 'nta 2025', 'tax rates', 'tax brackets', 'reliefs', 'allowances', 'learn', 'help', 'guide'], icon: BookOpen, tab: 'brackets', color: 'teal' },
    { id: 'history', name: 'Calculation History', keywords: ['history', 'past calculations', 'previous', 'saved', 'records'], icon: History, tab: 'history', color: 'gray', requiresAuth: true, tier: 'PRO+', featureKey: 'calculation_history' },
    { id: 'analytics', name: 'Advanced Analytics', keywords: ['analytics', 'dashboard', 'insights', 'reports', 'statistics', 'charts', 'trends'], icon: TrendingUp, tab: 'analytics', color: 'amber', requiresAuth: true, tier: 'PREMIUM+', featureKey: 'advanced_analytics' },
    { id: 'profile', name: 'My Profile', keywords: ['profile', 'account', 'settings', 'subscription', 'user', 'my account'], icon: User, tab: 'profile', color: 'gray', requiresAuth: true },
    { id: 'pricing', name: 'Pricing & Plans', keywords: ['pricing', 'plans', 'price', 'cost', 'subscription', 'upgrade', 'pro', 'premium', 'free', 'tier', 'payment', 'subscribe', 'monthly', 'annual', 'trial'], icon: CreditCard, tab: 'home', scrollTo: 'pricing-section', color: 'indigo' },
  ];

  // Tax Library content keywords
  const taxLibraryContent = [
    { name: 'PAYE Tax Rates & Brackets', keywords: ['paye rates', 'tax brackets', 'income tax rates', 'graduated rates', 'bracket'], tab: 'brackets', section: 'paye' },
    { name: 'CIT Tax Rates', keywords: ['cit rates', 'corporate rates', 'company tax rates', '30%', 'corporate'], tab: 'brackets', section: 'cit' },
    { name: 'VAT Information', keywords: ['vat rate', '7.5%', 'vat registration', 'vat exempt', 'exempt'], tab: 'brackets', section: 'vat' },
    { name: 'Capital Gains Tax', keywords: ['cgt rates', 'capital gains rates', '10%', 'asset disposal', 'capital'], tab: 'brackets', section: 'cgt' },
    { name: 'Tax Reliefs & Allowances', keywords: ['reliefs', 'allowances', 'pension relief', 'nhf', 'mortgage relief', 'cra', 'consolidated relief', 'deduction'], tab: 'brackets', section: 'reliefs' },
    { name: 'Tax Compliance & Filing', keywords: ['filing', 'deadline', 'compliance', 'returns', 'firs', 'file'], tab: 'brackets', section: 'compliance' },
    { name: 'Tax Deadlines', keywords: ['deadlines', 'due date', 'filing date', 'annual returns', 'when'], tab: 'brackets', section: 'deadlines' },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard shortcut (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Search function
  const performSearch = (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const q = searchQuery.toLowerCase();
    const searchResults = [];

    // Search modules
    modules.forEach(module => {
      if (module.requiresAuth && !isAuthenticated) return;
      
      const nameMatch = module.name.toLowerCase().includes(q);
      const keywordMatch = module.keywords.some(kw => kw.includes(q));
      
      if (nameMatch || keywordMatch) {
        searchResults.push({
          type: 'module',
          ...module,
          relevance: nameMatch ? 2 : 1
        });
      }
    });

    // Search Tax Library content
    taxLibraryContent.forEach(content => {
      const nameMatch = content.name.toLowerCase().includes(q);
      const keywordMatch = content.keywords.some(kw => kw.includes(q));
      
      if (nameMatch || keywordMatch) {
        searchResults.push({
          type: 'content',
          icon: BookOpen,
          color: 'teal',
          ...content,
          relevance: nameMatch ? 2 : 1
        });
      }
    });

    // Search transaction history (for authenticated users with feature access)
    if (isAuthenticated && hasFeature && hasFeature('calculation_history')) {
      // Search PAYE history
      history.forEach((calc, index) => {
        const employeeName = calc.employee_name || calc.input?.employee_name || '';
        if (employeeName.toLowerCase().includes(q)) {
          searchResults.push({
            type: 'transaction',
            id: `paye-${index}`,
            name: employeeName,
            subtext: `PAYE Calculation - ${calc.created_at ? new Date(calc.created_at).toLocaleDateString() : 'N/A'}`,
            icon: Calculator,
            color: 'emerald',
            tab: 'history',
            relevance: 1
          });
        }
      });

      // Search CIT history
      citHistory.forEach((calc, index) => {
        const companyName = calc.company_name || calc.input?.company_name || '';
        if (companyName.toLowerCase().includes(q)) {
          searchResults.push({
            type: 'transaction',
            id: `cit-${index}`,
            name: companyName,
            subtext: `CIT Calculation - ${calc.created_at ? new Date(calc.created_at).toLocaleDateString() : 'N/A'}`,
            icon: Building2,
            color: 'blue',
            tab: 'history',
            relevance: 1
          });
        }
      });
    }

    // Sort by relevance
    searchResults.sort((a, b) => b.relevance - a.relevance);
    setResults(searchResults.slice(0, 10)); // Limit to 10 results
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    performSearch(value);
  };

  const handleResultClick = (result) => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
    
    if (onNavigate) {
      onNavigate(result.tab, result.mode, result.section);
    }
    
    // Handle scroll to specific section (e.g., pricing)
    if (result.scrollTo) {
      setTimeout(() => {
        document.getElementById(result.scrollTo)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const getColorClasses = (color) => {
    const colors = {
      emerald: 'bg-emerald-100 text-emerald-600',
      blue: 'bg-blue-100 text-blue-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600',
      indigo: 'bg-indigo-100 text-indigo-600',
      teal: 'bg-teal-100 text-teal-600',
      gray: 'bg-gray-100 text-gray-600',
      amber: 'bg-amber-100 text-amber-600',
    };
    return colors[color] || colors.gray;
  };

  return (
    <div ref={searchRef} className="relative">
      {/* Search Input */}
      <div 
        className={`flex items-center bg-white/10 backdrop-blur-sm border border-yellow-400/30 rounded-lg px-3 py-1.5 cursor-text transition-all ${isOpen ? 'w-72 bg-white/20' : 'w-48'}`}
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
      >
        <Search className="h-4 w-4 text-yellow-300 flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder="Search..."
          className="bg-transparent border-none outline-none text-white placeholder-yellow-300/60 text-sm ml-2 w-full caret-white"
        />
        {query && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setQuery('');
              setResults([]);
            }}
            className="text-yellow-300/60 hover:text-yellow-300"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-[200]">
          {/* Quick Actions */}
          {!query && (
            <div className="p-3 border-b border-gray-100">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Quick Access</p>
              <div className="flex flex-wrap gap-2">
                {['PAYE', 'CIT', 'VAT', 'CGT', 'Tax Library'].map(item => (
                  <button
                    key={item}
                    onClick={() => {
                      const tabMap = { 'PAYE': 'calculator', 'CIT': 'cit', 'VAT': 'vat', 'CGT': 'cgt', 'Tax Library': 'brackets' };
                      handleResultClick({ tab: tabMap[item] });
                    }}
                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          {results.length > 0 ? (
            <div className="max-h-80 overflow-y-auto">
              {results.map((result, index) => {
                const Icon = result.icon;
                // Check if user has access to this feature
                const hasAccess = !result.featureKey || (hasFeature && hasFeature(result.featureKey));
                const showTierBadge = result.tier && !hasAccess;
                
                return (
                  <button
                    key={`${result.type}-${result.id || index}`}
                    onClick={() => handleResultClick(result)}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0 ${!hasAccess ? 'opacity-75' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getColorClasses(result.color)}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 truncate">{result.name}</p>
                        {showTierBadge && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            result.tier === 'PREMIUM+' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {result.tier}
                          </span>
                        )}
                      </div>
                      {result.subtext && (
                        <p className="text-xs text-gray-500 truncate">{result.subtext}</p>
                      )}
                      {result.type === 'content' && (
                        <p className="text-xs text-teal-600">Tax Library</p>
                      )}
                      {showTierBadge && (
                        <p className="text-xs text-gray-400">Upgrade required</p>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          ) : query ? (
            <div className="p-6 text-center">
              <Search className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No results found for "{query}"</p>
              <p className="text-xs text-gray-400 mt-1">Try searching for PAYE, VAT, CIT, or Tax Library</p>
            </div>
          ) : null}

          {/* Footer */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-400 flex items-center justify-between">
              <span>Press <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-600 font-mono">↵</kbd> to select</span>
              <span><kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-600 font-mono">Esc</kbd> to close</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
