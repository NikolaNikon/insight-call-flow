
import React from "react";
import { NavLink } from "react-router-dom";

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  text: string;
  collapsed?: boolean;
}

export const SidebarLink: React.FC<SidebarLinkProps> = ({ 
  to, 
  icon, 
  text, 
  collapsed = false 
}) => {
  return (
    <li>
      <NavLink
        to={to}
        className={({ isActive }) =>
          `flex items-center gap-2 rounded-md p-2 text-sm font-medium hover:bg-secondary transition-colors ${
            isActive ? "bg-secondary" : ""
          } ${collapsed ? "justify-center" : ""}`
        }
        title={collapsed ? text : undefined}
      >
        {icon}
        {!collapsed && <span>{text}</span>}
      </NavLink>
    </li>
  );
};
