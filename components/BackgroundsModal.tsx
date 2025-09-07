
import React, { useState } from 'react';
import type { Background } from '../types';
import { AddPhotoIcon, CloseIcon } from './icons';
import { generateBackground } from '../services/geminiService';
import { base64ToDataURL } from '../utils/fileUtils';

interface BackgroundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  backgrounds: Background[];
  setBackgrounds: React.Dispatch<React.SetStateAction<Background[]>>;
  selectedBackgroundId: string;
  setSelectedBackgroundId: (id: string) => void;
}

export const BackgroundsModal: React.FC<BackgroundsModalProps> = ({ isOpen, onClose, backgrounds, setBackgrounds, selectedBackgroundId, setSelectedBackgroundId }) => {
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    if (!isOpen) return null;

    const handleSelectBackground = (id: string) => {
        setSelectedBackgroundId(id);
        onClose();
    };
    
    const handleDeleteBackground = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setBackgrounds(prev => prev.filter(bg => bg.id !== id));
        if (selectedBackgroundId === id) {
            setSelectedBackgroundId('default');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-end z-50 animate-fade-in">
            <div className="bg-[#1a1027] w-full max-w-md rounded-t-2xl p-6 border-t border-[#4a2f64] animate-slide-up">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-serif font-medium">Studio Backgrounds</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    {backgrounds.map(bg => (
                        <div key={bg.id} onClick={() => handleSelectBackground(bg.id)} className="cursor-pointer group relative">
                            <img src={bg.src} alt={bg.prompt} className={`w-full h-32 object-cover rounded-xl ${selectedBackgroundId === bg.id ? 'ring-2 ring-purple-500' : ''}`} />
                            <div className="mt-2">
                                <p className="font-semibold truncate">{bg.isDefault ? "Default Studio" : "Custom Background"}</p>
                                <p className="text-xs text-gray-400 truncate">{bg.prompt}</p>
                            </div>
                             {!bg.isDefault && (
                                <button
                                    onClick={(e) => handleDeleteBackground(e, bg.id)}
                                    className="absolute top-2 right-2 bg-black/50 rounded-full p-1 opacity-0 group-hover:opacity-100 hover:bg-black/80 transition-opacity"
                                >
                                    <CloseIcon className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ))}

                    {isGenerating ? (
                         <div className="flex flex-col items-center justify-center h-32 bg-transparent border-2 border-dashed border-purple-700 rounded-xl">
                            <svg className="animate-spin h-5 w-5 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="text-sm mt-2 text-purple-400">Generating...</span>
                        </div>
                    ) : (
                        <button onClick={() => setCreateModalOpen(true)} className="flex flex-col items-center justify-center h-32 bg-transparent border-2 border-dashed border-purple-700/50 rounded-xl hover:border-purple-700 hover:bg-purple-900/20 transition-colors">
                            <AddPhotoIcon />
                            <span className="text-sm mt-2 text-gray-300">Create Background</span>
                        </button>
                    )}
                </div>
            </div>
            {isCreateModalOpen && <CreateBackgroundModal 
                onClose={() => setCreateModalOpen(false)}
                setBackgrounds={setBackgrounds}
                setIsGenerating={setIsGenerating}
                setSelectedBackgroundId={setSelectedBackgroundId}
            />}
        </div>
    );
};


interface CreateBackgroundModalProps {
    onClose: () => void;
    setBackgrounds: React.Dispatch<React.SetStateAction<Background[]>>;
    setIsGenerating: (isGenerating: boolean) => void;
    setSelectedBackgroundId: (id: string) => void;
}
const CreateBackgroundModal: React.FC<CreateBackgroundModalProps> = ({ onClose, setBackgrounds, setIsGenerating, setSelectedBackgroundId }) => {
    const [prompt, setPrompt] = useState('Minimalist black background and studio lights in the middle');

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            alert("Please enter a description for the background.");
            return;
        }
        setIsGenerating(true);
        onClose();
        try {
            const imageBase64 = await generateBackground(prompt);
            const newId = crypto.randomUUID();
            const newBackground: Background = {
                id: newId,
                src: base64ToDataURL(imageBase64, 'image/jpeg'),
                prompt: prompt,
            };
            setBackgrounds(prev => [...prev, newBackground]);
            setSelectedBackgroundId(newId);
        } catch (error) {
            console.error("Error generating background:", error);
            alert("Failed to generate background. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-60 animate-fade-in" onClick={onClose}>
            <div className="bg-[#2a1a3e] rounded-2xl p-6 w-11/12 max-w-sm space-y-4" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-semibold text-center">Create Background</h3>
                <p className="text-center text-gray-300 text-sm">Describe the studio background you want</p>
                <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={3}
                    className="w-full bg-[#1a1027] border border-[#4a2f64] rounded-xl py-3 px-4 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#a855f7]"
                />
                <div className="flex gap-4">
                    <button onClick={onClose} className="flex-1 bg-gray-600/50 hover:bg-gray-600/80 rounded-xl py-3 font-semibold transition-colors">Cancel</button>
                    <button onClick={handleGenerate} className="flex-1 bg-[#a855f7] hover:bg-[#9333ea] rounded-xl py-3 font-semibold transition-colors">Generate</button>
                </div>
            </div>
        </div>
    );
}