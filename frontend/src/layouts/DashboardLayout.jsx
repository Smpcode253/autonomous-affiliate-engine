import React, { useState } from 'react';
import { Database, Zap, Activity, Menu, X } from 'lucide-react';

export default function DashboardLayout({ children, status, setModule }) {
  const [activeTab, setActiveTab] = useState('ingest');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (moduleKey) => {
    setActiveTab(moduleKey);
    setModule(moduleKey);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-black text-gray-200 font-sans flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-800 bg-gray-950">
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-blue-500" />
          <span className="font-mono font-bold tracking-tight">AUTO_AFFILIATE</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-400 focus:outline-none">
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <nav className={`
        ${mobileMenuOpen ? 'block' : 'hidden'} 
        md:block w-full md:w-64 bg-gray-950 border-r border-gray-800 flex-shrink-0 flex-col
      `}>
        <div className="hidden md:flex items-center space-x-2 p-6 border-b border-gray-800">
          <Zap className="w-6 h-6 text-blue-500" />
          <span className="font-mono font-bold tracking-tight text-lg">AUTO_AFFILIATE</span>
        </div>

        <div className="p-4 space-y-2 flex-grow">
          <button
            onClick={() => handleNav('ingest')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded font-mono text-sm transition-all ${
              activeTab === 'ingest' ? 'bg-blue-600/10 text-blue-400 border border-blue-500/30' : 'text-gray-400 hover:bg-gray-900 hover:text-gray-200 border border-transparent'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Data Ingestion</span>
          </button>

          <button
            onClick={() => handleNav('campaign')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded font-mono text-sm transition-all ${
              activeTab === 'campaign' ? 'bg-blue-600/10 text-blue-400 border border-blue-500/30' : 'text-gray-400 hover:bg-gray-900 hover:text-gray-200 border border-transparent'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Campaign Engine</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Diagnostic Bar */}
        <header className="h-14 border-b border-gray-800 bg-gray-900/50 flex items-center justify-end px-6 flex-shrink-0">
          <div className="flex items-center space-x-2 font-mono text-xs">
            <span className="text-gray-500">SYSTEM.STATE:</span>
            {status === 'online' ? (
              <span className="text-green-500 flex items-center"><Activity className="w-3 h-3 mr-1" /> OPTIMAL</span>
            ) : status === 'offline' ? (
              <span className="text-red-500 flex items-center"><X className="w-3 h-3 mr-1" /> DISCONNECTED</span>
            ) : (
              <span className="text-yellow-500 animate-pulse">CONNECTING...</span>
            )}
          </div>
        </header>

        {/* Viewport Injection */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}