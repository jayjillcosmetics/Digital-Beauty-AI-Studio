import React, { useState } from 'react';
import { GeneratedMedia, Category } from '../types';
import { generateVeoVideo } from '../services/geminiService';
import { ApiKeySelector } from './ApiKeySelector';

interface VeoAnimatorProps {
  initialImage?: GeneratedMedia | null;
  onMediaGenerated: (media: GeneratedMedia) => void;
}

const MOTION_PRESETS = [
    "Slow motion hair flip and smile",
    "Walking confidently towards camera",
    "Stepping out of the luxury car",
    "Sipping champagne in slow motion",
    "Applying lip gloss in the mirror",
    "Turning head to look over shoulder",
    "Walking through falling snow",
    "City lights blurring in background"
];

const CINEMATIC_VIBES = [
    "Golden Hour Sun Flare",
    "Moody Night Club Neon",
    "Clean Bright Commercial",
    "Soft Dreamy Focus",
    "Paparazzi Flash"
];

export const VeoAnimator: React.FC<VeoAnimatorProps> = ({ initialImage, onMediaGenerated }) => {
  const [selectedImage, setSelectedImage] = useState<GeneratedMedia | null>(initialImage || null);
  const [prompt, setPrompt] = useState('');
  const [motionPreset, setMotionPreset] = useState('');
  const [vibe, setVibe] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [resultVideo, setResultVideo] = useState<string | null>(null);
  const [hasPaidKey, setHasPaidKey] = useState(false);

  const handleGenerate = async () => {
    if (!selectedImage) return;
    if (!hasPaidKey) {
        setError("Please connect a billing account to use high-quality video generation features.");
        return;
    }

    setLoading(true);
    setError(null);
    setStatus("Preparing scene...");

    try {
        const base64 = selectedImage.url.split(',')[1];
        if (!base64) throw new Error("Invalid image source.");

        // Construct enriched prompt
        let finalPrompt = motionPreset || prompt || "Subtle cinematic movement";
        if (vibe) finalPrompt += `, ${vibe} lighting and atmosphere`;
        if (prompt && motionPreset) finalPrompt += `. Details: ${prompt}`;

        const videoUrl = await generateVeoVideo(base64, finalPrompt, (s) => setStatus(s));
        
        setResultVideo(videoUrl);
        
        const category: Category = selectedImage.category || 'Scene';

        onMediaGenerated({
            id: crypto.randomUUID(),
            type: 'video',
            url: videoUrl,
            prompt: finalPrompt,
            timestamp: Date.now(),
            category: category
        });
        setStatus("Complete!");
    } catch (err: any) {
        setError(err.message || "Failed to generate video.");
    } finally {
        setLoading(false);
    }
  };

  const handleKeySelected = () => {
    setHasPaidKey(true);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
       <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-serif font-black text-white">Veo Motion Studio</h2>
            <p className="text-white/70 text-sm">Bring your digital twins to life with cinematic motion.</p>
          </div>
          <ApiKeySelector onKeySelected={handleKeySelected} />
       </div>

       {!hasPaidKey && (
         <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-xl flex items-start gap-3 animate-pulse">
            <svg className="w-6 h-6 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <div>
                <p className="font-bold">Billing Required</p>
                <p className="text-sm">Video generation with Veo requires a paid Google Cloud project. Please click "Connect Billing" above.</p>
            </div>
         </div>
       )}

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* Controls */}
           <div className="space-y-6">
               <div className="glass-panel p-6 rounded-3xl shadow-lg border-t-4 border-[#dc143c]">
                   <h3 className="text-lg font-bold text-brand-900 mb-4 flex items-center gap-2">
                       <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-500 flex items-center justify-center text-xs">1</span>
                       Source Asset
                   </h3>
                   {selectedImage ? (
                       <div className="relative rounded-xl overflow-hidden border border-brand-200 group">
                           <img src={selectedImage.url} alt="Source" className="w-full h-64 object-cover" />
                           <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm font-bold">
                               {selectedImage.category || 'Source'}
                           </div>
                       </div>
                   ) : (
                       <div className="h-64 bg-brand-50/50 rounded-xl border-2 border-dashed border-brand-200 flex flex-col items-center justify-center text-brand-400 gap-2">
                           <svg className="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                           <p className="text-sm">No image selected.</p>
                           <p className="text-xs text-brand-300">Generate one in the "Twin Generator" tab first.</p>
                       </div>
                   )}
               </div>

               <div className="glass-panel p-6 rounded-3xl shadow-lg border-t-4 border-[#dc143c]">
                   <h3 className="text-lg font-bold text-brand-900 mb-4 flex items-center gap-2">
                       <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-500 flex items-center justify-center text-xs">2</span>
                       Director's Prompt
                   </h3>

                   <div className="space-y-4">
                       <div>
                           <label className="block text-xs font-bold text-[#dc143c] uppercase tracking-wider mb-2">Motion Preset</label>
                           <select 
                               value={motionPreset} 
                               onChange={(e) => setMotionPreset(e.target.value)}
                               className="w-full p-3 rounded-xl border border-brand-100 bg-white text-sm text-brand-800 focus:ring-2 focus:ring-[#dc143c] focus:outline-none"
                               disabled={!hasPaidKey}
                           >
                               <option value="">-- Select Motion --</option>
                               {MOTION_PRESETS.map(p => <option key={p} value={p}>{p}</option>)}
                           </select>
                       </div>

                       <div>
                           <label className="block text-xs font-bold text-[#dc143c] uppercase tracking-wider mb-2">Cinematic Vibe</label>
                           <div className="flex flex-wrap gap-2">
                               {CINEMATIC_VIBES.map(v => (
                                   <button 
                                       key={v}
                                       onClick={() => setVibe(v === vibe ? '' : v)}
                                       className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                                           vibe === v 
                                           ? 'bg-[#dc143c] text-white border-[#dc143c]' 
                                           : 'bg-white text-brand-400 border-brand-100 hover:border-[#dc143c]'
                                       }`}
                                       disabled={!hasPaidKey}
                                   >
                                       {v}
                                   </button>
                               ))}
                           </div>
                       </div>

                       <div>
                           <label className="block text-xs font-bold text-[#dc143c] uppercase tracking-wider mb-2">Additional Instructions</label>
                           <textarea
                                disabled={!hasPaidKey}
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Specific details (e.g. 'Zoom in slowly', 'Leaves blowing in wind')..."
                                className="w-full bg-white/50 border border-brand-100 rounded-xl p-3 focus:ring-2 focus:ring-[#dc143c] focus:outline-none placeholder-brand-300 text-brand-900 resize-none h-20 disabled:opacity-50 text-sm"
                            />
                       </div>
                   </div>

                    <button
                        onClick={handleGenerate}
                        disabled={loading || !selectedImage || !hasPaidKey}
                        className="mt-6 w-full bg-gradient-to-r from-[#dc143c] to-[#b00b2b] text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-brand-300/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                         {loading ? (
                             <>
                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                {status || 'Rendering...'}
                             </>
                         ) : (
                             <>🎬 Render Video</>
                         )}
                    </button>
                    {error && (
                        <p className="mt-3 text-red-500 text-xs text-center border border-red-100 bg-red-50 p-2 rounded-lg">{error}</p>
                    )}
               </div>
           </div>

           {/* Preview */}
           <div className="glass-panel p-4 rounded-3xl shadow-2xl border-t-8 border-[#dc143c] bg-black/90 min-h-[500px] flex items-center justify-center">
                {resultVideo ? (
                    <div className="w-full h-full flex flex-col items-center animate-in fade-in duration-500">
                        <video 
                            src={resultVideo} 
                            controls 
                            autoPlay 
                            loop 
                            className="w-full max-h-[500px] rounded-xl shadow-2xl border border-white/10"
                        />
                        <a 
                            href={resultVideo} 
                            download={`twin-motion-${Date.now()}.mp4`}
                            className="mt-6 px-8 py-2 bg-white text-brand-900 rounded-full font-bold hover:bg-brand-50 transition shadow-lg flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                            Download Video
                        </a>
                    </div>
                ) : (
                    <div className="text-center opacity-40">
                         <div className="w-24 h-24 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center mx-auto mb-4">
                            <span className="text-4xl">▶️</span>
                         </div>
                         <p className="font-serif text-xl text-white">Motion Preview</p>
                         <p className="text-sm text-white/50 mt-2">Generated video will appear here</p>
                    </div>
                )}
           </div>
       </div>
    </div>
  );
};