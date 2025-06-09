
import React from "react";
import { NavLink } from "react-router-dom";

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  text: string;
}

export const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon, text }) => {
  return (
    <li>
      <NavLink
        to={to}
        className={({ isActive }) =>
          `flex items-center gap-2 rounded-md p-2 text-sm font-medium hover:bg-secondary ${
            isActive ? "bg-secondary" : ""
          }`
        }
      >
        {icon}
        {text}
      </NavLink>
    </li>
  );
};
