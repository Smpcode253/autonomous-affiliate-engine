import { useEffect } from 'react';
import { systemService } from '../../core/api';

export default function HealthPulse({ status }) {
  // Silent background polling every 30 seconds to ensure Railway backend hasn't slept
  useEffect(() => {
    if (status === 'offline') return; // Don't hammer a dead endpoint
    
    const interval = setInterval(() => {
      systemService.testConnection().catch(err => {
        console.error('Backend connection dropped:', err.message);
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [status]);

  return null; // Invisible mechanical component. Renders nothing to DOM.
}