import React, { useState, useEffect } from 'react';
import { fetchSchedulerStatus, triggerScheduler } from '../services/api';
import { X, Bell, Send, CheckCircle2, Clock, Sparkles } from 'lucide-react';

interface AlertSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAlertSent?: () => void;
}

export const AlertSettingsModal: React.FC<AlertSettingsModalProps> = ({ isOpen, onClose }) => {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [runningTest, setRunningTest] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const loadStatus = async () => {
    try {
      await fetchSchedulerStatus();
    } catch (e) {
      console.error('Failed to load scheduler status', e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadStatus();
      // Load saved webhook from localStorage if any
      const saved = localStorage.getItem('growth_stock_discord_webhook');
      if (saved) setWebhookUrl(saved);
    }
  }, [isOpen]);

  const handleSaveWebhook = (url: string) => {
    setWebhookUrl(url);
    localStorage.setItem('growth_stock_discord_webhook', url);
  };

  const handleRunNow = async () => {
    setRunningTest(true);
    setTestResult(null);
    try {
      const res = await triggerScheduler('ALL', 15.0, 15.0, webhookUrl);
      setTestResult(res);
      loadStatus();
    } catch (e: any) {
      setTestResult({ status: 'error', message: e.message });
    } finally {
      setRunningTest(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Free Automated Screening & Alerts</h2>
              <p className="text-xs text-slate-400">
                100% Free Discord Webhook push alerts triggered post-market close
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto text-xs">
          {/* Schedule Status Card */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 text-slate-200 font-semibold mb-3">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Automated Background Schedule (Active)</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <span>🇲🇾 Bursa Malaysia Close</span>
                </div>
                <div className="text-emerald-400 font-mono mt-1 font-bold">17:15 MYT (Mon–Fri)</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Runs 15 mins after 17:00 closing bell</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <span>🇺🇸 US Equities Close</span>
                </div>
                <div className="text-blue-400 font-mono mt-1 font-bold">16:30 EDT (Mon–Fri)</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Runs 30 mins after 16:00 closing bell</div>
              </div>
            </div>
          </div>

          {/* Discord Webhook Configuration */}
          <div>
            <label className="block text-slate-200 font-semibold mb-1">
              Discord Webhook URL (Free Push Notifications)
            </label>
            <p className="text-[11px] text-slate-400 mb-2">
              Create a free Discord channel $\to$ <em>Channel Settings</em> $\to$ <em>Integrations</em> $\to$ <em>Webhooks</em> $\to$ paste the URL below.
              If left blank, alerts are safely simulated in the backend logs at zero cost.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="https://discord.com/api/webhooks/..."
                value={webhookUrl}
                onChange={(e) => handleSaveWebhook(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Test Trigger Button */}
          <div className="bg-gradient-to-r from-indigo-950/30 to-purple-950/30 p-4 rounded-xl border border-indigo-500/20">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  Test Automated Screener & Alerts Right Now
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Runs the full pipeline across US and Bursa stocks and dispatches TradingAgents dossiers.
                </p>
              </div>

              <button
                onClick={handleRunNow}
                disabled={runningTest}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5 whitespace-nowrap disabled:opacity-50"
              >
                <Send className={`w-3.5 h-3.5 ${runningTest ? 'animate-bounce' : ''}`} />
                <span>{runningTest ? 'Screening...' : 'Trigger Run Now'}</span>
              </button>
            </div>

            {testResult && (
              <div className="mt-4 p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs">
                <div className="text-emerald-400 font-semibold flex items-center gap-1 mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Execution Complete!</span>
                </div>
                <div className="text-slate-300">
                  Scanned: <strong>{testResult.summary?.scannedCount}</strong> stocks | 
                  Qualifying: <strong>{testResult.summary?.qualifyingCount}</strong> stocks | 
                  Duration: <strong>{testResult.summary?.durationSeconds}s</strong>
                </div>
                {testResult.summary?.alertsDispatched?.length > 0 && (
                  <div className="mt-2 text-[11px] text-slate-400">
                    Dispatched alerts for:{' '}
                    {testResult.summary.alertsDispatched.map((a: any) => (
                      <span key={a.ticker} className="inline-block px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 mr-1 font-mono">
                        {a.ticker} ({a.score}/100)
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
