
import React from 'react';
import { Search } from 'lucide-react';
import './animated-search-input.css';

interface AnimatedSearchInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const AnimatedSearchInput: React.FC<AnimatedSearchInputProps> = ({
  placeholder = "Поиск...",
  value,
  onChange,
  className = ""
}) => {
  return (
    <div id="main" className={`relative ${className}`}>
      <div id="poda">
        <div className="glow"></div>
        <div className="darkBorderBg"></div>
        <div className="white"></div>
        <div className="border"></div>
        
        <input
          className="input"
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        
        <div id="input-mask"></div>
        <div id="pink-mask"></div>
        
        <div id="search-icon">
          <Search className="h-5 w-5 text-secondary" />
        </div>
      </div>
    </div>
  );
};
