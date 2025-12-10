export enum AppMode {
  GENERATE = 'GENERATE',
  ANIMATE = 'ANIMATE',
  GALLERY = 'GALLERY'
}

export type Category = 'Hair' | 'Makeup' | 'Nails' | 'Scene' | 'Wardrobe' | 'Luxury Cars' | 'General';

export interface GeneratedMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  prompt: string;
  timestamp: number;
  mimeType?: string;
  category?: Category;
}

export interface GenerationConfig {
  aspectRatio: string;
  imageSize: string;
  prompt: string;
}

export interface VeoConfig {
  prompt: string;
  aspectRatio: '16:9' | '9:16';
  resolution: '720p' | '1080p';
}