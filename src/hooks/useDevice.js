import { useState, useEffect } from 'react';

/**
 * Custom hook for device detection and responsive breakpoints
 * Breakpoints:
 * - mobile: 0-480px
 * - largeMobile: 481-768px
 * - tablet: 769-1024px
 * - desktop: 1025px+
 */
export const useDevice = () => {
  const [device, setDevice] = useState({
    isMobile: false,
    isLargeMobile: false,
    isTablet: false,
    isDesktop: false,
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setDevice({
        isMobile: width <= 480,
        isLargeMobile: width > 480 && width <= 768,
        isTablet: width > 768 && width <= 1024,
        isDesktop: width > 1024,
        width,
        height
      });
    };

    // Initial check
    handleResize();

    // Listen for resize events
    window.addEventListener('resize', handleResize);
    
    // Listen for orientation change
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return {
    ...device,
    isMobileOrLargeMobile: device.isMobile || device.isLargeMobile,
    isSmallScreen: device.isMobile || device.isLargeMobile,
    isMediumScreen: device.isTablet,
    isLargeScreen: device.isDesktop
  };
};

/**
 * Hook to detect if user is on a touch device
 */
export const useTouchDevice = () => {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0
    );
  }, []);

  return isTouch;
};
