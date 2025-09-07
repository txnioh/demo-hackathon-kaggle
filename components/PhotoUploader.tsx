import React, { useRef } from 'react';
import type { Photo } from '../types';
import { AddPhotoIcon, CloseIcon, WandSparklesIcon } from './icons';

interface PhotoUploaderProps {
  photos: Photo[];
  setPhotos: React.Dispatch<React.SetStateAction<Photo[]>>;
  onFillDetails: () => void;
  isGeneratingDetails: boolean;
}

const MAX_PHOTOS = 5;

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({ photos, setPhotos, onFillDetails, isGeneratingDetails }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      const availableSlots = MAX_PHOTOS - photos.length;
      if (availableSlots <= 0) return;

      const filesToProcess = files.slice(0, availableSlots);
      
      const promises = filesToProcess.map(file => {
        return new Promise<Photo>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target?.result) {
              resolve({
                id: crypto.randomUUID(),
                originalSrc: e.target.result as string,
                file: file,
              });
            } else {
              reject(new Error("Failed to read file"));
            }
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      Promise.all(promises).then(newPhotos => {
        setPhotos(prev => [...prev, ...newPhotos]);
      }).catch(error => {
        console.error("Error reading files:", error);
        alert("There was an error processing your images. Please try again.");
      });

      // Reset file input value to allow selecting the same file again
      event.target.value = '';
    }
  };

  const removePhoto = (id: string) => {
    setPhotos(prev => prev.filter(photo => photo.id !== id));
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">Photos * <span className="text-gray-400">({photos.length}/{MAX_PHOTOS})</span></h2>
        <button
          onClick={onFillDetails}
          disabled={photos.length === 0 || isGeneratingDetails}
          className="flex items-center gap-1.5 bg-white/10 text-white font-semibold py-1.5 px-4 rounded-lg text-sm transition-colors hover:bg-white/20 disabled:bg-white/5 disabled:text-gray-500 disabled:cursor-not-allowed"
        >
          {isGeneratingDetails ? (
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <WandSparklesIcon className="w-4 h-4" />
          )}
          <span>Fill</span>
        </button>
      </div>

      <p className="text-sm text-gray-400 mb-4">Add up to {MAX_PHOTOS} photos of your creation</p>
      <div className="grid grid-cols-4 gap-4">
        {photos.map(photo => (
          <div key={photo.id} className="relative aspect-square">
            <img 
              src={photo.enhancedSrc || photo.originalSrc} 
              alt="Uploaded creation" 
              className="w-full h-full object-cover rounded-xl bg-white/5"
            />
            <button
              onClick={() => removePhoto(photo.id)}
              className="absolute top-1.5 right-1.5 bg-black/50 rounded-full p-1 hover:bg-black/80 transition-colors"
            >
              <CloseIcon className="w-3 h-3" />
            </button>
          </div>
        ))}
        {photos.length < MAX_PHOTOS && (
          <button
            onClick={triggerFileInput}
            className="flex flex-col items-center justify-center aspect-square bg-white/5 border border-dashed border-white/10 rounded-xl hover:bg-white/10 transition-colors"
          >
            <AddPhotoIcon className="text-gray-400" />
            <span className="text-sm mt-2 text-gray-400">Add Photo</span>
          </button>
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        accept="image/*"
        className="hidden"
      />
    </div>
  );
};
