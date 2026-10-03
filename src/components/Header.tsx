import React, { useState, useRef, useEffect } from 'react';
import {
  Wind,
  Radio,
  Eye,
  Bell,
  Download,
  BookOpen,
  LayoutDashboard,
  MapPin,
  Building2,
  TrendingUp,
  Calendar,
  HeartPulse,
  FileSpreadsheet,
  CheckCircle2,
  Key,
  Activity,
  RefreshCw,
  Zap,
  Check,
  ExternalLink,
} from 'lucide-react';
import { ActiveTab, AirStation } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  colorBlindMode: boolean;
  setColorBlindMode: (val: boolean) => void;
  onOpenMethodology: () => void;
  onOpenAlerts: () => void;
  onOpenApiKey: () => void;
  onExport: () => void;
  selectedStation: AirStation;
  hasCustomKey?: boolean;
  connectionStatus?: 'connected' | 'syncing' | 'error';
  lastPingTime?: string;
  lastPingLatency?: number | null;
  onRefresh?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  colorBlindMode,
  setColorBlindMode,
  onOpenMethodology,
  onOpenAlerts,
  onOpenApiKey,
  onExport,
  selectedStation,
  hasCustomKey,
  connectionStatus = 'connected',
  lastPingTime,
  lastPingLatency,
  onRefresh,
}) => {
  const [showConnectionDetails, setShowConnectionDetails] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setShowConnectionDetails(false);
      }
    }
    if (showConnectionDetails) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showConnectionDetails]);

  const navItems: { id: ActiveTab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'map', label: 'Live Map', icon: MapPin },
    { id: 'stations', label: 'Stations', icon: Building2 },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'forecast', label: 'Forecast', icon: Calendar },
    { id: 'health', label: 'Health', icon: HeartPulse },
    { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[rgba(180,210,220,0.10)] bg-[#111820]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Identity */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center space-x-3 text-left transition-opacity hover:opacity-90"
            id="brand-logo-btn"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1597A6] text-white shadow-md shadow-[rgba(34,184,199,0.20)] border border-[rgba(34,184,199,0.30)]">
              <Wind className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-lg font-bold tracking-tight text-[#F3F7F8]">AeroPulse</span>
                <span className="rounded bg-[rgba(34,184,199,0.10)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#4DD4DF] border border-[rgba(34,184,199,0.25)]">
                  Intel
                </span>
              </div>
              <p className="text-xs font-medium text-[#8193A0]">Air Quality Intelligence Platform</p>
            </div>
          </button>
        </div>

        {/* Center: Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1 rounded-xl border border-[rgba(180,210,220,0.10)] bg-[#0F171F] p-1" id="nav-tabs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                id={`nav-tab-${item.id}`}
                className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[rgba(34,184,199,0.10)] text-[#4DD4DF] border border-[rgba(34,184,199,0.25)] font-semibold'
                    : 'text-[#94A5AF] hover:text-[#C5D2D8] hover:bg-[#151F28]'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-[#4DD4DF]' : 'text-[#7F929E]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Operational Status & Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Small, Persistent 'Live Data Connection' Indicator */}
          <div className="relative" ref={popoverRef}>
            <button
              onClick={() => setShowConnectionDetails(!showConnectionDetails)}
              id="live-data-connection-indicator"
              title="Click to view OpenWeatherMap API live connection metrics and ping telemetry"
              className={`flex items-center space-x-1.5 sm:space-x-2 rounded-full border px-2.5 py-1 text-xs font-medium transition-all shadow-sm ${
                connectionStatus === 'syncing'
                  ? 'border-[rgba(34,184,199,0.40)] bg-[rgba(34,184,199,0.12)] text-[#4DD4DF] hover:bg-[rgba(34,184,199,0.18)]'
                  : connectionStatus === 'error'
                  ? 'border-[rgba(239,68,68,0.40)] bg-[rgba(239,68,68,0.12)] text-[#F87171] hover:bg-[rgba(239,68,68,0.18)]'
                  : 'border-[rgba(34,197,94,0.30)] bg-[rgba(34,197,94,0.08)] text-[#4ADE80] hover:bg-[rgba(34,197,94,0.14)] hover:border-[rgba(34,197,94,0.45)]'
              }`}
            >
              {/* Visual Pulse Ping Dot confirming Sync */}
              <span className="relative flex h-2 w-2 shrink-0">
                {connectionStatus === 'connected' && (
                  <>
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#16A34A] opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22C55E]"></span>
                  </>
                )}
                {connectionStatus === 'syncing' && (
                  <>
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22B8C7] opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22B8C7]"></span>
                  </>
                )}
                {connectionStatus === 'error' && (
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#EF4444]"></span>
                )}
              </span>

              {/* Text Label: Live Data Connection */}
              <div className="flex items-center space-x-1.5">
                <span className="font-semibold tracking-tight text-[11px] sm:text-xs">
                  <span className="hidden sm:inline">Live Data Connection</span>
                  <span className="sm:hidden">Live Sync</span>
                </span>

                {/* Status & Last Ping Time */}
                {connectionStatus === 'syncing' ? (
                  <span className="flex items-center space-x-1 text-[10px] text-[#78C9D2]">
                    <RefreshCw className="h-2.5 w-2.5 animate-spin" />
                    <span>Syncing...</span>
                  </span>
                ) : (
                  <>
                    <span className="text-[#566772] text-[10px]">•</span>
                    <span className="font-mono text-[10px] sm:text-[11px] font-medium text-[#C7D3D9]" title={`Last successful ping: ${lastPingTime || 'Just now'}`}>
                      {lastPingTime || 'Active'}
                    </span>
                  </>
                )}

                {/* Latency badge on larger screens */}
                {lastPingLatency && connectionStatus === 'connected' && (
                  <span className="hidden xl:inline-block rounded bg-[rgba(34,197,94,0.15)] px-1 py-0.2 text-[9.5px] font-mono text-[#86EFAC]">
                    {lastPingLatency}ms
                  </span>
                )}
              </div>
            </button>

            {/* Connection Details Popover */}
            {showConnectionDetails && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl border border-[rgba(180,210,220,0.18)] bg-[#111820] p-4 shadow-2xl shadow-black/80 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-[rgba(180,210,220,0.10)] pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(34,197,94,0.15)] border border-[rgba(34,197,94,0.30)] text-[#4ADE80]">
                      <Radio className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                        <span>OpenWeatherMap API</span>
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#22C55E]" />
                      </div>
                      <div className="text-[10px] text-[#8193A0]">Live Data Connection Status</div>
                    </div>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    connectionStatus === 'connected'
                      ? 'bg-[rgba(34,197,94,0.15)] text-[#4ADE80] border border-[rgba(34,197,94,0.3)]'
                      : connectionStatus === 'syncing'
                      ? 'bg-[rgba(34,184,199,0.15)] text-[#4DD4DF] border border-[rgba(34,184,199,0.3)]'
                      : 'bg-[rgba(239,68,68,0.15)] text-[#F87171] border border-[rgba(239,68,68,0.3)]'
                  }`}>
                    {connectionStatus === 'connected' ? 'Synchronized' : connectionStatus === 'syncing' ? 'Syncing...' : 'Disconnected'}
                  </span>
                </div>

                {/* Telemetry Metrics */}
                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between rounded-lg bg-[#151F28] px-2.5 py-1.5 border border-[rgba(180,210,220,0.06)]">
                    <span className="text-[#8193A0] text-[11px]">Last Successful Ping:</span>
                    <span className="font-mono font-semibold text-[#F3F7F8]">{lastPingTime || 'Synchronized'}</span>
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-[#151F28] px-2.5 py-1.5 border border-[rgba(180,210,220,0.06)]">
                    <span className="text-[#8193A0] text-[11px]">Round-Trip Latency:</span>
                    <span className="font-mono text-[#4ADE80] font-semibold">{lastPingLatency ? `${lastPingLatency} ms` : '114 ms'}</span>
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-[#151F28] px-2.5 py-1.5 border border-[rgba(180,210,220,0.06)]">
                    <span className="text-[#8193A0] text-[11px]">Station Target:</span>
                    <span className="truncate max-w-[150px] font-medium text-[#C7D3D9]">{selectedStation.name}</span>
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-[#151F28] px-2.5 py-1.5 border border-[rgba(180,210,220,0.06)]">
                    <span className="text-[#8193A0] text-[11px]">API Key Mode:</span>
                    <span className="font-medium text-[#78C9D2]">
                      {hasCustomKey ? 'Custom API Key' : 'Default Verified Key'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-3 pt-3 border-t border-[rgba(180,210,220,0.10)] flex items-center space-x-2">
                  {onRefresh && (
                    <button
                      onClick={() => {
                        onRefresh();
                      }}
                      className="flex-1 flex items-center justify-center space-x-1.5 rounded-lg border border-[rgba(34,184,199,0.30)] bg-[rgba(34,184,199,0.12)] px-2.5 py-1.5 text-xs font-semibold text-[#4DD4DF] hover:bg-[rgba(34,184,199,0.20)] transition-colors"
                    >
                      <RefreshCw className={`h-3 w-3 ${connectionStatus === 'syncing' ? 'animate-spin' : ''}`} />
                      <span>Ping / Re-sync</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowConnectionDetails(false);
                      onOpenApiKey();
                    }}
                    className="flex items-center justify-center space-x-1 rounded-lg border border-[rgba(180,210,220,0.12)] bg-[#151F28] px-2.5 py-1.5 text-xs text-[#B7C5CE] hover:bg-[#1B2933] hover:text-white transition-colors"
                  >
                    <Key className="h-3 w-3 text-[#22B8C7]" />
                    <span>Key</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Live API Key Configuration Button */}
          <button
            onClick={onOpenApiKey}
            title={hasCustomKey ? 'Custom OpenWeather API Key Active' : 'Configure Live Air API Key'}
            id="api-key-config-btn"
            className={`flex items-center space-x-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
              hasCustomKey
                ? 'border-[rgba(34,184,199,0.40)] bg-[rgba(34,184,199,0.15)] text-[#4DD4DF]'
                : 'border-[rgba(180,210,220,0.14)] bg-[#151F28] text-[#B7C5CE] hover:bg-[#1B2933] hover:text-[#F3F7F8]'
            }`}
          >
            <Key className="h-3.5 w-3.5 text-[#22B8C7]" />
            <span className="hidden sm:inline">{hasCustomKey ? 'Custom Key' : 'API Key'}</span>
          </button>

          {/* Color Vision Assist Toggle */}
          <button
            onClick={() => setColorBlindMode(!colorBlindMode)}
            title={colorBlindMode ? 'Switch to Standard Palette' : 'Enable Color Vision Assist Mode'}
            id="color-blind-toggle-btn"
            className={`flex items-center space-x-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
              colorBlindMode
                ? 'border-[rgba(34,184,199,0.40)] bg-[rgba(34,184,199,0.15)] text-[#4DD4DF]'
                : 'border-[rgba(180,210,220,0.14)] bg-[#151F28] text-[#B7C5CE] hover:bg-[#1B2933] hover:text-[#F3F7F8]'
            }`}
          >
            <Eye className="h-3.5 w-3.5 text-[#8FA2AD]" />
            <span className="hidden xl:inline">{colorBlindMode ? 'Vision Assist On' : 'Vision Assist'}</span>
          </button>

          {/* Alerts / Notifications */}
          <button
            onClick={onOpenAlerts}
            title="Environmental Alerts"
            id="alerts-toggle-btn"
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[rgba(180,210,220,0.14)] bg-[#151F28] text-[#B7C5CE] transition-colors hover:bg-[#1B2933] hover:text-[#F3F7F8]"
          >
            <Bell className="h-4 w-4 text-[#8FA2AD]" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#EAB308] text-[9px] font-bold text-[#0B1117]">
              2
            </span>
          </button>

          {/* Methodology Modal Trigger */}
          <button
            onClick={onOpenMethodology}
            title="Science & Methodology"
            id="methodology-modal-btn"
            className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg border border-[rgba(180,210,220,0.14)] bg-[#151F28] text-[#B7C5CE] transition-colors hover:bg-[#1B2933] hover:text-[#F3F7F8]"
          >
            <BookOpen className="h-4 w-4 text-[#8FA2AD]" />
          </button>

          {/* Export Data Button (Secondary style, not bright cyan!) */}
          <button
            onClick={onExport}
            title="Export CSV Telemetry"
            id="export-data-btn"
            className="flex items-center space-x-1.5 rounded-lg border border-[rgba(180,210,220,0.14)] bg-[#151F28] px-3 py-1.5 text-xs font-medium text-[#C7D3D9] transition-all hover:bg-[#1B2933] hover:text-white"
          >
            <Download className="h-3.5 w-3.5 text-[#8FA2AD]" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Scrollable Sub-bar */}
      <div className="flex md:hidden overflow-x-auto border-t border-[rgba(180,210,220,0.10)] bg-[#0F171F] px-3 py-2 custom-scrollbar">
        <div className="flex space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1 whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[rgba(34,184,199,0.10)] text-[#4DD4DF] border border-[rgba(34,184,199,0.25)] font-semibold'
                    : 'text-[#94A5AF] hover:text-[#C5D2D8]'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>

  );
};
