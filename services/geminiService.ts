import { GoogleGenAI } from "@google/genai";

// Helper to get client with current key
const getClient = () => {
  // Always prefer process.env.API_KEY which might be injected by the environment or the key selector
  const apiKey = process.env.API_KEY; 
  if (!apiKey) {
    console.warn("API Key not found in process.env.API_KEY");
  }
  return new GoogleGenAI({ apiKey: apiKey || '' });
};

export const generateTwinImage = async (
  imagesBase64: string[],
  prompt: string
): Promise<string> => {
  const ai = getClient();
  
  // Construct a prompt that emphasizes "Twin" creation while respecting new categories
  const finalPrompt = `
    Create a high-end, hyper-realistic image featuring the IDENTICAL TWIN of the person in the reference image(s).
    
    CRITICAL INSTRUCTIONS:
    1. FACE: The face MUST be an identical match to the reference photo(s) (eyes, nose, mouth, bone structure).
    2. CONTEXT: Apply the following context/style settings strictly: ${prompt}
    3. QUALITY: 8k resolution, professional beauty photography, high fashion magazine aesthetic.
    
    If the context involves a luxury car or specific scene, place the Twin naturally within that environment.
    If the context involves makeup/hair, apply that specific style to the Twin while keeping the face recognizable.
  `;

  // Create image parts for all provided images
  const imageParts = imagesBase64.map(data => ({
    inlineData: {
      mimeType: 'image/jpeg',
      data: data
    }
  }));

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview', // High quality model for portraits
      contents: {
        parts: [
          ...imageParts,
          { text: finalPrompt }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: "3:4", // Portrait ratio ideal for beauty shots
          imageSize: "1K"
        }
      }
    });

    // Extract image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data returned from model.");
  } catch (error) {
    console.error("Gemini Image Generation Error:", error);
    throw error;
  }
};

export const generateVeoVideo = async (
  imageBase64: string,
  prompt: string,
  onProgress: (status: string) => void
): Promise<string> => {
  const ai = getClient();

  try {
    onProgress("Initiating video generation...");
    
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview', // Fast preview for better UX in demo
      image: {
        imageBytes: imageBase64,
        mimeType: 'image/png' // Assuming PNG input for simplicity, or handle generic
      },
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '9:16' // Vertical video for social media/influencers
      }
    });

    onProgress("Processing video (this may take a moment)...");

    // Polling loop
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
      onProgress("Still rendering...");
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) {
      throw new Error("Video generation completed but no URI returned.");
    }

    // Fetch the actual video bytes using the key
    const apiKey = process.env.API_KEY;
    const fetchUrl = `${videoUri}&key=${apiKey}`;
    
    // We can return the URL directly for the video tag if it's accessible, 
    // but often it's better to fetch and blob it to avoid auth issues in <video> src
    // However, for simplicity in this demo, let's try fetching to a blob.
    
    onProgress("Downloading video...");
    const vidResponse = await fetch(fetchUrl);
    if (!vidResponse.ok) throw new Error("Failed to download generated video file.");
    
    const blob = await vidResponse.blob();
    return URL.createObjectURL(blob);

  } catch (error) {
    console.error("Veo Generation Error:", error);
    throw error;
  }
};
