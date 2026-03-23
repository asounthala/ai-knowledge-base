"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { icon: "⬆", label: "Upload", href: "/" },
  { icon: "💬", label: "Chats", href: "/chat" },
  { icon: "📁", label: "Documents", href: "/documents" },
  { icon: "⚙️", label: "Settings", href: "/settings" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div
      className={`
        flex flex-col border-r border-white/10 bg-surface shrink-0
        transition-all duration-300 ease-in-out
        ${collapsed ? "w-16" : "w-56"}
      `}
    >
      {/* Logo + toggle */}
      <div className="flex items-center h-14 border-b border-white/10 px-3 gap-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-text hover:bg-surface2 transition-all shrink-0"
        >
          {collapsed ? "→" : "←"}
        </button>
        {!collapsed && (
          <Link 
            href={"/"}
            className="font-sans font-bold text-base whitespace-nowrap overflow-hidden">
            doc<span className="text-accent">Knowledge</span>
          </Link>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-1 p-2 flex-1">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-lg
              transition-all duration-150 text-sm font-semibold
              ${collapsed ? "justify-center" : "justify-start"}
              ${pathname === item.href
                ? "bg-accent/20 text-accent"
                : "text-muted hover:text-text hover:bg-surface2"
              }
            `}
          >
            <span className="text-base shrink-0">{item.icon}</span>
            {!collapsed && (
              <span className="whitespace-nowrap overflow-hidden">
                {item.label}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* User profile */}
      <div className={`
        flex items-center gap-3 p-3 border-t border-white/10
        ${collapsed ? "justify-center" : "justify-start"}
      `}>
        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold shrink-0">
          AS
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="text-sm font-sans font-semibold truncate">Adrian S.</div>
            <div className="text-xs text-muted font-mono truncate">asounthala</div>
          </div>
        )}
      </div>
    </div>
  );
}