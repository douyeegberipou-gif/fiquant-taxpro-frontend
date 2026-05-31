import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { TierMigrationModal } from '../TierMigrationModal';
import {
  User, Mail, Phone, Shield, CreditCard, Clock, Settings, Save,
  ChevronDown, ChevronUp, AlertTriangle, RefreshCw, Loader2,
  Briefcase, FileText, Bell, Trash2, XCircle
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const PLAN_OPTIONS = [
  { id: 'starter', name: 'Starter', tier: 'starter', monthlyPrice: 4999 },
  { id: 'pro', name: 'Pro', tier: 'pro', monthlyPrice: 7999 },
  { id: 'premium', name: 'Premium', tier: 'premium', monthlyPrice: 14999 },
];

const TIER_ORDER = { free: 0, starter: 1, pro: 2, premium: 3, enterprise: 4 };

const formatNGN = (v) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(v);

const Section = ({ title, icon: Icon, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
      <button onClick={() => setOpen(!open)} className="w-full p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-yellow-400" />
          <span className="text-sm font-semibold text-white">{title}</span>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
      </button>
      {open && <div className="px-3.5 pb-3.5 pt-1">{children}</div>}
    </div>
  );
};

const MobileUserProfile = () => {
  const { user, updateProfile, logout } = useAuth();
  const [subStatus, setSubStatus] = useState(null);
  const [revalidating, setRevalidating] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showMigrationModal, setShowMigrationModal] = useState(false);
  const [migrationTarget, setMigrationTarget] = useState(null);
  const [migrationCycle, setMigrationCycle] = useState('monthly');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    account_type: user?.account_type || 'individual',
    employment_status: user?.employment_status || 'salaried',
    tin: user?.tin || '',
    company_name: user?.company_name || '',
    email_notifications: user?.email_notifications ?? true,
    sms_notifications: user?.sms_notifications ?? false,
  });

  useEffect(() => {
    const fetchSubStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/api/subscription/status`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSubStatus(res.data);
      } catch (e) { /* ignore */ }
    };
    fetchSubStatus();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setMessage('');
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMessage('');
    const result = await updateProfile(formData);
    setMessage(result.success ? 'Profile updated!' : result.error);
    setIsSuccess(result.success);
    setLoading(false);
  };

  const handleRevalidateCard = async () => {
    try {
      setRevalidating(true);
      const token = localStorage.getItem('token');
      const callbackUrl = `${window.location.origin}/payment/callback`;
      const response = await axios.post(`${API_URL}/api/card/revalidate`, { callback_url: callbackUrl }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.authorization_url) {
        sessionStorage.setItem('paystack_reference', response.data.reference);
        sessionStorage.setItem('card_revalidation', 'true');
        window.location.href = response.data.authorization_url;
      }
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Failed to initialize card revalidation.');
      setIsSuccess(false);
      setRevalidating(false);
    }
  };

  const handleSyncSubscription = async () => {
    try {
      setSyncing(true);
      setMessage('');
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/api/subscription/sync`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = response.data;
      if (data.status === 'synced') {
        setMessage(data.message);
        setIsSuccess(true);
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setMessage(data.message);
        setIsSuccess(data.status === 'already_synced');
      }
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Failed to sync subscription.');
      setIsSuccess(false);
    } finally {
      setSyncing(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    setDeleteLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/auth/delete-account`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      logout();
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Failed to delete account.');
      setIsSuccess(false);
      setDeleteLoading(false);
    }
  };

  const currentTierLevel = TIER_ORDER[user?.account_tier?.toLowerCase()] || 0;

  return (
    <div className="space-y-4 pb-4">
      {/* Status Message */}
      {message && (
        <div className={`p-3 rounded-lg text-sm ${isSuccess ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
          {message}
        </div>
      )}

      {/* Account Overview */}
      <div className="flex items-center gap-3">
        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-black font-bold text-xl flex-shrink-0">
          {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
        </div>
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-white truncate">{user?.full_name || 'User'}</h3>
          <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          <span className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-yellow-500/20 text-yellow-400 uppercase">
            {user?.account_tier || 'Free'}
          </span>
        </div>
      </div>

      {/* Account Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <p className="text-[10px] text-gray-500">Member Since</p>
          <p className="text-xs font-medium text-white">
            {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
          </p>
        </div>
        <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <p className="text-[10px] text-gray-500">Last Login</p>
          <p className="text-xs font-medium text-white">
            {user?.last_login ? new Date(user.last_login).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Now'}
          </p>
        </div>
      </div>

      {/* Subscription Management */}
      <Section title="Subscription Management" icon={CreditCard} defaultOpen>
        <div className="space-y-3">
          <div>
            <p className="text-[10px] text-gray-500">Current Plan</p>
            <p className="text-sm font-bold text-white uppercase">{user?.account_tier || 'Free'}</p>
          </div>

          <p className="text-[10px] text-gray-500">Change your plan:</p>
          <div className="space-y-2">
            {PLAN_OPTIONS.map(plan => {
              const planLevel = TIER_ORDER[plan.tier] || 0;
              const isCurrent = user?.account_tier?.toLowerCase() === plan.tier;
              const isUpgrade = planLevel > currentTierLevel;

              return (
                <div key={plan.id} className={`rounded-lg p-3 border ${isCurrent ? 'border-yellow-400/50 bg-yellow-500/10' : 'border-white/10 bg-white/5'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">{plan.name}</p>
                      <p className="text-[10px] text-gray-400">{formatNGN(plan.monthlyPrice)}/mo</p>
                    </div>
                    {isCurrent ? (
                      <span className="text-[10px] font-medium text-yellow-400 bg-yellow-500/20 px-2 py-0.5 rounded">Current</span>
                    ) : (
                      <button
                        onClick={() => { setMigrationTarget(plan.id); setMigrationCycle('monthly'); setShowMigrationModal(true); }}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium ${isUpgrade ? 'bg-yellow-500 text-black' : 'bg-white/10 text-gray-300 border border-white/20'}`}
                        data-testid={`mobile-migrate-${plan.id}-btn`}
                      >
                        {isUpgrade ? 'Upgrade' : 'Downgrade'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Renewal Status */}
          {subStatus?.has_subscription && subStatus.subscription && (
            <div className="rounded-lg p-3 space-y-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-xs font-semibold text-gray-300 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Renewal Status
              </p>
              <div className="grid grid-cols-3 gap-2 text-[10px]">
                <div>
                  <p className="text-gray-500">Billing</p>
                  <p className="font-medium text-white capitalize">{subStatus.subscription.billing_cycle}</p>
                </div>
                <div>
                  <p className="text-gray-500">Next Renewal</p>
                  <p className="font-medium text-white">
                    {subStatus.subscription.next_billing_date
                      ? new Date(subStatus.subscription.next_billing_date).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })
                      : 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Auto-Renew</p>
                  <p className={`font-medium ${subStatus.subscription.auto_renewal ? 'text-green-400' : 'text-red-400'}`}>
                    {subStatus.subscription.auto_renewal ? 'Active' : 'No Card'}
                  </p>
                </div>
              </div>
              {subStatus.account_credit_naira > 0 && (
                <div className="text-[10px]">
                  <p className="text-gray-500">Account Credit</p>
                  <p className="font-medium text-green-400">{formatNGN(subStatus.account_credit_naira)}</p>
                </div>
              )}

              {/* Payment Card */}
              <div className="pt-2 border-t border-white/10">
                <p className="text-xs font-semibold text-gray-300 flex items-center gap-1 mb-2">
                  <CreditCard className="w-3 h-3" /> Payment Card
                </p>
                {subStatus.card_info ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span className="inline-flex items-center gap-1 bg-white/10 border border-white/20 rounded px-2 py-1">
                        <CreditCard className="w-3 h-3 text-gray-400" />
                        <span className="font-medium text-white uppercase">{subStatus.card_info.card_type || 'Card'}</span>
                        <span className="text-gray-500">****</span>
                        <span className="font-mono font-medium text-white">{subStatus.card_info.last_four}</span>
                      </span>
                      <span className="text-gray-500">Exp {subStatus.card_info.exp_month}/{subStatus.card_info.exp_year}</span>
                    </div>
                    <button
                      onClick={handleRevalidateCard}
                      disabled={revalidating}
                      className="text-[10px] px-2 py-1 rounded bg-white/10 text-gray-300 border border-white/20 flex items-center gap-1"
                      data-testid="mobile-revalidate-card-btn"
                    >
                      {revalidating ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                      {revalidating ? 'Processing...' : 'Update'}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-amber-400 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      No valid card on file
                    </p>
                    <button
                      onClick={handleRevalidateCard}
                      disabled={revalidating}
                      className="text-[10px] px-2.5 py-1 rounded bg-yellow-500 text-black font-medium flex items-center gap-1"
                      data-testid="mobile-add-card-btn"
                    >
                      {revalidating ? <Loader2 className="w-3 h-3 animate-spin" /> : <CreditCard className="w-3 h-3" />}
                      {revalidating ? 'Processing...' : 'Add Card'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sync Subscription */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <p className="text-[10px] text-gray-500">Charged but plan not updated?</p>
            <button
              onClick={handleSyncSubscription}
              disabled={syncing}
              className="text-[10px] px-2.5 py-1 rounded bg-white/10 text-gray-300 border border-white/20 flex items-center gap-1"
              data-testid="mobile-sync-subscription-btn"
            >
              {syncing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
              {syncing ? 'Syncing...' : 'Sync'}
            </button>
          </div>
        </div>
      </Section>

      {/* Profile Information */}
      <Section title="Profile Information" icon={Settings}>
        <div className="space-y-3">
          <div>
            <label className="text-[10px] text-gray-500 block mb-1">Full Name</label>
            <input
              value={formData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              placeholder="John Doe"
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-yellow-500/50"
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 block mb-1">Phone Number</label>
            <input
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+234800123456"
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-yellow-500/50"
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 block mb-1">Email (cannot be changed)</label>
            <input value={user?.email || ''} disabled className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-500 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-gray-500 block mb-1">Account Type</label>
              <select
                value={formData.account_type}
                onChange={(e) => handleInputChange('account_type', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-yellow-500/50"
              >
                <option value="individual" className="bg-gray-900">Individual</option>
                <option value="business" className="bg-gray-900">Business</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-gray-500 block mb-1">Employment</label>
              <select
                value={formData.employment_status}
                onChange={(e) => handleInputChange('employment_status', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-yellow-500/50"
              >
                <option value="salaried" className="bg-gray-900">Salaried</option>
                <option value="self-employed" className="bg-gray-900">Self-Employed</option>
                <option value="contractor" className="bg-gray-900">Contractor</option>
                <option value="investor" className="bg-gray-900">Investor</option>
                <option value="retired" className="bg-gray-900">Retired</option>
              </select>
            </div>
          </div>
          {formData.account_type === 'business' && (
            <div>
              <label className="text-[10px] text-gray-500 block mb-1">Company Name</label>
              <input
                value={formData.company_name}
                onChange={(e) => handleInputChange('company_name', e.target.value)}
                placeholder="Acme Corporation Ltd"
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-yellow-500/50"
              />
            </div>
          )}
          <div>
            <label className="text-[10px] text-gray-500 block mb-1">Tax ID Number (TIN)</label>
            <input
              value={formData.tin}
              onChange={(e) => handleInputChange('tin', e.target.value)}
              placeholder="12345678-0001"
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-yellow-500/50"
            />
          </div>
        </div>
      </Section>

      {/* Notification Preferences */}
      <Section title="Notifications" icon={Bell}>
        <div className="space-y-2">
          <label className="flex items-center justify-between p-3 rounded-lg bg-white/5 cursor-pointer">
            <div>
              <p className="text-sm font-medium text-white">Email Notifications</p>
              <p className="text-[10px] text-gray-500">Updates and alerts via email</p>
            </div>
            <input
              type="checkbox"
              checked={formData.email_notifications}
              onChange={(e) => handleInputChange('email_notifications', e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 text-yellow-500 focus:ring-yellow-500 bg-gray-700"
            />
          </label>
          <label className="flex items-center justify-between p-3 rounded-lg bg-white/5 cursor-pointer">
            <div>
              <p className="text-sm font-medium text-white">SMS Notifications</p>
              <p className="text-[10px] text-gray-500">Important alerts via SMS</p>
            </div>
            <input
              type="checkbox"
              checked={formData.sms_notifications}
              onChange={(e) => handleInputChange('sms_notifications', e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 text-yellow-500 focus:ring-yellow-500 bg-gray-700"
            />
          </label>
        </div>
      </Section>

      {/* Save Changes */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-3 rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-semibold flex items-center justify-center gap-2"
      >
        <Save className="h-4 w-4" />
        {loading ? 'Saving...' : 'Save Changes'}
      </button>

      {/* Sign Out */}
      <button
        onClick={logout}
        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white font-medium flex items-center justify-center gap-2"
      >
        <XCircle className="h-4 w-4" />
        Sign Out
      </button>

      {/* Danger Zone */}
      <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <h4 className="font-semibold text-red-400 text-sm">Danger Zone</h4>
        </div>
        <p className="text-[10px] text-gray-400 mb-3">Permanently delete your account and all data. This cannot be undone.</p>
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 font-medium flex items-center justify-center gap-2 text-sm"
          >
            <Trash2 className="h-4 w-4" />
            Delete Account
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-red-300">Type DELETE to confirm:</p>
            <input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              className="w-full px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-white text-sm placeholder-red-300/50 focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); }}
                className="flex-1 px-3 py-2 rounded-lg bg-white/10 text-gray-300 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || deleteLoading}
                className="flex-1 px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-medium disabled:opacity-50"
              >
                {deleteLoading ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tier Migration Modal */}
      <TierMigrationModal
        isOpen={showMigrationModal}
        onClose={() => setShowMigrationModal(false)}
        targetPlan={migrationTarget}
        targetCycle={migrationCycle}
        currentTier={user?.account_tier?.toLowerCase() || 'free'}
        onMigrationSuccess={() => {
          setShowMigrationModal(false);
          window.location.reload();
        }}
      />
    </div>
  );
};

export default MobileUserProfile;
