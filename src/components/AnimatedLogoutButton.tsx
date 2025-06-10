
import React from 'react';
import { LogOut } from 'lucide-react';
import './AnimatedLogoutButton.css';

interface AnimatedLogoutButtonProps {
  onClick: () => void;
}

const AnimatedLogoutButton = ({ onClick }: AnimatedLogoutButtonProps) => {
  return (
    <button className="Btn" onClick={onClick}>
      <div className="sign">
        <LogOut />
      </div>
      <div className="text">Выйти</div>
    </button>
  );
};

export default AnimatedLogoutButton;
