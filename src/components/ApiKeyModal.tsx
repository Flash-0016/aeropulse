import React, { useState } from 'react';
import { Key, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, Trash2, X, ExternalLink } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveKey: (key: string) => void;
  onRemoveKey: () => void;
  onTestKey: (key: string) => Promise<{ success: boolean; message: string }>;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveKey,
  onRemoveKey,
  onTestKey,
}) => {
  const [inputVal, setInputVal] = useState(apiKey);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: '',
  });

  if (!isOpen) return null;

  const handleTest = async () => {
    if (!inputVal.trim()) {
      setTestResult({ type: 'error', message: 'Please enter an API key to verify.' });
      return;
    }
    setIsTesting(true);
    setTestResult({ type: 'idle', message: '' });

    try {
      const res = await onTestKey(inputVal.trim());
      if (res.success) {
        setTestResult({ type: 'success', message: res.message || 'API key validated successfully! Ready for live stream.' });
      } else {
        setTestResult({ type: 'error', message: res.message || 'Verification failed. Please check the key.' });
      }
    } catch {
      setTestResult({ type: 'error', message: 'Network or validation error occurred.' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    onSaveKey(inputVal.trim());
    onClose();
  };

  const handleClear = () => {
    setInputVal('');
    onRemoveKey();
    setTestResult({ type: 'idle', message: '' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in-50">
      <div
        className="relative w-full max-w-lg rounded-2xl border border-[rgba(180,210,220,0.14)] bg-[#101922] p-6 shadow-2xl space-y-5 text-[#F3F7F8]"
        id="api-key-modal"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[rgba(180,210,220,0.10)] pb-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(34,184,199,0.12)] text-[#4DD4DF] border border-[rgba(34,184,199,0.30)]">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#F3F7F8]">Live Air Quality API Configuration</h2>
              <p className="text-xs text-[#8193A0]">
                Configure your OpenWeatherMap Air Pollution API Key for live station telemetry.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#8193A0] hover:bg-[#151F28] hover:text-[#F3F7F8] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Status Callout */}
        <div className="rounded-xl border border-[rgba(180,210,220,0.10)] bg-[#131D26] p-3.5 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#8193A0]">Active Telemetry Source:</span>
            <span className="font-semibold text-[#4DD4DF]">
              {apiKey ? 'Custom User API Key Active' : 'Live Dual-Stream Telemetry (Connected)'}
            </span>
          </div>
          <p className="text-[#B7C5CE] leading-relaxed">
            The platform synthesizes live continuous ambient readings (OpenWeatherMap + High-Resolution Atmospheric Mesh) to report accurate, current AQI and pollutant concentrations (PM2.5, PM10, NO2, O3, CO, SO2) according to official CPCB IN-NAQI & US-EPA standards.
          </p>
        </div>

        {/* Input Field */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#8193A0]">
            OpenWeatherMap API Key (Air Pollution & Weather)
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="e.g. your_32_character_api_key_here"
              value={inputVal}
              onChange={(e) => {
                setInputVal(e.target.value);
                setTestResult({ type: 'idle', message: '' });
              }}
              className="w-full rounded-xl border border-[rgba(180,210,220,0.14)] bg-[#0B1117] py-2.5 pl-3.5 pr-24 font-mono text-xs text-[#F3F7F8] placeholder-[#566772] focus:border-[#22B8C7] focus:outline-none"
            />
            <button
              onClick={handleTest}
              disabled={isTesting || !inputVal.trim()}
              className="absolute right-1.5 top-1.5 flex items-center space-x-1 rounded-lg border border-[rgba(34,184,199,0.30)] bg-[rgba(34,184,199,0.10)] px-2.5 py-1 text-xs font-medium text-[#4DD4DF] hover:bg-[rgba(34,184,199,0.20)] disabled:opacity-40 transition-colors"
            >
              {isTesting ? (
                <>
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  <span>Testing</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-3 w-3" />
                  <span>Verify</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Test Result Message */}
        {testResult.type !== 'idle' && (
          <div
            className={`flex items-start space-x-2 rounded-xl p-3 text-xs border ${
              testResult.type === 'success'
                ? 'bg-[rgba(22,163,74,0.12)] border-[rgba(22,163,74,0.35)] text-[#4ADE80]'
                : 'bg-[rgba(239,68,68,0.12)] border-[rgba(239,68,68,0.35)] text-[#F87171]'
            }`}
          >
            {testResult.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-[#4ADE80]" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-[#F87171]" />
            )}
            <span>{testResult.message}</span>
          </div>
        )}

        {/* Free API Key info link */}
        <div className="flex items-center justify-between text-xs text-[#8193A0] pt-1">
          <span>Need a free OpenWeatherMap key?</span>
          <a
            href="https://home.openweathermap.org/api_keys"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 text-[#22B8C7] hover:underline"
          >
            <span>Get Free Key</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between border-t border-[rgba(180,210,220,0.10)] pt-4">
          {apiKey ? (
            <button
              onClick={handleClear}
              className="flex items-center space-x-1.5 rounded-lg border border-[rgba(239,68,68,0.30)] bg-[rgba(239,68,68,0.10)] px-3 py-1.5 text-xs font-semibold text-[#F87171] hover:bg-[rgba(239,68,68,0.20)] transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Reset to Default</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="rounded-lg border border-[rgba(180,210,220,0.14)] bg-[#151F28] px-3.5 py-1.5 text-xs font-semibold text-[#C7D3D9] hover:bg-[#1B2933] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="rounded-lg bg-[#1AA7B5] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#22B8C7] transition-colors shadow-sm"
            >
              Save Key & Refresh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
