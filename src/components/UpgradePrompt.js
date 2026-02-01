import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Crown, 
  Zap, 
  Users, 
  FileText, 
  BarChart3, 
  Shield, 
  CreditCard,
  Clock,
  CheckCircle,
  X
} from 'lucide-react';

const UpgradePrompt = ({ 
  type = 'feature', // 'feature' or 'quota'
  feature, 
  currentTier = 'free',
  onUpgrade,
  onTrial,
  onAddOns,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  const getFeatureConfig = () => {
    const configs = {
      cit_calc: {
        icon: <Crown className="h-6 w-6 text-yellow-600" />,
        title: "Unlock Professional CIT Calculator",
        benefit: "Calculate corporate income tax with advanced features including loss relief, tax credits, and automated compliance checks",
        requiredTier: "Premium",  // CIT is Premium only now
        tierColor: "yellow"
      },
      vat_calc: {
        icon: <FileText className="h-6 w-6 text-blue-600" />,
        title: "Unlock Advanced VAT Calculator", 
        benefit: "Process multiple transactions, track VAT categories, and generate compliant VAT returns with ease",
        requiredTier: "Pro",
        tierColor: "blue"
      },
      cgt_calc: {
        icon: <BarChart3 className="h-6 w-6 text-green-600" />,
        title: "CGT Calculator - Free!",
        benefit: "Calculate CGT on investments, property sales, and business disposals with NTA-compliant rates. This feature is available to all users!",
        requiredTier: "Free",  // CGT is now FREE
        tierColor: "green"
      },
      bulk_payment_processing: {
        icon: <CreditCard className="h-6 w-6 text-yellow-600" />,
        title: "Unlock Bulk Payments Processing",
        benefit: "Process multiple payments at once with automated WHT calculations, payment schedules, and comprehensive reporting for all transaction types",
        requiredTier: "Premium",
        tierColor: "yellow"
      },
      pdf_export: {
        icon: <FileText className="h-6 w-6 text-gray-600" />,
        title: "📄 Time to save your hard work!",
        benefit: "You've done the heavy lifting with your calculations - now let's get you that professional PDF report!<br/><br/><strong>For just ₦9,999/month</strong>, unlock unlimited PDF exports plus all our premium calculation tools. Want to save more? Our <strong>annual plan gives you 2 months free</strong>!<br/><br/><strong>Just need to finish this one task?</strong> Start your <strong>7-day free trial</strong> right now and download your report immediately!<br/><br/>Your professional reports are just one click away! ✨",
        requiredTier: "Pro",
        tierColor: "gray"
      },
      calculation_history: {
        icon: <Clock className="h-6 w-6 text-indigo-600" />,
        title: "Unlock Tax History & Records",
        benefit: "Access your complete calculation history, track tax trends, and maintain audit-ready records",
        requiredTier: "Pro",
        tierColor: "indigo"
      },
      bulk_paye: {
        icon: <Users className="h-6 w-6 text-orange-600" />,
        title: "Unlock Unlimited Bulk Processing",
        benefit: "Process unlimited employee payrolls with higher staff caps and automated bulk calculations",
        requiredTier: "Pro",
        tierColor: "orange"
      },
      advanced_analytics: {
        icon: <BarChart3 className="h-6 w-6 text-pink-600" />,
        title: "Unlock Advanced Tax Analytics",
        benefit: "Get detailed insights, tax trends, forecasting, and comprehensive reporting dashboards",
        requiredTier: "Premium",
        tierColor: "pink"
      },
      compliance_assistance: {
        icon: <Shield className="h-6 w-6 text-red-600" />,
        title: "Unlock Compliance Support",
        benefit: "Get expert compliance reviews, audit preparation, and direct access to tax professionals",
        requiredTier: "Premium", 
        tierColor: "red"
      }
    };

    return configs[feature] || configs.cit_calc;
  };

  const getQuotaConfig = () => {
    const configs = {
      bulk_employees: {
        icon: <Users className="h-6 w-6 text-blue-600" />,
        title: "Need More Employee Capacity?",
        benefit: "Add extra employees to your bulk processing without upgrading your entire plan",
        addonPrice: "₦100 per employee per run",
        addonDescription: "Pay only for what you use"
      },
      pdf_prints: {
        icon: <FileText className="h-6 w-6 text-purple-600" />,
        title: "Need PDF Reports?",
        benefit: "Generate professional PDF reports for your calculations and compliance needs", 
        addonPrice: "₦200 per PDF",
        addonDescription: "One-time charge per report"
      },
      compliance_review: {
        icon: <Shield className="h-6 w-6 text-green-600" />,
        title: "Need Expert Review?", 
        benefit: "Get professional compliance review and audit preparation assistance",
        addonPrice: "₦25,000 per review",
        addonDescription: "Professional tax expert review"
      }
    };

    return configs[feature] || configs.bulk_employees;
  };

  const config = type === 'quota' ? getQuotaConfig() : getFeatureConfig();

  const getTierBenefits = (tier) => {
    const benefits = {
      pro: [
        "Unlimited bulk PAYE runs (15 staff)",
        "VAT calculator", 
        "Unlimited PDF exports",
        "Complete calculation history",
        "Email notifications",
        "Ad-free experience"
      ],
      premium: [
        "Everything in Pro",
        "Bulk PAYE (50 staff)",
        "CIT calculator",
        "Bulk Payments Processing",
        "Advanced tax analytics"
      ]
    };
    return benefits[tier] || benefits.pro;
  };

  if (type === 'quota') {
    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
        onClick={handleClose}
      >
        <div 
          className="w-full max-w-md mx-auto my-8 rounded-lg"
          onClick={(e) => e.stopPropagation()}
          style={{
            backdropFilter: 'blur(16px)',
            background: 'rgba(255, 255, 255, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}
        >
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex justify-center w-full">
                <img 
                  src="/fiquant-logo-bold-diamond.png" 
                  alt="Fiquant Logo" 
                  className="w-16 h-16 object-contain"
                />
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 text-gray-200 hover:text-white hover:bg-white/10 absolute right-4 top-4"
                onClick={handleClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <h3 className="text-lg font-bold text-white text-center mb-2">You're making great progress!</h3>
            <p className="text-sm leading-relaxed text-gray-200 text-center mb-6">
              You've used up your monthly quota, which shows you're really putting our tools to work! No worries though - you don't have to stop here.
              <br/><br/>
              <strong className="text-blue-300">Keep the momentum going for just ₦9,999/month</strong> and unlock unlimited runs plus advanced features. Or save big with our <strong className="text-yellow-300">annual plan with 2 months free</strong>!
              <br/><br/>
              <strong className="text-green-300">Not ready to commit yet?</strong> We totally understand! Start your <strong>7-day free trial</strong> and continue your work immediately - no strings attached.
            </p>
            <div className="flex flex-col space-y-3">
              <Button onClick={onTrial} className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 shadow-lg">
                <Zap className="h-4 w-4 mr-2" />
                Start 7-Day Free Trial
              </Button>
              <Button onClick={onUpgrade} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 shadow-lg">
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to Pro (₦9,999/month)
              </Button>
              <Button onClick={onAddOns} className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-3 shadow-lg">
                <CreditCard className="h-4 w-4 mr-2" />
                Get 2 Months Free - Pay Annually
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div 
        className="max-w-md w-full rounded-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{
          backdropFilter: 'blur(16px)',
          background: 'rgba(255, 255, 255, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex justify-center w-full">
              <img 
                src="/fiquant-logo-bold-diamond.png" 
                alt="Fiquant Logo" 
                className="w-16 h-16 object-contain"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0 text-gray-200 hover:text-white hover:bg-white/10 absolute right-4 top-4"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Main Message */}
          <div className="text-center space-y-4 mb-6">
            <p className="text-gray-200 leading-relaxed text-sm">
              {feature === 'pdf_export' ? "Print is a Pro feature but we've got you covered!" : "You've reached your free tier limit, but don't worry - we've got you covered!"} 
            </p>
            <p className="text-gray-200 leading-relaxed text-sm">
              <strong className="text-blue-300">{feature === 'pdf_export' ? "Get access to NTA-Compliant filing-ready printouts for just ₦9,999/month" : "Continue your important work for just ₦9,999/month"}</strong> - and here's the sweet part: get <strong className="text-green-300">2 months free</strong> when you pay annually!
            </p>
            <p className="text-gray-200 leading-relaxed text-sm">
              <strong className="text-purple-300">Want to test-drive first?</strong> Perfect! Start your <strong className="text-emerald-300">7-day free trial</strong> right now and experience all Premium features with zero commitment.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3">
            <Button onClick={onTrial} className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3">
              <Zap className="h-4 w-4 mr-2" />
              Start 7-Day Free Trial
            </Button>
            <Button onClick={onUpgrade} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3">
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to Pro (₦9,999/month)
            </Button>
            <Button onClick={onUpgrade} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-3">
              <CreditCard className="h-4 w-4 mr-2" />
              Get 2 Months Free - Pay Annually
            </Button>
            <Button variant="ghost" onClick={handleClose} className="text-gray-200 hover:text-white hover:bg-white/10">
              Maybe Later
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradePrompt;