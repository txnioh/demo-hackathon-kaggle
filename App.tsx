import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { PhotoUploader } from './components/PhotoUploader';
import { BackgroundsModal } from './components/BackgroundsModal';
import { ProductPage } from './components/ProductPage';
import type { Photo, Background, ProductDetails } from './types';
import { fileToBase64, base64ToDataURL } from './utils/fileUtils';
import { fillProductDetails, enhanceImage, generateBackground } from './services/geminiService';
import { WandSparklesIcon } from './components/icons';

// A placeholder for the initial background while it's being generated
const placeholderBackground: Background = {
  id: 'default',
  // A visible grey checkerboard pattern for the default background
  src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAIAAABt+uBvAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABoSURBVHic7cExAQAAAMKg9U9tCF8gAAAAAAAAAADg3wITAAAAAAAAAAAAAICfDTkAAAAAAAAAAAAAABQucgEAAAAAAAAAAAD4t2EFAAAAAAAAAAAAAAD+bdgBAAAAAAAAAAAAACg85QIAAAAAAAAAAAAAOBfhhUAAAAAAAAAAACgacgBAAAAAAAAAADAbgE43gEBCGOiAAAAAElFTuSuQmCC',
  prompt: 'Generating initial background...',
  isDefault: true,
};

function App() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [productDetails, setProductDetails] = useState<ProductDetails>({
    title: '',
    description: '',
    price: '',
  });
  const [backgrounds, setBackgrounds] = useState<Background[]>([placeholderBackground]);
  const [selectedBackgroundId, setSelectedBackgroundId] = useState<string>('default');
  
  const [isBackgroundModalOpen, setBackgroundModalOpen] = useState(false);
  const [isGeneratingDetails, setIsGeneratingDetails] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedCount, setEnhancedCount] = useState(0);
  const [isInitialBgGenerated, setIsInitialBgGenerated] = useState(false);
  
  const [view, setView] = useState<'form' | 'product'>('form');

  useEffect(() => {
    const generateInitialBackground = async () => {
      try {
        const prompt = "A clean, neutral, professional studio background for product photography, light gray with soft, diffused lighting.";
        const imageBase64 = await generateBackground(prompt);
        const newDefaultBackground: Background = {
            id: 'default',
            src: base64ToDataURL(imageBase64, 'image/jpeg'),
            prompt: 'Neutral Studio Background',
            isDefault: true,
        };
        setBackgrounds(prev => [newDefaultBackground, ...prev.filter(bg => !bg.isDefault)]);
      } catch (error) {
        console.error("Failed to generate initial background:", error);
        // If it fails, let's set a better fallback and show an error message
        const fallbackBackground: Background = {
            id: 'default',
            // This is a simple light gray background.
            src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAIAAAAtOYs1AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAADLSURBVO3BMQEAAADCoPVPbQ0PoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADg3wJ8hAAFAAEz3gAAAABJRU5ErkJggg==',
            prompt: 'Error: Using fallback background',
            isDefault: true,
        }
        setBackgrounds(prev => [fallbackBackground, ...prev.filter(bg => !bg.isDefault)]);
      } finally {
        setIsInitialBgGenerated(true);
      }
    };
    generateInitialBackground();
  }, []);

  const selectedBackground = useMemo(() => 
    backgrounds.find(bg => bg.id === selectedBackgroundId) || placeholderBackground,
    [backgrounds, selectedBackgroundId]
  );
  
  const isFormComplete = photos.length > 0 && enhancedCount === photos.length && productDetails.title !== '' && productDetails.description !== '' && productDetails.price !== '';
  
  const handleFillDetails = async () => {
    if (photos.length === 0 || !photos[0].file) return;

    setIsGeneratingDetails(true);
    try {
      const file = photos[0].file;
      const imageBase64 = await fileToBase64(file);
      const details = await fillProductDetails(imageBase64, file.type);
      setProductDetails(details);
    } catch (error) {
      console.error("Failed to fill product details:", error);
      alert("Could not automatically fill details. Please try again.");
    } finally {
      setIsGeneratingDetails(false);
    }
  };

  const handleEnhancePhotos = async () => {
      if (photos.length === 0 || (selectedBackground.isDefault && !isInitialBgGenerated)) return;

      setIsEnhancing(true);
      try {
          const backgroundBase64 = selectedBackground.src.split(',')[1];
          let currentEnhancedCount = 0;

          const enhancementPromises = photos.map(async (photo) => {
              if (photo.file && !photo.enhancedSrc) {
                  const productBase64 = await fileToBase64(photo.file);
                  const enhancedImageBase64 = await enhanceImage(productBase64, backgroundBase64, photo.file.type);
                  const enhancedSrc = base64ToDataURL(enhancedImageBase64, 'image/png');
                  return { photoId: photo.id, enhancedSrc };
              }
              return null;
          });

          const results = await Promise.all(enhancementPromises);

          setPhotos(prevPhotos => {
              const newPhotos = [...prevPhotos];
              results.forEach(result => {
                  if (result) {
                      const photoIndex = newPhotos.findIndex(p => p.id === result.photoId);
                      if (photoIndex !== -1) {
                          newPhotos[photoIndex].enhancedSrc = result.enhancedSrc;
                      }
                  }
              });
              return newPhotos;
          });
          setEnhancedCount(photos.length);

      } catch (error) {
          console.error("Failed to enhance photos:", error);
          alert("There was an error enhancing your photos. Please try again.");
      } finally {
          setIsEnhancing(false);
      }
  };

  const handleCreateListing = () => {
      if (isFormComplete) {
          setView('product');
      }
  };
  
  const handleDeleteListing = () => {
      setPhotos([]);
      setProductDetails({ title: '', description: '', price: '' });
      setSelectedBackgroundId('default');
      setEnhancedCount(0);
      setView('form');
  };

  if (view === 'product') {
    return (
        <div className="relative w-[390px] h-[844px] bg-black rounded-[44px] overflow-hidden border-2 border-gray-800">
            <ProductPage 
                photos={photos} 
                title={productDetails.title}
                price={productDetails.price}
                description={productDetails.description}
                onBack={() => setView('form')}
                onDelete={handleDeleteListing}
            />
        </div>
    );
  }

  return (
    <div className="relative w-[390px] h-[844px] bg-gradient-to-b from-[#3a2f4a] to-[#1c1626] text-white rounded-[44px] overflow-y-auto overflow-x-hidden border-2 border-gray-800 font-sans">
      <div className="flex flex-col min-h-full">
        <Header isFormComplete={isFormComplete} onCreate={handleCreateListing} />
        
        <main className="pt-32 px-6 space-y-6 pb-6 flex-grow">
          <PhotoUploader
            photos={photos}
            setPhotos={setPhotos}
            onFillDetails={handleFillDetails}
            isGeneratingDetails={isGeneratingDetails}
          />

          <div className="bg-white/5 rounded-xl p-4 flex justify-between items-center">
            <div className="flex items-center gap-3 overflow-hidden">
              <img src={selectedBackground.src} alt={selectedBackground.prompt} className="w-12 h-12 object-cover rounded-md flex-shrink-0" />
              <div className="flex-grow">
                <p className="font-semibold truncate">{selectedBackground.isDefault ? 'Default Studio' : 'Custom Background'}</p>
                <p className="text-sm text-gray-400 truncate">{selectedBackground.prompt}</p>
              </div>
            </div>
            <button onClick={() => setBackgroundModalOpen(true)} className="bg-white/10 font-semibold py-1.5 px-4 rounded-lg text-sm hover:bg-white/20 transition-colors flex-shrink-0 ml-2">
              {selectedBackground.isDefault ? 'Select' : 'Change'}
            </button>
          </div>

          <button
            onClick={handleEnhancePhotos}
            disabled={photos.length === 0 || (selectedBackground.isDefault && !isInitialBgGenerated) || isEnhancing}
            className="w-full flex items-center justify-center gap-2 bg-purple-600/30 text-purple-300 font-semibold py-3 rounded-xl transition-colors hover:bg-purple-600/50 disabled:bg-white/5 disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            {isEnhancing ? (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <WandSparklesIcon className="w-4 h-4" />
            )}
            <span>
              {photos.length === 0 ? "Add photos first" : 
               enhancedCount < photos.length ? `Enhance (${enhancedCount}/${photos.length})` : 
               `✨ ${enhancedCount}/${photos.length} Photos Enhanced`}
            </span>
          </button>
          
          <div className="space-y-4">
              <div>
                  <label className="text-sm font-semibold text-gray-300 ml-1 mb-1 block">Title *</label>
                  <input
                    type="text"
                    placeholder="e.g., Hand-woven Ceramic Bowl"
                    value={productDetails.title}
                    onChange={(e) => setProductDetails(p => ({ ...p, title: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                  />
              </div>
               <div>
                  <label className="text-sm font-semibold text-gray-300 ml-1 mb-1 block">Description *</label>
                  <textarea
                    placeholder="Tell us about your creation, materials used, inspiration..."
                    rows={4}
                    value={productDetails.description}
                    onChange={(e) => setProductDetails(p => ({ ...p, description: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                  />
              </div>
              <div>
                  <label className="text-sm font-semibold text-gray-300 ml-1 mb-1 block">Price *</label>
                  <input
                    type="text"
                    placeholder="e.g., 25"
                    value={productDetails.price}
                    onChange={(e) => setProductDetails(p => ({ ...p, price: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                  />
              </div>
          </div>
        </main>
      </div>

      <BackgroundsModal
        isOpen={isBackgroundModalOpen}
        onClose={() => setBackgroundModalOpen(false)}
        backgrounds={backgrounds}
        setBackgrounds={setBackgrounds}
        selectedBackgroundId={selectedBackgroundId}
        setSelectedBackgroundId={setSelectedBackgroundId}
      />
    </div>
  );
}

export default App;