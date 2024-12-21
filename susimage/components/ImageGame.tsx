'use client'
import React, { useState, useEffect } from 'react';
import { createApi } from 'unsplash-js';

const unsplash = createApi({
  accessKey: process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || ''
});

const ImageGame = () => {
  const [score, setScore] = useState(0);
  const [totalPlayed, setTotalPlayed] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<{real: string | null, ai: string | null}>({
    real: null,
    ai: null
  });
  const [isLeftReal] = useState(Math.random() < 0.5);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setLoading(true);
    try {
      // Fetch real image
      const realImage = await unsplash.photos.getRandom({
        query: 'nature landscape',
        orientation: 'landscape'
      });
  
      // Generate AI image
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: "beautiful nature landscape, photorealistic, 4k" }),
      });
      
      const aiData = await response.json();
  
      if (!response.ok) {
        throw new Error(aiData.error || 'Failed to generate AI image');
      }
  
      if (realImage.response && aiData.url) {
        console.log('Setting images:', {
          real: realImage.response.urls.regular,
          ai: aiData.url
        });
        
        setImages({
          real: realImage.response.urls.regular,
          ai: aiData.url
        });
      } else {
        throw new Error('Failed to get both images');
      }
    } catch (error) {
      console.error('Failed to fetch images:', error);
      // Optionally show an error message to the user
    }
    setLoading(false);
  };

  const handleGuess = (guessedReal: boolean) => {
    const correct = guessedReal === isLeftReal;
    setIsCorrect(correct);
    setShowResult(true);
    setScore(prev => correct ? prev + 1 : prev);
    setTotalPlayed(prev => prev + 1);
  };

  const nextRound = async () => {
    setShowResult(false);
    setImages({ real: null, ai: null });
    await fetchImages();
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Real or AI?</h1>
          <p className="text-xl">Score: {score}/{totalPlayed}</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col">
              <div className="relative aspect-[4/3] bg-gray-900 rounded-t-lg overflow-hidden">
                {images.real && images.ai && (
                  <img 
                    src={isLeftReal ? images.real : images.ai} 
                    alt="Left image" 
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              {!showResult && (
                <button 
                  className="w-full p-4 bg-blue-600 hover:bg-blue-700 transition rounded-b-lg text-lg font-medium"
                  onClick={() => handleGuess(true)}
                >
                  This is the REAL image
                </button>
              )}
            </div>

            <div className="flex flex-col">
              <div className="relative aspect-[4/3] bg-gray-900 rounded-t-lg overflow-hidden">
                {images.real && images.ai && (
                  <img 
                    src={isLeftReal ? images.ai : images.real} 
                    alt="Right image" 
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              {!showResult && (
                <button 
                  className="w-full p-4 bg-blue-600 hover:bg-blue-700 transition rounded-b-lg text-lg font-medium"
                  onClick={() => handleGuess(false)}
                >
                  This is the REAL image
                </button>
              )}
            </div>
          </div>
        )}

        {showResult && (
          <div className="space-y-4">
            <div className={`p-6 rounded-lg text-center text-lg ${isCorrect ? "bg-green-600" : "bg-red-600"}`}>
              {isCorrect 
                ? "Correct! You successfully identified the real image!"
                : "Wrong! Better luck next time!"}
            </div>
            <button 
              className="w-full p-4 bg-blue-600 hover:bg-blue-700 transition rounded-lg text-lg font-medium"
              onClick={nextRound}
            >
              Next Round
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGame;