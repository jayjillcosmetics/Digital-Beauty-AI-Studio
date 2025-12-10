import React, { useState, useRef } from 'react';
import { generateTwinImage } from '../services/geminiService';
import { GeneratedMedia, Category } from '../types';

interface TwinGeneratorProps {
  onMediaGenerated: (media: GeneratedMedia) => void;
  onAnimateRequest: (media: GeneratedMedia) => void;
}

const CATEGORIES: Category[] = ['Hair', 'Makeup', 'Nails', 'Scene', 'Wardrobe', 'Luxury Cars', 'General'];

const CATEGORY_PRESETS: Record<Category, string[]> = {
  'Hair': [
    'Voluminous 90s Blowout',
    'Sleek Glass Hair Bob',
    'Short Pixie Cut',
    'Long Flowing Layers',
    'Edgy Mohawk Style',
    'Natural Wavy Texture',
    'Chocolate with Blonde Highlights',
    'Platinum Blonde Beach Waves',
    'Textured Afro with Baby Hairs',
    'Honey Blonde Balayage',
    'Copper Red Layers',
    'High Fashion Ponytail',
    'Bohemian Braids'
  ],
  'Makeup': [
    'Clean Girl Aesthetic (Dewy)',
    'Full Matte Finish',
    'Sharp Cut Crease Eyeshadow',
    'Classic Red Lip & Winged Liner',
    'Soft Glam (Bridal)',
    'Smokey Eye Evening Look',
    'Avant-Garde Editorial',
    'Y2K Glossy Lip',
    'Matte Nude Monochrome',
    'Glass Skin Natural'
  ],
  'Nails': [
    'Long Stiletto Shape',
    'Classic Long Square',
    'Short Natural Round',
    'Glazed Donut Chrome',
    'Classic French Tip',
    'Deep Red Stiletto',
    'Milky White Almond',
    'Matte Black with Gold Foil',
    'Tortoise Shell Design',
    'Holiday Sparkle & Gems',
    'Neon Pop Art'
  ],
  'Scene': [
    'Winter Wonderland Aspen',
    'Luxury Rooftop Bar at Sunset',
    'High-End Spa Interior',
    'City Streets NYC/Paris',
    'Holiday Decorated Mansion',
    'Tropical Resort Poolside',
    'Minimalist Photo Studio',
    'Private Jet Cabin'
  ],
  'Wardrobe': [
    'Quiet Luxury Cashmere',
    'Silk Evening Gown',
    'Structured Power Suit',
    'White Lab Coat (Professional)',
    'Medical Scrubs (Chic & Fitted)',
    'Designer Streetwear',
    'Chic Winter Coat & Scarf',
    'Athleisure Yoga Set',
    'Cocktail Party Dress',
    'Haute Couture Runway',
    'Vintage Chanel Tweed Suit',
    'Red Carpet Gala Gown',
    'Old Money Tennis Aesthetic',
    'High-End Resort Wear',
    'Metallic Futurism Bodysuit',
    'Velvet Tuxedo Jacket',
    'Oversized Faux Fur Coat',
    'Parisian Chic Trench Coat'
  ],
  'Luxury Cars': [
    '2025 Cadillac Escalade (Black)',
    'Chevy Tahoe High Country',
    'Mercedes-Maybach S-Class Two-Tone',
    'Porsche 911 GT3 RS',
    'Rolls-Royce Cullinan',
    'Lamborghini Urus',
    'Range Rover Autobiography',
    'Bentley Continental GT',
    'Ferrari SF90 Stradale',
    'Bugatti Chiron',
    'Rolls-Royce Spectre',
    'Mercedes-AMG G63 (G-Wagon)',
    'Aston Martin DB12',
    'McLaren 750S',
    'BMW i7 M70',
    'Audi RS e-tron GT'
  ],
  'General': [
    'Portrait',
    'Full Body',
    'Close Up',
    'Studio Lighting',
    'Outdoor',
    'Cinematic',
    'Black and White',
    'Candid'
  ]
};

// Default fallback for General if added later
const DEFAULT_PRESETS: string[] = ['Portrait', 'Full Body', 'Close Up'];

const INSPIRATION_PROMPTS = [
  "Golden hour lighting with a soft dreamy haze, editorial fashion style.",
  "Cyberpunk neon city background, wet streets, futuristic vibe.",
  "Classic Hollywood glamour, black and white photography, high contrast.",
  "Ethereal forest setting with sunlight filtering through trees.",
  "Minimalist studio setting with dramatic side lighting.",
  "Vibrant pop-art colors, bold makeup, high energy.",
  "Snow falling softly around, cozy winter luxury aesthetic.",
  "Sunset on a private yacht, ocean breeze, lifestyle photography."
];

