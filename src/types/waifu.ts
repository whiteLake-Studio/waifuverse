// Waifu character data structure for custom creation

export interface WaifuAppearance {
    // Hair
    hairStyle: string;
    hairColor: string;
    
    // Face
    eyeColor: string;
    eyeShape: string;
    faceShape: string;
    skinTone: string;
    
    // Body
    height: 'short' | 'medium' | 'tall';
    bodyType: 'slim' | 'curvy' | 'athletic';
    
    // Clothing
    outfit: string;
    accessories: string[];
    
    // Special features
    markings?: string[];
    expressions?: string[];
  }
  
  export interface WaifuPersonality {
    name: string;
    personality: string[];
    voiceType: 'cute' | 'mature' | 'energetic' | 'calm';
    favoriteThings: string[];
    backstory?: string;
  }
  
  export interface WaifuModel {
    id: string;
    appearance: WaifuAppearance;
    personality: WaifuPersonality;
    modelUrl?: string; // Path to Blender-exported GLB file
    animationSet: string; // Which animation set to use
    createdAt: Date;
    lastUsed: Date;
  }
  
  // Predefined options for the creator
  export const HAIR_STYLES = [
    { id: 'long_straight', name: 'Long & Straight', preview: '💁‍♀️' },
    { id: 'twin_tails', name: 'Twin Tails', preview: '👧' },
    { id: 'short_bob', name: 'Short Bob', preview: '👩‍🦰' },
    { id: 'curly_long', name: 'Curly Long', preview: '👩‍🦱' },
    { id: 'ponytail', name: 'Ponytail', preview: '💃' },
    { id: 'messy_bun', name: 'Messy Bun', preview: '👩‍🎨' },
  ];
  
  export const HAIR_COLORS = [
    { id: 'blonde', name: 'Blonde', hex: '#f4e4bc' },
    { id: 'brown', name: 'Brown', hex: '#8b4513' },
    { id: 'black', name: 'Black', hex: '#000000' },
    { id: 'red', name: 'Red', hex: '#dc143c' },
    { id: 'pink', name: 'Pink', hex: '#ffc0cb' },
    { id: 'blue', name: 'Blue', hex: '#4169e1' },
    { id: 'purple', name: 'Purple', hex: '#9370db' },
    { id: 'white', name: 'White', hex: '#f8f8f8' },
  ];
  
  export const EYE_COLORS = [
    { id: 'blue', name: 'Blue', hex: '#4169e1' },
    { id: 'brown', name: 'Brown', hex: '#8b4513' },
    { id: 'green', name: 'Green', hex: '#228b22' },
    { id: 'hazel', name: 'Hazel', hex: '#8e7618' },
    { id: 'purple', name: 'Purple', hex: '#9370db' },
    { id: 'red', name: 'Red', hex: '#dc143c' },
    { id: 'gold', name: 'Gold', hex: '#ffd700' },
    { id: 'silver', name: 'Silver', hex: '#c0c0c0' },
  ];
  
  export const SKIN_TONES = [
    { id: 'fair', name: 'Fair', hex: '#fdbcb4' },
    { id: 'light', name: 'Light', hex: '#edb98a' },
    { id: 'medium', name: 'Medium', hex: '#d08b5b' },
    { id: 'tan', name: 'Tan', hex: '#ae7242' },
    { id: 'dark', name: 'Dark', hex: '#8d5524' },
    { id: 'deep', name: 'Deep', hex: '#6b4226' },
  ];
  
  export const OUTFITS = [
    { id: 'school_uniform', name: 'School Uniform', preview: '👩‍🎓', category: 'casual' },
    { id: 'maid_outfit', name: 'Maid Outfit', preview: '🏠', category: 'cosplay' },
    { id: 'gothic_dress', name: 'Gothic Dress', preview: '🖤', category: 'gothic' },
    { id: 'summer_dress', name: 'Summer Dress', preview: '☀️', category: 'casual' },
    { id: 'kimono', name: 'Kimono', preview: '🌸', category: 'traditional' },
    { id: 'cyberpunk', name: 'Cyberpunk', preview: '🤖', category: 'futuristic' },
    { id: 'casual_cute', name: 'Casual Cute', preview: '😊', category: 'casual' },
    { id: 'elegant_gown', name: 'Elegant Gown', preview: '👑', category: 'formal' },
  ];
  
  export const PERSONALITIES = [
    { id: 'tsundere', name: 'Tsundere', desc: 'Initially cold but warm inside', emoji: '😤' },
    { id: 'kuudere', name: 'Kuudere', desc: 'Cool and aloof but caring', emoji: '😐' },
    { id: 'dandere', name: 'Dandere', desc: 'Shy and quiet but sweet', emoji: '😊' },
    { id: 'yandere', name: 'Yandere', desc: 'Obsessively loving', emoji: '😍' },
    { id: 'genki', name: 'Genki', desc: 'Energetic and cheerful', emoji: '🌟' },
    { id: 'ojou', name: 'Ojou-sama', desc: 'Elegant and refined', emoji: '👑' },
    { id: 'tomboy', name: 'Tomboy', desc: 'Athletic and direct', emoji: '💪' },
    { id: 'mysterious', name: 'Mysterious', desc: 'Enigmatic and intriguing', emoji: '🌙' },
  ];
  
  // Animation sets that will correspond to Blender exports
  export const ANIMATION_SETS = [
    { id: 'standard', name: 'Standard', animations: ['idle', 'wave', 'nod', 'shake_head', 'thinking'] },
    { id: 'cute', name: 'Cute', animations: ['idle_cute', 'bounce', 'twirl', 'heart_hands', 'wink'] },
    { id: 'elegant', name: 'Elegant', animations: ['idle_graceful', 'bow', 'curtsy', 'hand_gesture', 'smile'] },
    { id: 'energetic', name: 'Energetic', animations: ['idle_excited', 'jump', 'dance', 'cheer', 'run_place'] },
    { id: 'mysterious', name: 'Mysterious', animations: ['idle_mysterious', 'look_away', 'finger_point', 'shrug', 'smirk'] },
  ];
  
  // Default waifu for new users
  export const DEFAULT_WAIFU: WaifuModel = {
    id: 'default',
    appearance: {
      hairStyle: 'twin_tails',
      hairColor: 'blonde',
      eyeColor: 'blue',
      eyeShape: 'large',
      faceShape: 'oval',
      skinTone: 'fair',
      height: 'medium',
      bodyType: 'slim',
      outfit: 'school_uniform',
      accessories: [],
    },
    personality: {
      name: 'Luna',
      personality: ['genki'],
      voiceType: 'cute',
      favoriteThings: ['chatting', 'helping', 'learning'],
    },
    animationSet: 'cute',
    createdAt: new Date(),
    lastUsed: new Date(),
  };