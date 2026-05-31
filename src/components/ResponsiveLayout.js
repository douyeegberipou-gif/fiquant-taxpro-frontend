import React, { useState, useEffect } from 'react';
import { isMobile, isTablet } from 'react-device-detect';
import { isMobileDevice } from '../utils/deviceDetection';

/**
 * Wrapper component that forces correct layout based on device
 */
export const ResponsiveLayout = ({ mobileContent, desktopContent }) => {
  const [showMobile, setShowMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Client-side detection
    const checkDevice = () => {
      const isMobileLib = isMobile || isTablet; // react-device-detect
      const isMobileCustom = isMobileDevice(); // Our custom detection
      const isMobileWidth = window.innerWidth <= 768;
      
      // If ANY detection method says mobile, show mobile
      const shouldShowMobile = isMobileLib || isMobileCustom || isMobileWidth;
      setShowMobile(shouldShowMobile);
      setMounted(true);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Show nothing until mounted to avoid hydration mismatch
  if (!mounted) {
    return <div style={{ minHeight: '100vh' }} />;
  }

  return showMobile ? mobileContent : desktopContent;
};
