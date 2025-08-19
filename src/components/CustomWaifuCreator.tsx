'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  WaifuModel, 
  WaifuAppearance, 
  WaifuPersonality, 
  HAIR_STYLES, 
  HAIR_COLORS, 
  EYE_COLORS, 
  SKIN_TONES, 
  OUTFITS, 
  PERSONALITIES,
  ANIMATION_SETS,
  DEFAULT_WAIFU
} from '@/types/waifu';

interface CustomWaifuCreatorProps {
  onComplete: (waifu: WaifuModel) => void;
  onBack: () => void;
}

type CreatorStep = 'hair' | 'face' | 'body' | 'outfit' | 'personality' | 'preview';

export default function CustomWaifuCreator({ onComplete, onBack }: CustomWaifuCreatorProps) {
  const [currentStep, setCurrentStep] = useState<CreatorStep>('hair');
  const [waifu, setWaifu] = useState<WaifuModel>({ ...DEFAULT_WAIFU });
  
  const steps: { key: CreatorStep; title: string; icon: string }[] = [
    { key: 'hair', title: 'Hair', icon: '💇‍♀️' },
    { key: 'face', title: 'Face', icon: '👁️' },
    { key: 'body', title: 'Body', icon: '👤' },
    { key: 'outfit', title: 'Outfit', icon: '👗' },
    { key: 'personality', title: 'Personality', icon: '💭' },
    { key: 'preview', title: 'Preview', icon: '✨' },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === currentStep);

  const updateAppearance = (updates: Partial<WaifuAppearance>) => {
    setWaifu(prev => ({
      ...prev,
      appearance: { ...prev.appearance, ...updates }
    }));
  };

  const updatePersonality = (updates: Partial<WaifuPersonality>) => {
    setWaifu(prev => ({
      ...prev,
      personality: { ...prev.personality, ...updates }
    }));
  };

  const nextStep = () => {
    const nextIndex = Math.min(currentStepIndex + 1, steps.length - 1);
    setCurrentStep(steps[nextIndex].key);
  };

  const prevStep = () => {
    const prevIndex = Math.max(currentStepIndex - 1, 0);
    setCurrentStep(steps[prevIndex].key);
  };

  const finishCreation = () => {
    const newWaifu: WaifuModel = {
      ...waifu,
      id: `waifu_${Date.now()}`,
      createdAt: new Date(),
      lastUsed: new Date(),
    };
    
    // Save to localStorage
    localStorage.setItem('custom_waifu', JSON.stringify(newWaifu));
    onComplete(newWaifu);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-purple-900 via-pink-800 to-purple-900 text-white overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-4 pt-12 bg-black/20 backdrop-blur-sm">
        <button onClick={onBack} className="text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-xl font-bold">Create Your Waifu</h2>
        <div className="text-sm text-purple-200">
          {currentStepIndex + 1}/{steps.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-4 py-2">
        <div className="flex space-x-2">
          {steps.map((step, index) => (
            <motion.div
              key={step.key}
              className={`flex-1 h-1 rounded-full ${
                index <= currentStepIndex ? 'bg-pink-400' : 'bg-white/20'
              }`}
              layoutId={`progress-${index}`}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2">
          {steps.map((step) => (
            <div key={step.key} className="text-center">
              <div className={`text-lg ${currentStep === step.key ? 'scale-125' : ''} transition-transform`}>
                {step.icon}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {currentStep === 'hair' && (
            <motion.div
              key="hair"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="space-y-6"
            >
              <h3 className="text-2xl font-bold text-center mb-6">Choose Hair Style</h3>
              
              {/* Hair Style */}
              <div>
                <h4 className="text-lg font-semibold mb-3">Hair Style</h4>
                <div className="grid grid-cols-2 gap-3">
                  {HAIR_STYLES.map((style) => (
                    <motion.button
                      key={style.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => updateAppearance({ hairStyle: style.id })}
                      className={`p-4 rounded-2xl border-2 transition-colors ${
                        waifu.appearance.hairStyle === style.id
                          ? 'border-pink-400 bg-pink-400/20'
                          : 'border-white/20 bg-white/5'
                      }`}
                    >
                      <div className="text-3xl mb-2">{style.preview}</div>
                      <div className="text-sm font-semibold">{style.name}</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Hair Color */}
              <div>
                <h4 className="text-lg font-semibold mb-3">Hair Color</h4>
                <div className="grid grid-cols-4 gap-3">
                  {HAIR_COLORS.map((color) => (
                    <motion.button
                      key={color.id}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => updateAppearance({ hairColor: color.id })}
                      className={`aspect-square rounded-2xl border-4 transition-all ${
                        waifu.appearance.hairColor === color.id
                          ? 'border-white scale-110'
                          : 'border-white/30'
                      }`}
                      style={{ backgroundColor: color.hex }}
                    >
                      <span className="sr-only">{color.name}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 'face' && (
            <motion.div
              key="face"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="space-y-6"
            >
              <h3 className="text-2xl font-bold text-center mb-6">Facial Features</h3>

              {/* Eye Color */}
              <div>
                <h4 className="text-lg font-semibold mb-3">Eye Color</h4>
                <div className="grid grid-cols-4 gap-3">
                  {EYE_COLORS.map((color) => (
                    <motion.button
                      key={color.id}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => updateAppearance({ eyeColor: color.id })}
                      className={`aspect-square rounded-full border-4 transition-all ${
                        waifu.appearance.eyeColor === color.id
                          ? 'border-white scale-110'
                          : 'border-white/30'
                      }`}
                      style={{ backgroundColor: color.hex }}
                    >
                      <span className="sr-only">{color.name}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Skin Tone */}
              <div>
                <h4 className="text-lg font-semibold mb-3">Skin Tone</h4>
                <div className="grid grid-cols-3 gap-3">
                  {SKIN_TONES.map((tone) => (
                    <motion.button
                      key={tone.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => updateAppearance({ skinTone: tone.id })}
                      className={`p-4 rounded-2xl border-4 transition-all ${
                        waifu.appearance.skinTone === tone.id
                          ? 'border-white scale-105'
                          : 'border-white/30'
                      }`}
                      style={{ backgroundColor: tone.hex }}
                    >
                      <div className="font-semibold text-white drop-shadow-lg">
                        {tone.name}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 'body' && (
            <motion.div
              key="body"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="space-y-6"
            >
              <h3 className="text-2xl font-bold text-center mb-6">Body Type</h3>

              {/* Height */}
              <div>
                <h4 className="text-lg font-semibold mb-3">Height</h4>
                <div className="space-y-3">
                  {['short', 'medium', 'tall'].map((height) => (
                    <motion.button
                      key={height}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => updateAppearance({ height: height as any })}
                      className={`w-full p-4 rounded-2xl border-2 transition-colors capitalize ${
                        waifu.appearance.height === height
                          ? 'border-pink-400 bg-pink-400/20'
                          : 'border-white/20 bg-white/5'
                      }`}
                    >
                      {height} ({height === 'short' ? '5\'0" - 5\'3"' : height === 'medium' ? '5\'4" - 5\'7"' : '5\'8" - 6\'0"'})
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Body Type */}
              <div>
                <h4 className="text-lg font-semibold mb-3">Body Type</h4>
                <div className="space-y-3">
                  {['slim', 'curvy', 'athletic'].map((bodyType) => (
                    <motion.button
                      key={bodyType}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => updateAppearance({ bodyType: bodyType as any })}
                      className={`w-full p-4 rounded-2xl border-2 transition-colors capitalize ${
                        waifu.appearance.bodyType === bodyType
                          ? 'border-pink-400 bg-pink-400/20'
                          : 'border-white/20 bg-white/5'
                      }`}
                    >
                      {bodyType}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 'outfit' && (
            <motion.div
              key="outfit"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="space-y-6"
            >
              <h3 className="text-2xl font-bold text-center mb-6">Choose Outfit</h3>
              
              <div className="grid grid-cols-2 gap-4">
                {OUTFITS.map((outfit) => (
                  <motion.button
                    key={outfit.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => updateAppearance({ outfit: outfit.id })}
                    className={`p-4 rounded-2xl border-2 transition-colors ${
                      waifu.appearance.outfit === outfit.id
                        ? 'border-pink-400 bg-pink-400/20'
                        : 'border-white/20 bg-white/5'
                    }`}
                  >
                    <div className="text-3xl mb-2">{outfit.preview}</div>
                    <div className="text-sm font-semibold">{outfit.name}</div>
                    <div className="text-xs text-purple-200 capitalize">{outfit.category}</div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {currentStep === 'personality' && (
            <motion.div
              key="personality"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="space-y-6"
            >
              <h3 className="text-2xl font-bold text-center mb-6">Personality & Name</h3>

              {/* Name */}
              <div>
                <h4 className="text-lg font-semibold mb-3">Name</h4>
                <input
                  type="text"
                  value={waifu.personality.name}
                  onChange={(e) => updatePersonality({ name: e.target.value })}
                  placeholder="Enter waifu name..."
                  className="w-full p-4 bg-white/10 border-2 border-white/20 rounded-2xl text-white placeholder-white/60 focus:border-pink-400 focus:outline-none"
                />
              </div>

              {/* Personality Type */}
              <div>
                <h4 className="text-lg font-semibold mb-3">Personality Type</h4>
                <div className="space-y-3">
                  {PERSONALITIES.map((personality) => (
                    <motion.button
                      key={personality.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => updatePersonality({ personality: [personality.id] })}
                      className={`w-full p-4 rounded-2xl border-2 transition-colors ${
                        waifu.personality.personality.includes(personality.id)
                          ? 'border-pink-400 bg-pink-400/20'
                          : 'border-white/20 bg-white/5'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{personality.emoji}</span>
                        <div className="text-left">
                          <div className="font-semibold">{personality.name}</div>
                          <div className="text-sm text-purple-200">{personality.desc}</div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Animation Set */}
              <div>
                <h4 className="text-lg font-semibold mb-3">Animation Style</h4>
                <div className="space-y-3">
                  {ANIMATION_SETS.map((animSet) => (
                    <motion.button
                      key={animSet.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setWaifu(prev => ({ ...prev, animationSet: animSet.id }))}
                      className={`w-full p-4 rounded-2xl border-2 transition-colors ${
                        waifu.animationSet === animSet.id
                          ? 'border-pink-400 bg-pink-400/20'
                          : 'border-white/20 bg-white/5'
                      }`}
                    >
                      <div className="font-semibold">{animSet.name}</div>
                      <div className="text-xs text-purple-200">
                        {animSet.animations.join(', ')}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 'preview' && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="space-y-6"
            >
              <h3 className="text-2xl font-bold text-center mb-6">Preview Your Waifu</h3>

              {/* Waifu Preview Card */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gradient-to-b from-pink-400/20 to-purple-400/20 rounded-3xl p-6 border-2 border-white/20"
              >
                <div className="text-center">
                  <div className="text-6xl mb-4">👸</div>
                  <h4 className="text-2xl font-bold mb-2">{waifu.personality.name}</h4>
                  <p className="text-purple-200 mb-4">
                    {PERSONALITIES.find(p => p.id === waifu.personality.personality[0])?.name} Personality
                  </p>
                  
                  <div className="space-y-2 text-sm">
                    <div>Hair: {HAIR_STYLES.find(h => h.id === waifu.appearance.hairStyle)?.name} - {waifu.appearance.hairColor}</div>
                    <div>Eyes: {waifu.appearance.eyeColor}</div>
                    <div>Outfit: {OUTFITS.find(o => o.id === waifu.appearance.outfit)?.name}</div>
                    <div>Animation: {ANIMATION_SETS.find(a => a.id === waifu.animationSet)?.name}</div>
                  </div>
                </div>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={finishCreation}
                className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl font-bold text-lg shadow-2xl"
              >
                ✨ Create My Waifu ✨
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex justify-between p-4 bg-black/20 backdrop-blur-sm">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={prevStep}
          disabled={currentStepIndex === 0}
          className="px-6 py-3 bg-white/10 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </motion.button>
        
        {currentStep !== 'preview' ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={nextStep}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl font-semibold"
          >
            Next
          </motion.button>
        ) : (
          <div className="w-20"></div>
        )}
      </div>
    </div>
  );
}