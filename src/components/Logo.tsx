
import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Logo: React.FC<LogoProps> = ({ className = "", size = 'md' }) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-lg';
      case 'md':
        return 'text-xl';
      case 'lg':
        return 'text-2xl';
      case 'xl':
        return 'text-4xl md:text-5xl lg:text-6xl';
      default:
        return 'text-xl';
    }
  };

  return (
    <span className={`font-bold text-medical-primary ${getSizeClasses()} ${className}`}>
      Rad
      <span className="bg-medical-primary text-white px-2 py-1 rounded-full ml-1">
        2B
      </span>
    </span>
  );
};

export default Logo;
