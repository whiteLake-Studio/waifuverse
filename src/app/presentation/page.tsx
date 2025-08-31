'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Presentation() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "WaifuVerse",
      subtitle: "The Future of AI Entertainment",
      content: [
        "Interactive AI companions with personality",
        "Built-in monetization through streaming",
        "Farcaster authentication for Web3 natives",
        "Live streaming with real-time interactions"
      ],
      gradient: "from-purple-900 via-purple-800 to-pink-900",
      emoji: "✨",
      layout: "hero"
    },
    {
      title: "Mass Adoption Strategy",
      subtitle: "Breaking Web3 Barriers",
      content: [
        "Entertainment-first approach attracts mainstream users",
        "Familiar payment models (tips, subscriptions)", 
        "Gamified interactions lower learning curve",
        "Mobile-first design for accessibility"
      ],
      gradient: "from-indigo-900 via-purple-800 to-pink-900",
      emoji: "🚀",
      layout: "split"
    },
    {
      title: "Revolutionary Engagement",
      subtitle: "Users Participate, Not Just Watch",
      content: [
        "Free chat keeps users engaged",
        "Premium actions create revenue streams",
        "Shared experiences build community", 
        "Real-time responses create addiction loops"
      ],
      gradient: "from-pink-900 via-red-800 to-purple-900",
      emoji: "💖",
      layout: "circular"
    },
    {
      title: "Built on Base",
      subtitle: "Lightning Fast & Affordable",
      content: [
        "Sub-second transaction speeds",
        "Minimal gas fees enable micro-payments",
        "Native Base app integration and user access",
        "Enterprise-grade security and reliability"
      ],
      gradient: "from-blue-600 via-blue-700 to-blue-900",
      emoji: "🔵",
      layout: "base-special"
    },
    {
      title: "Revenue Streams",
      subtitle: "Built for Profitability",
      content: [
        "Streaming tips: $3-$30 per action",
        "Private rooms: $200 premium access",
        "Custom waifu creation fees",
        "Platform commission: 20%"
      ],
      gradient: "from-green-900 via-emerald-800 to-teal-900",
      emoji: "💰",
      layout: "money"
    },
    {
      title: "The Roadmap",
      subtitle: "Waifu Launchpad Revolution",
      content: [
        "🚀 Waifu Launchpad: Users create & tokenize custom waifus",
        "💼 Put waifus to work: Earn while others interact",
        "💰 NFT marketplace: Buy, sell, and trade waifu tokens",
        "🌐 Decentralized waifu economy powered by Base"
      ],
      gradient: "from-purple-900 via-pink-800 to-purple-900",
      emoji: "🚀",
      layout: "finale"
    }
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlide]);

  const renderSlideContent = (slide: any, index: number) => {
    switch (slide.layout) {
      case 'hero':
        return (
          <div className="max-w-6xl w-full">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="text-8xl mb-8 animate-pulse">{slide.emoji}</div>
              <h1 className="text-7xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-6">
                {slide.title}
              </h1>
              <p className="text-3xl text-white/90 mb-12">{slide.subtitle}</p>
              
              <div className="grid grid-cols-2 gap-6">
                {slide.content.map((item: string, idx: number) => (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.6 + idx * 0.1 }}
                    className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all"
                  >
                    <p className="text-white text-xl font-medium">{item}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        );

      case 'split':
        return (
          <div className="max-w-6xl w-full grid grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-6xl mb-6">{slide.emoji}</div>
              <h1 className="text-5xl font-bold text-white mb-4">{slide.title}</h1>
              <p className="text-2xl text-white/80">{slide.subtitle}</p>
            </motion.div>
            
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              {slide.content.map((item: string, idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                  className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border-l-4 border-pink-400"
                >
                  <p className="text-white text-lg">{item}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        );

      case 'circular':
        return (
          <div className="max-w-6xl w-full">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-16"
            >
              <div className="text-7xl mb-6">{slide.emoji}</div>
              <h1 className="text-5xl font-bold text-white mb-4">{slide.title}</h1>
              <p className="text-2xl text-white/80">{slide.subtitle}</p>
            </motion.div>

            <div className="grid grid-cols-2 gap-8">
              {slide.content.map((item: string, idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ scale: 0, opacity: 0, rotate: -10 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  transition={{ delay: 0.4 + idx * 0.2, type: "spring" }}
                  className="bg-gradient-to-br from-pink-500/20 to-red-500/20 backdrop-blur-lg rounded-2xl p-6 border border-pink-400/40 hover:scale-105 transition-all"
                >
                  <div className="text-center">
                    <div className="text-3xl mb-3">💝</div>
                    <p className="text-white text-lg font-medium">{item}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'base-special':
        return (
          <div className="max-w-6xl w-full">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-16"
            >
              <div className="flex items-center justify-center mb-8">
                <motion.div 
                  initial={{ rotate: -180, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center mr-8"
                >
                  <span className="text-4xl text-white font-bold">B</span>
                </motion.div>
                <div className="text-left">
                  <h1 className="text-6xl font-bold text-white mb-2">{slide.title}</h1>
                  <p className="text-2xl text-blue-200">{slide.subtitle}</p>
                </div>
              </div>
            </motion.div>

            <div className="space-y-6">
              {slide.content.map((item: string, idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ x: idx % 2 === 0 ? -100 : 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 + idx * 0.15, type: "spring" }}
                  className="bg-blue-500/30 backdrop-blur-lg rounded-2xl p-6 border border-blue-300/50 hover:bg-blue-500/40 transition-all"
                >
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-300 rounded-full mr-6 animate-pulse"></div>
                    <p className="text-white text-2xl font-semibold">{item}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'money':
        return (
          <div className="max-w-6xl w-full">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-12"
            >
              <div className="text-7xl mb-6">{slide.emoji}</div>
              <h1 className="text-5xl font-bold text-white mb-4">{slide.title}</h1>
              <p className="text-2xl text-white/80">{slide.subtitle}</p>
            </motion.div>

            <div className="grid grid-cols-2 gap-8">
              {slide.content.map((item: string, idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ rotateY: 90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  transition={{ delay: 0.4 + idx * 0.15 }}
                  className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-lg rounded-2xl p-8 border border-green-400/30 text-center"
                >
                  <div className="text-4xl mb-4">💎</div>
                  <p className="text-white text-xl font-semibold">{item}</p>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'finale':
        return (
          <div className="max-w-7xl w-full text-center">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="mb-16"
            >
              <div className="text-8xl mb-8 animate-bounce">{slide.emoji}</div>
              <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent mb-6">
                {slide.title}
              </h1>
              <p className="text-3xl text-white/90 mb-4">{slide.subtitle}</p>
              <div className="text-xl text-yellow-300 font-semibold bg-yellow-500/20 rounded-full px-6 py-2 inline-block">
                🎯 GAME CHANGING OPPORTUNITY
              </div>
            </motion.div>

            <div className="grid grid-cols-2 gap-8 mb-12">
              {slide.content.map((item: string, idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ scale: 0, opacity: 0, rotateY: 90 }}
                  animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                  transition={{ delay: 0.5 + idx * 0.2, type: "spring" }}
                  className="bg-gradient-to-br from-purple-500/30 to-pink-500/30 backdrop-blur-lg rounded-3xl p-8 border-2 border-purple-400/50 hover:border-pink-400/70 transition-all hover:scale-105"
                >
                  <p className="text-white text-xl font-bold leading-relaxed">{item}</p>
                </motion.div>
              ))}
            </div>
            
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-3xl p-8 border-2 border-orange-400/60"
            >
              <h3 className="text-3xl font-bold text-orange-300 mb-4">💡 The Vision</h3>
              <p className="text-white text-xl leading-relaxed">
                Transform from entertainment platform to <strong className="text-yellow-300">decentralized waifu economy</strong> where users become waifu entrepreneurs, earning passive income while building the future of AI companionship.
              </p>
            </motion.div>
          </div>
        );

      default:
        return (
          <div className="max-w-4xl w-full">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-12"
            >
              <div className="text-6xl mb-6">{slide.emoji}</div>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
                {slide.title}
              </h1>
              <p className="text-xl md:text-2xl text-white/80">
                {slide.subtitle}
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {slide.content.map((item: string, index: number) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
                >
                  <p className="text-white text-lg">{item}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-black overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
          className={`min-h-screen bg-gradient-to-br ${slides[currentSlide].gradient} flex flex-col`}
        >
          {/* Header */}
          <div className="p-6 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <span className="text-white font-bold">W</span>
              </div>
              <span className="text-white font-semibold">WaifuVerse</span>
            </div>
            <div className="text-white/60 text-sm">
              Slide {currentSlide + 1} of {slides.length}
            </div>
          </div>

          {/* Dynamic Content Based on Layout */}
          <div className="flex-1 flex items-center justify-center px-8">
            {renderSlideContent(slides[currentSlide], currentSlide)}
          </div>

          {/* Navigation */}
          <div className="p-6">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              <button
                onClick={prevSlide}
                disabled={currentSlide === 0}
                className={`px-6 py-3 rounded-full font-semibold transition-all ${
                  currentSlide === 0
                    ? 'bg-white/10 text-white/30 cursor-not-allowed'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                ← Previous
              </button>

              {/* Slide Indicators */}
              <div className="flex space-x-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentSlide
                        ? 'w-8 bg-white'
                        : 'bg-white/40 hover:bg-white/60'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={nextSlide}
                disabled={currentSlide === slides.length - 1}
                className={`px-6 py-3 rounded-full font-semibold transition-all ${
                  currentSlide === slides.length - 1
                    ? 'bg-white/10 text-white/30 cursor-not-allowed'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                Next →
              </button>
            </div>
          </div>

          {/* Call to Action on Last Slide */}
          {currentSlide === slides.length - 1 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="pb-12 text-center"
            >
              <a
                href="/"
                className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full hover:scale-105 transition-transform"
              >
                Launch WaifuVerse →
              </a>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Keyboard Controls Info */}
      <div className="fixed bottom-4 right-4 text-white/40 text-xs">
        Use arrow keys to navigate
      </div>
    </div>
  );
}