"use client";

import React, { useState } from "react";
import { Sidebar, type NavItemKey } from "./sidebar";
import { TopBar } from "./top-bar";
import { RightPanel } from "./right-panel";
import { WorkspaceContent } from "./workspace-content";

export function AppShell() {
  const [activeItem, setActiveItem] = useState<NavItemKey>("commitments-ledger");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f6f5f4] text-[#000000]">
      {/* Desktop Left Sidebar */}
      <div className="hidden md:flex h-full shrink-0">
        <Sidebar
          activeItem={activeItem}
          onSelect={(item) => setActiveItem(item)}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        />
      </div>

      {/* Mobile Sidebar Drawer & Backdrop */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative flex flex-col w-64 max-w-[80vw] h-full bg-[#f6f5f4] shadow-xl z-10 animate-in slide-in-from-left duration-200">
            <Sidebar
              activeItem={activeItem}
              onSelect={(item) => {
                setActiveItem(item);
                setMobileMenuOpen(false);
              }}
              collapsed={false}
              onToggleCollapse={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Central Area: TopBar + Workspace Content */}
      <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden">
        <TopBar
          activeItem={activeItem}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          rightPanelOpen={rightPanelOpen}
          onToggleRightPanel={() => setRightPanelOpen((prev) => !prev)}
        />

        <div className="flex flex-1 h-[calc(100vh-3.5rem)] overflow-hidden relative">
          {/* Main Content Workspace */}
          <WorkspaceContent activeItem={activeItem} />

          {/* Desktop Right Panel (shown only when rightPanelOpen and screen is lg+) */}
          {rightPanelOpen && (
            <div className="hidden lg:flex h-full">
              <RightPanel
                open={rightPanelOpen}
                onClose={() => setRightPanelOpen(false)}
              />
            </div>
          )}

          {/* Mobile / Tablet Right Panel Slide-over Drawer */}
          {rightPanelOpen && (
            <div className="fixed inset-0 z-40 flex justify-end lg:hidden">
              <div
                className="fixed inset-0 bg-black/25 backdrop-blur-xs transition-opacity"
                onClick={() => setRightPanelOpen(false)}
                aria-hidden="true"
              />
              <div className="relative w-full max-w-sm sm:max-w-md h-full bg-[#f6f5f4] shadow-2xl z-10 animate-in slide-in-from-right duration-200">
                <RightPanel open={true} onClose={() => setRightPanelOpen(false)} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
