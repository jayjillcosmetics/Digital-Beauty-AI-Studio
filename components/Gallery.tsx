import React, { useState, useEffect } from 'react';
import { GeneratedMedia, Category } from '../types';

interface GalleryProps {
  items: GeneratedMedia[];
  isLoading?: boolean;
}

const TABS: (Category | 'All')[] = ['All', 'Hair', 'Makeup', 'Nails', 'Scene', 'Wardrobe', 'Luxury Cars', 'General'];

export const Gallery: React.FC<GalleryProps> = ({ items, isLoading: externalLoading = false }) => {
  const [activeTab, setActiveTab] = useState<Category | 'All'>('All');
  const [isSwitching, setIsSwitching] = useState(false);

  // Simulate loading delay when switching tabs for better UX feel
  const handleTabChange = (tab: Category | 'All') => {
    if (tab === activeTab) return;
    setIsSwitching(true);
    setActiveTab(tab);
    setTimeout(() => setIsSwitching(false), 500);
  };

  const filteredItems = items.filter(item => {
    if (activeTab === 'All') return true;
    return item.category === activeTab;
  });

  const isLoading = externalLoading || isSwitching;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
       <div className="flex flex-col items-center mb-10">
           <h2 className="text-4xl font-serif font-black text-white mb-6 tracking-tight drop-shadow-md">Portfolio</h2>
           
           {/* Category Tabs */}
           <div className="w-full overflow-x-auto pb-4 hide-scrollbar flex justify-center">
               <div className="flex space-x-2 bg-white/90 backdrop-blur-sm p-2 rounded-full border border-gray-200 shadow-sm">
                   {TABS.map((tab) => (
                       <button
                           key={tab}
                           onClick={() => handleTabChange(tab)}
                           className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap border ${
                               activeTab === tab 
                               ? 'bg-black border-black text-white shadow-md transform scale-105' 
                               : 'bg-transparent border-transparent text-black hover:bg-gray-100 hover:border-gray-300'
                           }`}
                       >
                           {tab}
                       </button>
                   ))}
               </div>
           </div>
       </div>
       
       {isLoading ? (
           // Loading Skeleton Grid
           <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
               {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                   <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm h-0 pb-[133%] relative border-t-4 border-[#dc143c]">
                       <div className="absolute inset-0 bg-gray-50 flex items-center justify-center">
                           <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
                       </div>
                       <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
                           <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                           <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                       </div>
                   </div>
               ))}
           </div>
       ) : filteredItems.length === 0 ? (
           <div className="text-center py-24 bg-white/90 rounded-3xl border border-dashed border-gray-300 shadow-lg backdrop-blur-sm">
               <div className="text-5xl mb-4 opacity-50">📂</div>
               <p className="text-gray-900 font-bold text-lg">No Items Found</p>
               <p className="text-gray-500 text-sm">Create something amazing in the Generator to see it here.</p>
           </div>
       ) : (
           <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
               {filteredItems.map((item) => (
                   <div key={item.id} className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                       <div className="aspect-[3/4] overflow-hidden bg-gray-100 relative">
                           {item.type === 'video' ? (
                               <video src={item.url} className="w-full h-full object-cover" controls muted />
                           ) : (
                               <img src={item.url} alt={item.prompt} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" loading="lazy" />
                           )}
                           
                           <div className="absolute top-2 left-2 flex gap-1">
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm backdrop-blur-md ${item.type === 'video' ? 'bg-black text-white' : 'bg-white text-black'}`}>
                                    {item.type}
                                </span>
                                {item.category && (
                                    <span className="text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider bg-white/80 text-black shadow-sm backdrop-blur-md">
                                        {item.category}
                                    </span>
                                )}
                           </div>
                       </div>
                       
                       <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                            <p className="text-white text-xs line-clamp-2 mb-3 font-light">{item.prompt}</p>
                            <a 
                             href={item.url} 
                             download={`twinfluencer-${item.id}.${item.type === 'video' ? 'mp4' : 'png'}`}
                             className="block w-full text-center py-2 bg-white text-black text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors shadow-lg"
                           >
                             Download Asset
                           </a>
                       </div>
                   </div>
               ))}
           </div>
       )}
    </div>
  );
};