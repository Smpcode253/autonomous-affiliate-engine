import React, { useState } from 'react';
import { systemService } from '../../core/api';
import { Database, Link, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function ProductMatrix() {
  const [targetUrl, setTargetUrl] = useState('');
  const [platform, setPlatform] = useState('amazon');
  const [status, setStatus] = useState('idle'); // idle | ingesting | success | error
  const [ingestionLogs, setIngestionLogs] = useState([]);

  const handleIngest = async (e) => {
    e.preventDefault();
    if (!targetUrl) return;

    setStatus('ingesting');
    const payload = { url: targetUrl, platform };

    try {
      // Fire payload to Railway Backend
      const response = await systemService.ingestProducts(payload);
      
      setStatus('success');
      setIngestionLogs(prev => [{
        id: Date.now(),
        url: targetUrl,
        state: 'SUCCESS',
        message: response.message || 'Product cataloged securely.'
      }, ...prev]);
      
      setTargetUrl(''); // Clear buffer
    } catch (error) {
      setStatus('error');
      setIngestionLogs(prev => [{
        id: Date.now(),
        url: targetUrl,
        state: 'FAILED',
        message: error.response?.data?.error || 'Backend rejected payload.'
      }, ...prev]);
    }

    // Reset status indicator after 2 seconds
    setTimeout(() => setStatus('idle'), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Ingestion Console */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 shadow-xl">
        <div className="flex items-center space-x-3 mb-6 border-b border-gray-800 pb-4">
          <Database className="text-blue-500 w-6 h-6" />
          <h2 className="text-xl font-mono text-gray-100">Data Ingestion Matrix</h2>
        </div>

        <form onSubmit={handleIngest} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-gray-200 rounded px-4 py-2 focus:outline-none focus:border-blue-500 font-mono text-sm"
            >
              <option value="amazon">Amazon Associates</option>
              <option value="clickbank">ClickBank</option>
              <option value="custom">Custom URL</option>
            </select>

            <div className="relative flex-1">
              <Link className="absolute left-3 top-2.5 text-gray-500 w-5 h-5" />
              <input
                type="url"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="Enter target product URL..."
                className="w-full bg-gray-800 border border-gray-700 text-gray-200 rounded pl-10 pr-4 py-2 focus:outline-none focus:border-blue-500 font-mono text-sm placeholder-gray-600"
                required
              />
            </div>

            <button
              type="submit"
              disabled={status === 'ingesting'}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-mono text-sm px-6 py-2 rounded transition-colors flex items-center justify-center min-w-[140px]"
            >
              {status === 'ingesting' ? <Loader2 className="w-5 h-5 animate-spin" /> : 'EXECUTE INGEST'}
            </button>
          </div>
        </form>
      </div>

      {/* System Output Logs */}
      <div className="bg-black border border-gray-800 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm shadow-inner">
        <h3 className="text-gray-500 mb-4 sticky top-0 bg-black pb-2 border-b border-gray-900">
          // PIPELINE ACTIVITY LOG
        </h3>
        {ingestionLogs.length === 0 ? (
          <p className="text-gray-700">Awaiting data input...</p>
        ) : (
          <div className="space-y-2">
            {ingestionLogs.map(log => (
              <div key={log.id} className="flex items-start space-x-3 p-2 rounded bg-gray-900/50">
                {log.state === 'SUCCESS' ? (
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1 truncate">
                  <span className={log.state === 'SUCCESS' ? 'text-green-500' : 'text-red-500'}>
                    [{log.state}]
                  </span>
                  <span className="text-gray-400 ml-2">{log.message}</span>
                  <div className="text-gray-600 text-xs truncate mt-1">Target: {log.url}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}