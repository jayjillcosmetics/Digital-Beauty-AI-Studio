import React, { useState, useEffect } from 'react';

// Removed conflicting global declaration for window.aistudio to resolve TypeScript error.
// We will access aistudio via (window as any) to ensure compatibility with existing global types.

interface ApiKeySelectorProps {
  onKeySelected: () => void;
}

export const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onKeySelected }) => {
  const [hasKey, setHasKey] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkKey = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio) {
      const selected = await aistudio.hasSelectedApiKey();
      setHasKey(selected);
      if (selected) {
        onKeySelected();
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    checkKey();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConnect = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio) {
      try {
        await aistudio.openSelectKey();
        // Assuming success if no error thrown
        setHasKey(true);
        onKeySelected();
      } catch (error) {
        console.error("Key selection failed or cancelled", error);
        // Reset state if needed
        setHasKey(false);
      }
    } else {
        alert("AI Studio environment not detected. Please run in a compatible environment.");
    }
  };

  if (loading) return null;

  if (hasKey) {
    return (
      <div className="bg-green-50 text-green-800 text-xs px-2 py-1 rounded-full flex items-center gap-1 border border-green-200">
        <span className="w-2 h-2 rounded-full bg-green-500"></span>
        API Key Active
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end">
        <button
          onClick={handleConnect}
          className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold py-2 px-4 rounded-full shadow-lg transition-all duration-300 animate-pulse flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          Connect Billing for Veo
        </button>
        <p className="text-[10px] text-slate-500 mt-1 max-w-[200px] text-right">
          Required for high-res video generation. 
          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="underline ml-1 text-brand-500">Learn more</a>
        </p>
    </div>
  );
};