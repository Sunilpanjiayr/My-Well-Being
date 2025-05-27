// src/contexts/SidebarContext.js - CREATE THIS NEW FILE

import React, { createContext, useState, useContext } from 'react';

const SidebarContext = createContext();

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}

export function SidebarProvider({ children }) {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleSidebar = () => {
    setIsExpanded(prev => !prev);
  };

  const value = {
    isExpanded,
    toggleSidebar,
    sidebarWidth: isExpanded ? 260 : 70
  };

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
}