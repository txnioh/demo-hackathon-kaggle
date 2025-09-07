import React from 'react';
import { WifiIcon, BatteryIcon } from './icons';

interface HeaderProps {
    isFormComplete: boolean;
    onCreate: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isFormComplete, onCreate }) => {
  return (
    <header className="absolute top-0 left-0 right-0 z-10 px-6 pt-6 text-white">
        <div className="flex justify-between items-center text-sm font-semibold mb-6">
            <span>20:22</span>
            <div className="flex items-center gap-1">
                <span className="text-xs">••••</span>
                <WifiIcon className="w-4 h-4" />
                <BatteryIcon className="w-6 h-6" />
            </div>
        </div>
        <div className="flex justify-between items-center">
            <h1 className="text-4xl font-serif font-medium" style={{fontFamily: "'Playfair Display', serif"}}>Create Listing</h1>
            <button
                onClick={onCreate}
                disabled={!isFormComplete}
                className="bg-white/30 text-white font-semibold py-2 px-5 rounded-xl transition-all duration-300 disabled:bg-white/10 disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-white/40"
            >
                Create
            </button>
        </div>
    </header>
  );
};
