import React, { useState } from 'react';
import { Header } from './components/Header';
import { TwinGenerator } from './components/TwinGenerator';
import { VeoAnimator } from './components/VeoAnimator';
import { Gallery } from './components/Gallery';
import { AppMode, GeneratedMedia } from './types';

function App() {
  const [mode, setMode] = useState<AppMode>(AppMode.GENERATE);
  const [gallery, setGallery] = useState<GeneratedMedia[]>([]);
  const [imageToAnimate, setImageToAnimate] = useState<GeneratedMedia | null>(null);

  const handleMediaGenerated = (media: GeneratedMedia) => {
    setGallery(prev => [media, ...prev]);
  };

  const handleAnimateRequest = (media: GeneratedMedia) => {
    setImageToAnimate(media);
    setMode(AppMode.ANIMATE);
  };

  return (
    <div className="min-h-screen pb-20">
      <Header currentMode={mode} onNavigate={setMode} />
      
      <main className="mt-8">
        {mode === AppMode.GENERATE && (
          <TwinGenerator 
            onMediaGenerated={handleMediaGenerated}
            onAnimateRequest={handleAnimateRequest}
          />
        )}
        
        {mode === AppMode.ANIMATE && (
          <VeoAnimator 
            initialImage={imageToAnimate}
            onMediaGenerated={handleMediaGenerated}
          />
        )}

        {mode === AppMode.GALLERY && (
          <Gallery items={gallery} />
        )}
      </main>

      <footer className="text-center py-8 text-white text-sm font-serif opacity-90">
        Digital Beauty AI Studio • Jay-Jill Cosmetics, LLC ™ • Built with Gemini 3 Pro & Veo
      </footer>
    </div>
  );
}

export default App;