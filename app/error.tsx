'use client';
import { useEffect } from 'react';
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-navy">
      <div className="text-center space-y-4 px-6">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
          style={{ background:'rgba(239,68,68,0.09)', border:'1px solid rgba(239,68,68,0.18)' }}>
          <span className="text-2xl">⚠</span>
        </div>
        <h2 className="text-lg font-semibold" style={{ color:'rgba(255,255,255,0.80)' }}>Something went wrong</h2>
        <p className="text-sm" style={{ color:'rgba(255,255,255,0.30)' }}>{error.message}</p>
        <button onClick={reset} className="btn-primary px-6 py-2.5 rounded-xl text-sm font-semibold">Try again</button>
      </div>
    </div>
  );
}
