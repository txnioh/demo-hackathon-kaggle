import React from 'react';
import type { Photo } from '../types';
import { BackIcon, EditIcon, DeleteIcon, LocationIcon } from './icons';

interface ProductPageProps {
  photos: Photo[];
  title: string;
  price: string;
  description: string;
  onBack: () => void;
  onDelete: () => void;
}

export const ProductPage: React.FC<ProductPageProps> = ({
  photos,
  title,
  price,
  description,
  onBack,
  onDelete
}) => {
  const displayPhotos = photos.map(p => p.enhancedSrc || p.originalSrc).filter(Boolean);

  return (
    <div className="flex flex-col h-full bg-[#120c1c] text-white">
        <header className="relative h-96 flex-shrink-0 bg-gray-900">
            <div className="w-full h-full flex overflow-x-auto snap-x snap-mandatory">
                {displayPhotos.length > 0 ? displayPhotos.map((src, index) => (
                    <img
                        key={index}
                        src={src}
                        alt={`Product preview ${index + 1}`}
                        className="w-full h-full object-cover flex-shrink-0 snap-center"
                    />
                )) : <div className="w-full h-full flex items-center justify-center text-gray-500">No photos</div>}
            </div>
            <button onClick={onBack} className="absolute top-14 left-4 bg-black/30 backdrop-blur-sm p-2 rounded-full z-10">
                <BackIcon className="w-6 h-6 text-white" />
            </button>
        </header>
        
        <main className="flex-grow p-6 space-y-4 overflow-y-auto bg-[#3a2a4b]">
            <h1 className="text-3xl font-bold text-white">{title}</h1>
            <p className="text-4xl font-bold text-white">€{price}</p>
            <div className="flex gap-2">
                <div className="bg-white/10 text-white text-sm font-semibold px-3 py-1.5 rounded-full">Video Games</div>
                <div className="bg-white/10 text-white text-sm font-semibold px-3 py-1.5 rounded-full flex items-center gap-1">
                    <LocationIcon className="w-4 h-4" />
                    Madrid
                </div>
            </div>

            <div className="bg-white/10 p-4 rounded-xl space-y-2">
                <h2 className="text-lg font-bold text-white">Description</h2>
                <p className="text-gray-300 whitespace-pre-wrap">{description}</p>
            </div>

            <div className="bg-white/10 p-4 rounded-xl">
                 <h2 className="text-lg font-bold text-white">Seller</h2>
                 <p className="text-gray-400 text-sm">Information about seller goes here.</p>
            </div>
        </main>
        
        <footer className="bg-black/50 backdrop-blur-sm p-4 sticky bottom-0">
             <div className="flex justify-around items-center">
                <button onClick={onBack} className="flex items-center gap-2 text-white font-semibold text-lg hover:text-purple-400">
                    <EditIcon className="w-5 h-5"/>
                    <span>Edit</span>
                </button>
                <button onClick={onDelete} className="flex items-center gap-2 text-red-500 font-semibold text-lg hover:text-red-400">
                    <DeleteIcon className="w-5 h-5"/>
                    <span>Delete</span>
                </button>
            </div>
        </footer>
    </div>
  );
};
