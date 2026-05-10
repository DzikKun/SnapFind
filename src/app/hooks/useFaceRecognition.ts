import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface FaceMatch {
  photoId: string;
  similarity: number;
  url: string;
}

export interface SearchResult {
  eventId: string;
  matchedFaces: number;
  matches: FaceMatch[];
}

export const useFaceRecognition = () => {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Simulasi loading model agar UI tidak error
    const timer = setTimeout(() => {
      setIsModelLoaded(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const searchSimilarFaces = async (queryImage: File, eventId: string): Promise<SearchResult | null> => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('eventId', eventId);
      formData.append('file', queryImage);

      const response = await fetch('http://localhost:4000/api/search', {
        method: 'POST',
        // PENTING: Jangan tambahkan Headers Content-Type!
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal melakukan pencarian');
      }

      return await response.json();
    } catch (error) {
      console.error('Error in search:', error);
      toast.error('Gagal terhubung ke server pencarian');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isModelLoaded,
    isLoading,
    searchSimilarFaces,
  };
};