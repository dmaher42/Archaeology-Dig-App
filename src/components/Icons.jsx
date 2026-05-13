import { 
  Amphora, Bone, Landmark, Sprout, ScrollText, SearchCheck,
  Users, Beaker, Leaf, MapPin, FileText
} from 'lucide-react';

export const getIcon = (type, size = 20, props = {}) => {
  switch(type) {
    case 'objects': return <Amphora size={size} {...props} />;
    case 'remains': return <Bone size={size} {...props} />;
    case 'structures': return <Landmark size={size} {...props} />;
    case 'environment': return <Sprout size={size} {...props} />;
    case 'written': return <ScrollText size={size} {...props} />;
    case 'mystery': return <SearchCheck size={size} {...props} />;
    default: return <SearchCheck size={size} {...props} />;
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
