import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { ArrowUp } from 'lucide-react';

interface ScrollToTopProps {
  scrollDistance?: number;
  position?: 'bottom-right' | 'bottom-left';
  size?: 'sm' | 'md' | 'lg';
}

const ScrollToTop: React.FC<ScrollToTopProps> = ({
  scrollDistance = 300,
  position = 'bottom-right',
  size = 'md',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  // Handle scroll event to show/hide button
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > scrollDistance) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    // Initial check on component mount
    toggleVisibility();

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, [scrollDistance]);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Size and position styles
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const positionClasses = {
    'bottom-right': 'right-4 md:right-6 bottom-4 md:bottom-6',
    'bottom-left': 'left-4 md:left-6 bottom-4 md:bottom-6',
  };

  return (
    <>
      {isVisible && (
        <Button
          onClick={scrollToTop}
          size="icon"
          className={`fixed ${positionClasses[position]} ${sizeClasses[size]} rounded-full opacity-70 hover:opacity-100 transition-opacity shadow-md z-50`}
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}
    </>
  );
};

export default ScrollToTop;
