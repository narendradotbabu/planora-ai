import React from 'react';
import { Sparkles } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const sizeConfig = {
  sm: { icon: 'w-7 h-7', iconInner: 'w-4 h-4', text: 'text-lg', gap: 'gap-1.5' },
  md: { icon: 'w-9 h-9', iconInner: 'w-5 h-5', text: 'text-xl', gap: 'gap-2' },
  lg: { icon: 'w-12 h-12', iconInner: 'w-7 h-7', text: 'text-3xl', gap: 'gap-3' },
};

const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true }) => {
  const config = sizeConfig[size];

  return (
    <div className={`flex items-center ${config.gap}`}>
      {/* Gradient icon container */}
      <div
        className={`${config.icon} rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md`}
      >
        <Sparkles className={`${config.iconInner} text-white`} />
      </div>

      {/* Gradient text */}
      {showText && (
        <span
          className={`font-display font-bold ${config.text} bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent`}
        >
          Planora AI
        </span>
      )}
    </div>
  );
};

export { Logo };
export default Logo;
