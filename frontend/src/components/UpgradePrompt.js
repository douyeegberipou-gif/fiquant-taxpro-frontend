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
        icon: <Crown className="h-6 w-6 text-blue-600" />,
        title: "Unlock Professional CIT Calculator",
        benefit: "Calculate corporate income tax with advanced features including loss relief, tax credits, and automated compliance checks",
        requiredTier: "Pro",
        tierColor: "blue"
      },
      vat_calc: {
        icon: <FileText className="h-6 w-6 text-purple-600" />,
        title: "Unlock Advanced VAT Calculator", 
        benefit: "Process multiple transactions, track VAT categories, and generate compliant VAT returns with ease",
        requiredTier: "Pro",
        tierColor: "purple"
      },
      cgt_calc: {
        icon: <BarChart3 className="h-6 w-6 text-green-600" />,
        title: "Unlock Capital Gains Tax Calculator",
        benefit: "Calculate CGT on investments, property sales, and business disposals with NTA-compliant rates",
        requiredTier: "Pro", 
        tierColor: "green"
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
        "Unlimited bulk PAYE runs",
        "All premium calculators (CIT, VAT, CGT)", 
        "Unlimited PDF exports",
        "Complete calculation history",
        "Email support"
      ],
      premium: [
        "Everything in Pro",
        "Advanced tax analytics", 
        "Compliance assistance",
        "Priority support",
        "API access"
      ]
    };
    return benefits[tier] || benefits.pro;
  };

  if (type === 'quota') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-purple-50 to-blue-50 shadow-2xl border-2 border-purple-200 my-8">
          <CardHeader className="text-center relative bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
            <Button 
              variant="ghost" 
              size="sm" 
              className="absolute right-2 top-2 h-8 w-8 p-0 text-white hover:bg-white/20"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="flex justify-center mb-2">
              🎯
            </div>
            <CardTitle className="text-lg text-white">You're making great progress!</CardTitle>
            <CardDescription className="text-sm leading-relaxed text-purple-100">
              <div dangerouslySetInnerHTML={{ 
                __html: `You've used up your monthly quota, which shows you're really putting our tools to work! No worries though - you don't have to stop here.<br/><br/><strong>Keep the momentum going for just ₦9,999/month</strong> and unlock unlimited runs plus advanced features. Or save big with our <strong>annual plan with 2 months free</strong>!<br/><br/><strong>Not ready to commit yet?</strong> We totally understand! Start your <strong>7-day free trial</strong> and continue your work immediately - no strings attached.<br/><br/>Let's keep you moving forward! 🚀` 
              }} />
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <div className="flex flex-col space-y-3">
              <Button onClick={onTrial} className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 shadow-lg">
                <Zap className="h-4 w-4 mr-2" />
                Start 7-Day Free Trial
              </Button>
              <Button onClick={onUpgrade} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 shadow-lg">
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to Pro (₦9,999/month)
              </Button>
              <Button onClick={onAddOns} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 shadow-lg">
                <CreditCard className="h-4 w-4 mr-2" />
                Get 2 Months Free - Pay Annually
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full bg-white shadow-2xl border-2 border-yellow-400 max-h-[85vh] overflow-y-auto">
        <CardHeader className="text-center relative pb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="absolute right-4 top-4 h-8 w-8 p-0 text-gray-600 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex justify-center mb-3">
            {feature === 'pdf_export' ? '📄' : '⭐'}
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          
          {/* Main Message */}
          <div className="text-center space-y-4">
            <p className="text-gray-800 leading-relaxed text-sm">
              You've reached your free tier limit, but don't worry - we've got you covered! 
            </p>
            <p className="text-gray-800 leading-relaxed text-sm">
              <strong className="text-blue-700">Continue your important work for just ₦9,999/month</strong> - and here's the sweet part: get <strong className="text-green-600">2 months free</strong> when you pay annually!
            </p>
            <p className="text-gray-800 leading-relaxed text-sm">
              <strong className="text-purple-700">Want to test-drive first?</strong> Perfect! Start your <strong className="text-emerald-600">7-day free trial</strong> right now and experience all Premium features with zero commitment.
            </p>
          </div>

          <div className="space-y-4">
            {/* Tier Benefits */}
            {/* Tier Benefits */}
            <div className="border border-gray-200 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <Crown className="h-5 w-5 text-yellow-500 mr-2" />
                  <span className="font-semibold text-gray-800">{config.requiredTier || 'Pro'} Features</span>
                </div>
                <Badge className="bg-yellow-400 text-white border-0 text-xs">
                  Upgrade Required
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                {getTierBenefits((config.requiredTier || 'Pro').toLowerCase()).map((benefit, idx) => (
                  <div key={idx} className="flex items-center">
                    <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing */}
            <div className="text-center border border-gray-200 p-4 rounded-lg">
              <div className="flex items-center justify-center space-x-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-700">₦9,999</div>
                  <div className="text-xs text-gray-600">per month</div>
                </div>
                <div className="text-gray-400">or</div>
                <div className="text-center">
                  <div className="text-xl font-bold text-green-700">₦109,990</div>
                  <div className="text-xs text-gray-600">per year</div>
                  <div className="text-xs text-green-600 font-semibold">(2 months FREE!)</div>
                </div>
              </div>
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
              <Button variant="outline" onClick={onUpgrade} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-3 border-0">
                <CreditCard className="h-4 w-4 mr-2" />
                Get 2 Months Free - Pay Annually
              </Button>
              <Button variant="ghost" onClick={handleClose} className="text-gray-600 hover:bg-gray-100">
                Maybe Later
              </Button>
            </div>
          </div>
          
          {/* Trust Elements */}
          <div className="text-center text-xs text-gray-500 border-t pt-3">
            <div className="flex items-center justify-center space-x-4">
              <span>✅ Instant Access</span>
              <span>🔒 Secure Payment</span>
              <span>📞 Nigerian Support</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UpgradePrompt;