import React from 'react';
import { 
    Plus, 
    X, 
    Home, 
    PlusCircle, 
    MessageSquare, 
    Wand,
    WandSparkles,
    Wifi,
    Battery,
    ChevronLeft,
    Trash2,
    Pencil,
    MapPin,
} from 'lucide-react';

// Using wrapper components to apply consistent styling or props if needed
export const AddPhotoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Plus {...props} />;
export const CloseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <X {...props} />;
export const HomeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Home size={28} strokeWidth={2} {...props} />;
export const AddCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <PlusCircle size={56} fill="currentColor" strokeWidth={0} {...props} />;
export const ChatIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <MessageSquare size={28} strokeWidth={2} {...props} />;
export const MagicWandIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Wand {...props} />;
export const WandSparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <WandSparkles {...props} />;
export const WifiIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Wifi {...props} />;
export const BatteryIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Battery {...props} />;
export const BackIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <ChevronLeft {...props} />;
export const DeleteIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Trash2 {...props} />;
export const EditIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Pencil {...props} />;
export const LocationIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <MapPin {...props} />;
