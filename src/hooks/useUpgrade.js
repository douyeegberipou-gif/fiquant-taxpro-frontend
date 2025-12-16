import { useState } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const useUpgrade = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const startTrial = async (tier = 'pro') => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${BACKEND_URL}/api/trials/start`,
        { tier: tier.toUpperCase() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        // Refresh the page to update feature access
        window.location.reload();
        return { success: true, message: 'Trial started successfully!' };
      }
      
      return { success: false, message: response.data.message || 'Failed to start trial' };
    } catch (error) {
      console.error('Trial start error:', error);
      return { 
        success: false, 
        message: error.response?.data?.detail || 'Failed to start trial. Please try again.' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const requestUpgrade = async (tier = 'pro') => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${BACKEND_URL}/api/subscriptions/upgrade`,
        { 
          tier: tier.toUpperCase(),
          is_annual: false 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        // In a real implementation, this would redirect to payment
        alert('Upgrade request submitted! You will be redirected to payment.');
        return { success: true };
      }
      
      return { success: false, message: response.data.message || 'Failed to process upgrade' };
    } catch (error) {
      console.error('Upgrade error:', error);
      return { 
        success: false, 
        message: error.response?.data?.detail || 'Failed to process upgrade. Please try again.' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const requestAddon = async (addonType, quantity = 1) => {
    try {
      setIsLoading(true);
      
      // For now, show a simple message about add-on purchase
      // In a real implementation, this would integrate with payment processing
      const addonPrices = {
        bulk_employees: `₦${100 * quantity} for ${quantity} extra employees`,
        pdf_prints: `₦${200 * quantity} for ${quantity} PDF reports`,
        compliance_review: '₦25,000 for compliance review'
      };
      
      alert(`Add-on purchase: ${addonPrices[addonType] || 'Add-on selected'}. Payment integration would be implemented here.`);
      
      return { success: true };
    } catch (error) {
      console.error('Add-on request error:', error);
      return { 
        success: false, 
        message: 'Failed to process add-on request. Please try again.' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    startTrial,
    requestUpgrade,
    requestAddon,
    isLoading
  };
};