export const TwinGenerator: React.FC<TwinGeneratorProps> = ({ onMediaGenerated, onAnimateRequest }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [prompt, setPrompt] = useState('');
  const [category, setCategory] = useState<Category>('Hair');
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<GeneratedMedia | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Allow adding up to 4 images total
      const newFiles = Array.from(e.target.files);
      const remainingSlots = 4 - selectedFiles.length;
      const filesToAdd = newFiles.slice(0, remainingSlots);
      
      if (filesToAdd.length > 0) {
          // Explicitly cast to Blob or File to avoid 'unknown' type error in some TS environments
          const newUrls = filesToAdd.map((f: File) => URL.createObjectURL(f));
          setSelectedFiles(prev => [...prev, ...filesToAdd]);
          setPreviewUrls(prev => [...prev, ...newUrls]);
          setResultImage(null); // Reset result
      }
    }
  };

  const handleRemoveFile = (index: number, e: React.MouseEvent) => {
      e.stopPropagation();
      const newFiles = [...selectedFiles];
      const newUrls = [...previewUrls];
      
      URL.revokeObjectURL(newUrls[index]); // Cleanup
      newFiles.splice(index, 1);
      newUrls.splice(index, 1);
      
      setSelectedFiles(newFiles);
      setPreviewUrls(newUrls);
  };

  const handleCategoryChange = (newCat: Category) => {
    setCategory(newCat);
    setSelectedPreset(''); // Reset preset when category changes
  };

  const handleInspireMe = () => {
    const randomPrompt = INSPIRATION_PROMPTS[Math.floor(Math.random() * INSPIRATION_PROMPTS.length)];
    setPrompt(randomPrompt);
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
          const result = reader.result as string;
          // Remove Data URL prefix
          const base64 = result.split(',')[1];
          resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleGenerate = async () => {
    if (selectedFiles.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const base64Array = await Promise.all(selectedFiles.map(convertToBase64));
      
      // Construct a rich prompt based on inputs
      let fullPrompt = `Category: ${category}. `;
      if (selectedPreset) fullPrompt += `Style/Focus: ${selectedPreset}. `;
      if (prompt) fullPrompt += `Additional Details: ${prompt}`;

      const generatedDataUrl = await generateTwinImage(base64Array, fullPrompt);
      
      const newMedia: GeneratedMedia = {
        id: crypto.randomUUID(),
        type: 'image',
        url: generatedDataUrl,
        prompt: selectedPreset || prompt || "Twin generation",
        timestamp: Date.now(),
        category: category
      };

      setResultImage(newMedia);
      onMediaGenerated(newMedia);
    } catch (err: any) {
      setError(err.message || "Failed to generate twin image.");
    } finally {
      setLoading(false);
    }
  };

  const currentPresets = CATEGORY_PRESETS[category] || DEFAULT_PRESETS;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 rounded-3xl shadow-lg border-t-4 border-[#dc143c]">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-serif font-bold text-brand-900">1. Reference Client</h3>
                <span className="text-xs text-brand-400 font-bold bg-white/50 px-2 py-1 rounded-lg">
                    {selectedFiles.length}/4 Photos
                </span>
            </div>
            
            <div 
              className={`border-2 border-dashed border-brand-200 rounded-2xl p-4 text-center cursor-pointer hover:bg-brand-50 transition-colors group relative overflow-hidden min-h-[200px] flex flex-col items-center justify-center ${selectedFiles.length >= 4 ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => selectedFiles.length < 4 && fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                multiple
                className="hidden" 
                disabled={selectedFiles.length >= 4}
              />
              
              {previewUrls.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 w-full">
                    {previewUrls.map((url, idx) => (
                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden shadow-sm group/img">
                            <img src={url} alt={`Ref ${idx}`} className="w-full h-full object-cover" />
                            <button 
                                onClick={(e) => handleRemoveFile(idx, e)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover/img:opacity-100 transition-opacity"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    ))}
                    {selectedFiles.length < 4 && (
                        <div className="flex flex-col items-center justify-center bg-brand-50/50 rounded-lg aspect-square border border-brand-100 hover:bg-brand-100 transition-colors text-brand-400">
                             <span className="text-2xl">+</span>
                             <span className="text-xs">Add Photo</span>
                        </div>
                    )}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 py-8">
                  <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center text-brand-400 group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                  </div>
                  <div className="text-center">
                      <p className="text-brand-900 font-bold text-lg">Upload Photos</p>
                      <p className="text-sm text-brand-400">Upload up to 4 reference photos</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl shadow-lg space-y-5">
             <div className="flex justify-between items-center">
                 <h3 className="text-xl font-serif font-bold text-brand-900">2. Design Studio</h3>
             </div>

             {/* Categories */}
             <div>
                <label className="block text-xs font-bold text-[#dc143c] uppercase tracking-wider mb-2">Category</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => handleCategoryChange(cat)}
                            className={`px-2 py-2 rounded-lg text-xs font-bold transition-all truncate ${
                                category === cat 
                                ? 'bg-[#dc143c] text-white shadow-md' 
                                : 'bg-white border border-brand-100 text-brand-400 hover:bg-brand-50'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
             </div>

             {/* Style Presets */}
             <div>
                <label className="block text-xs font-bold text-[#dc143c] uppercase tracking-wider mb-2">Select Style / Object</label>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-brand-200">
                    {currentPresets.map((preset) => (
                        <button
                            key={preset}
                            onClick={() => setSelectedPreset(preset === selectedPreset ? '' : preset)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                                selectedPreset === preset
                                ? 'bg-brand-100 border-[#dc143c] text-brand-800 ring-1 ring-[#dc143c]'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-[#dc143c]'
                            }`}
                        >
                            {preset}
                        </button>
                    ))}
                </div>
             </div>

             {/* Custom Prompt */}
             <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-[#dc143c] uppercase tracking-wider">Custom Prompt</label>
                  <button 
                    onClick={handleInspireMe}
                    className="text-[10px] bg-brand-50 text-brand-600 px-2 py-1 rounded-full border border-brand-100 hover:bg-brand-100 transition-colors flex items-center gap-1 font-bold"
                  >
                    ✨ Magic Prompt
                  </button>
                </div>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={selectedPreset ? `Add details to ${selectedPreset}...` : "Describe the specific look, lighting, or details..."}
                    className="w-full bg-white/50 border border-brand-100 rounded-xl p-4 focus:ring-2 focus:ring-[#dc143c] focus:outline-none placeholder-brand-300 text-brand-900 resize-none h-24 text-sm"
                />
             </div>
             
             <button
                onClick={handleGenerate}
                disabled={loading || selectedFiles.length === 0}
                className={`w-full bg-[#dc143c] hover:bg-[#b00b2b] text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-brand-200 transition-all hover:shadow-brand-300 hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none flex items-center justify-center gap-2 ${loading ? 'cursor-wait' : ''}`}
            >
                {loading ? (
                    <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Designing Asset...</span>
                    </>
                ) : (
                    <>
                        <span>✨ Generate Twin</span>
                    </>
                )}
            </button>
             {error && (
                 <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs font-medium border border-red-100 text-center">
                     {error}
                 </div>
             )}
          </div>
        </div>

        {/* Right Column: Output */}
        <div className="lg:col-span-7">
            <div className="glass-panel p-8 rounded-3xl shadow-2xl border-t-8 border-[#dc143c] h-full min-h-[600px] flex flex-col items-center justify-center relative bg-white/60 backdrop-blur-sm">
            {resultImage ? (
                <div className="w-full h-full flex flex-col items-center animate-in fade-in duration-700">
                    <div className="relative p-3 bg-white rounded-2xl shadow-2xl transform rotate-1 hover:rotate-0 transition-transform duration-500 max-w-md">
                        <img src={resultImage.url} alt="Generated Twin" className="w-full h-auto rounded-lg" />
                        <div className="absolute -bottom-4 -right-4 bg-[#dc143c] text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex flex-col items-end">
                            <span>{resultImage.category}</span>
                            {selectedPreset && <span className="text-[10px] opacity-80 font-normal">{selectedPreset}</span>}
                        </div>
                    </div>
                    <div className="mt-10 flex flex-wrap justify-center gap-4">
                        <a 
                            href={resultImage.url} 
                            download={`twin-${Date.now()}.png`}
                            className="px-8 py-3 bg-white text-[#dc143c] rounded-full font-bold border border-brand-100 shadow-sm hover:bg-brand-50 hover:shadow-md transition-all flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                            Download
                        </a>
                        <button 
                            onClick={() => onAnimateRequest(resultImage)}
                            className="px-8 py-3 bg-gradient-to-r from-[#dc143c] to-[#b00b2b] text-white rounded-full font-bold shadow-lg hover:shadow-brand-300/50 hover:-translate-y-1 transition-all flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            Animate in Veo
                        </button>
                    </div>
                </div>
            ) : (
                <div className="text-center text-brand-900 opacity-60">
                    <div className="w-40 h-40 bg-gradient-to-tr from-brand-50 to-white rounded-full mx-auto mb-6 flex items-center justify-center border-4 border-brand-100 shadow-inner">
                        <span className="text-6xl filter grayscale opacity-50">💎</span>
                    </div>
                    <h3 className="text-3xl font-serif text-brand-900">Your Twin Awaits</h3>
                    <p className="text-brand-800/60 mt-2 font-medium">Select a category and style to begin</p>
                </div>
            )}
            </div>
        </div>
      </div>
    </div>
  );
};