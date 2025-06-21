import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button'; // adjust if needed

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
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > scrollDistance);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollDistance]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-14 h-14',
  };

  const positionClasses = {
    'bottom-right': 'right-5 bottom-20',
    'bottom-left': 'left-6 bottom-6',
  };

  return (
    <div
      className={`fixed z-[9999] ${
        positionClasses[position]
      } transition-all duration-500 ease-in-out ${
        visible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
      }`}
    >
      <Button
        onClick={scrollToTop}
        size="icon"
        className={`
          rounded-full 
          ${sizeClasses[size]} 
          bg-gradient-to-br from-blue-500 to-purple-600 
          shadow-[0_0_15px_4px_rgba(99,102,241,0.5)] 
          text-white 
          transition-all duration-300 
          hover:scale-110 
          active:scale-95 
          hover:shadow-[0_0_25px_8px_rgba(147,51,234,0.6)]
          focus:outline-none
        `}
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-5 h-5" />
      </Button>

    </div>
  );
};

export default ScrollToTop;
