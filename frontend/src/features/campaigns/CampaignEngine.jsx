import React, { useState } from 'react';
import { systemService } from '../../core/api';
import { Zap, Loader2, Target, MessageSquare, Copy, CheckCircle } from 'lucide-react';

export default function CampaignEngine() {
  const [config, setConfig] = useState({
    targetId: '',
    platform: 'twitter',
    tone: 'aggressive'
  });
  
  const [status, setStatus] = useState('idle'); // idle | generating | success | error
  const [campaignResult, setCampaignResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!config.targetId) return;

    setStatus('generating');
    setCampaignResult(null);

    try {
      // Trigger backend compilation
      const response = await systemService.generateCampaign(config);
      
      setCampaignResult(response.data || response.campaign || response);
      setStatus('success');
    } catch (error) {
      console.error("Campaign generation failed:", error);
      setCampaignResult({ error: error.response?.data?.error || 'Engine failed to compile campaign.' });
      setStatus('error');
    }
  };

  const copyToClipboard = () => {
    if (!campaignResult) return;
    const textToCopy = typeof campaignResult === 'string' 
      ? campaignResult 
      : JSON.stringify(campaignResult, null, 2);
      
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Configuration Panel */}
      <div className="lg:col-span-1 bg-gray-900 border border-gray-800 rounded-lg p-6 shadow-xl h-fit">
        <div className="flex items-center space-x-3 mb-6 border-b border-gray-800 pb-4">
          <Target className="text-blue-500 w-5 h-5" />
          <h2 className="text-lg font-mono text-gray-100">Parameters</h2>
        </div>

        <form onSubmit={handleGenerate} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-mono text-gray-400">TARGET PRODUCT ID / URL</label>
            <input
              type="text"
              value={config.targetId}
              onChange={(e) => setConfig({ ...config, targetId: e.target.value })}
              placeholder="e.g. ASIN or full URL"
              className="w-full bg-gray-800 border border-gray-700 text-gray-200 rounded px-3 py-2 focus:outline-none focus:border-blue-500 font-mono text-sm"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono text-gray-400">DISTRIBUTION VECTOR</label>
            <select
              value={config.platform}
              onChange={(e) => setConfig({ ...config, platform: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 text-gray-200 rounded px-3 py-2 focus:outline-none focus:border-blue-500 font-mono text-sm"
            >
              <option value="twitter">X / Twitter Thread</option>
              <option value="email">Email Newsletter</option>
              <option value="blog">SEO Blog Post</option>
              <option value="sms">SMS Blast</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono text-gray-400">COPY TONE</label>
            <select
              value={config.tone}
              onChange={(e) => setConfig({ ...config, tone: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 text-gray-200 rounded px-3 py-2 focus:outline-none focus:border-blue-500 font-mono text-sm"
            >
              <option value="aggressive">High-Urgency / Aggressive</option>
              <option value="analytical">Data-Driven / Analytical</option>
              <option value="story">Narrative / Storytelling</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={status === 'generating'}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-mono text-sm px-6 py-3 rounded transition-colors flex items-center justify-center mt-4"
          >
            {status === 'generating' ? (
              <><Loader2 className="w-5 h-5 animate-spin mr-2" /> COMPILING...</>
            ) : (
              <><Zap className="w-5 h-5 mr-2" /> GENERATE CAMPAIGN</>
            )}
          </button>
        </form>
      </div>

      {/* Output Matrix */}
      <div className="lg:col-span-2 bg-black border border-gray-800 rounded-lg flex flex-col shadow-inner min-h-[500px]">
        <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900/50">
          <div className="flex items-center space-x-2">
            <MessageSquare className="text-gray-400 w-4 h-4" />
            <span className="font-mono text-sm text-gray-400">ENGINE.OUTPUT</span>
          </div>
          
          <button 
            onClick={copyToClipboard}
            disabled={!campaignResult || status === 'error'}
            className="text-gray-400 hover:text-white disabled:opacity-50 transition-colors focus:outline-none"
            title="Copy to clipboard"
          >
            {copied ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto font-mono text-sm">
          {status === 'idle' && (
            <div className="h-full flex items-center justify-center text-gray-600 border-2 border-dashed border-gray-800 rounded-lg">
              Awaiting parameters for generation.
            </div>
          )}
          
          {status === 'generating' && (
            <div className="h-full flex flex-col items-center justify-center text-blue-500 space-y-4">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="animate-pulse">Processing context and formatting assets...</span>
            </div>
          )}

          {status === 'error' && (
            <div className="text-red-500 bg-red-500/10 p-4 rounded border border-red-500/20">
              [CRITICAL ERROR]: {campaignResult?.error || 'Generation aborted.'}
            </div>
          )}

          {status === 'success' && campaignResult && (
            <div className="text-gray-200 whitespace-pre-wrap">
              {typeof campaignResult === 'string' 
                ? campaignResult 
                : JSON.stringify(campaignResult, null, 2)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}