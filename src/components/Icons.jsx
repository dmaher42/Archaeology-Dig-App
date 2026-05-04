import { 
  Package, Skull, Landmark, Leaf, ScrollText, Search,
  Users, Beaker, MapPin, FileText
} from 'lucide-react';
import React from 'react';

export const getIcon = (type, size = 20) => {
  switch(type) {
    case 'objects': return <Package size={size} />;
    case 'remains': return <Skull size={size} />;
    case 'structures': return <Landmark size={size} />;
    case 'environment': return <Leaf size={size} />;
    case 'written': return <ScrollText size={size} />;
    case 'mystery': return <Search size={size} />;
    default: return <Search size={size} />;
  }
};

export const getPromptIcon = (iconId, size = 18) => {
  switch(iconId) {
    case 'daily-life': return <Users size={size} />;
    case 'beliefs': return <Landmark size={size} />;
    case 'technology': return <Beaker size={size} />;
    case 'environment': return <Leaf size={size} />;
    case 'society': return <MapPin size={size} />;
    default: return <FileText size={size} />;
  }
};
