// Animation controller for mapping chat context to 3D animations

export type AnimationType = 
  | 'idle' 
  | 'talking' 
  | 'happy' 
  | 'sad' 
  | 'excited' 
  | 'thinking' 
  | 'wave' 
  | 'dance' 
  | 'laugh'
  | 'angry'
  | 'surprised'
  | 'flirty';

interface AnimationMapping {
  keywords: string[];
  animations: AnimationType[];
  priority: number;
}

// Define mappings between keywords/phrases and animations
const animationMappings: AnimationMapping[] = [
  {
    keywords: ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good evening'],
    animations: ['wave'],
    priority: 10
  },
  {
    keywords: ['happy', 'glad', 'joy', 'awesome', 'great', 'wonderful', 'amazing', '😊', '😄', '💕'],
    animations: ['happy', 'excited'],
    priority: 8
  },
  {
    keywords: ['sad', 'sorry', 'disappointed', 'unfortunate', '😢', '😔'],
    animations: ['sad'],
    priority: 8
  },
  {
    keywords: ['think', 'hmm', 'consider', 'maybe', 'perhaps', 'wondering'],
    animations: ['thinking'],
    priority: 6
  },
  {
    keywords: ['love', 'kiss', 'cute', 'beautiful', 'sweet', '💖', '😘', '💕'],
    animations: ['flirty', 'happy'],
    priority: 9
  },
  {
    keywords: ['dance', 'party', 'celebrate', 'fun'],
    animations: ['dance'],
    priority: 10
  },
  {
    keywords: ['laugh', 'haha', 'lol', 'funny', '😂', '🤣'],
    animations: ['laugh'],
    priority: 9
  },
  {
    keywords: ['angry', 'mad', 'upset', 'frustrated', '😠', '😡'],
    animations: ['angry'],
    priority: 8
  },
  {
    keywords: ['wow', 'omg', 'surprised', 'shock', 'unexpected', '😮', '😱'],
    animations: ['surprised'],
    priority: 9
  }
];

// Analyze text and determine appropriate animation
export function getAnimationFromText(text: string): AnimationType {
  const lowerText = text.toLowerCase();
  let bestMatch: { animation: AnimationType; priority: number } | null = null;

  for (const mapping of animationMappings) {
    for (const keyword of mapping.keywords) {
      if (lowerText.includes(keyword)) {
        if (!bestMatch || mapping.priority > bestMatch.priority) {
          bestMatch = {
            animation: mapping.animations[Math.floor(Math.random() * mapping.animations.length)],
            priority: mapping.priority
          };
        }
      }
    }
  }

  // Default to talking animation if speaking, idle otherwise
  return bestMatch?.animation || (text.length > 0 ? 'talking' : 'idle');
}

// Analyze sentiment (basic implementation - can be enhanced with AI)
export function analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
  const positiveWords = ['happy', 'good', 'great', 'love', 'awesome', 'wonderful', 'excellent'];
  const negativeWords = ['sad', 'bad', 'hate', 'terrible', 'awful', 'horrible', 'disappointed'];
  
  const lowerText = text.toLowerCase();
  let positiveScore = 0;
  let negativeScore = 0;

  positiveWords.forEach(word => {
    if (lowerText.includes(word)) positiveScore++;
  });

  negativeWords.forEach(word => {
    if (lowerText.includes(word)) negativeScore++;
  });

  if (positiveScore > negativeScore) return 'positive';
  if (negativeScore > positiveScore) return 'negative';
  return 'neutral';
}

// Queue system for animations
export class AnimationQueue {
  private queue: AnimationType[] = [];
  private currentAnimation: AnimationType = 'idle';
  private isProcessing = false;

  add(animation: AnimationType) {
    this.queue.push(animation);
    if (!this.isProcessing) {
      this.process();
    }
  }

  private async process() {
    if (this.queue.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;
    const nextAnimation = this.queue.shift()!;
    this.currentAnimation = nextAnimation;

    // Animation duration (can be customized per animation type)
    const duration = this.getAnimationDuration(nextAnimation);
    
    await new Promise(resolve => setTimeout(resolve, duration));
    
    // Continue processing queue
    this.process();
  }

  private getAnimationDuration(animation: AnimationType): number {
    const durations: Record<AnimationType, number> = {
      idle: 2000,
      talking: 3000,
      happy: 2500,
      sad: 3000,
      excited: 2000,
      thinking: 3500,
      wave: 2000,
      dance: 4000,
      laugh: 2500,
      angry: 2500,
      surprised: 2000,
      flirty: 2500
    };
    return durations[animation] || 2000;
  }

  getCurrent(): AnimationType {
    return this.currentAnimation;
  }

  clear() {
    this.queue = [];
    this.currentAnimation = 'idle';
  }
}

// Lip sync simulation (basic version - can be enhanced with actual audio analysis)
export function simulateLipSync(text: string, onUpdate: (isSpeaking: boolean) => void) {
  const words = text.split(' ');
  const avgTimePerWord = 300; // milliseconds
  
  let currentWord = 0;
  const interval = setInterval(() => {
    if (currentWord >= words.length) {
      clearInterval(interval);
      onUpdate(false);
      return;
    }
    
    // Simulate speaking
    onUpdate(true);
    currentWord++;
  }, avgTimePerWord);

  return () => clearInterval(interval);
}