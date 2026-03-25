import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    // Animate progress bar
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          // Fade out after completion
          setTimeout(() => {
            setOpacity(0);
            setTimeout(onComplete, 500);
          }, 300);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(progressInterval);
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0A0C12] transition-opacity duration-500"
      style={{ opacity }}
    >
      {/* Animated Background Stars */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              opacity: Math.random() * 0.5 + 0.3,
            }}
          />
        ))}
      </div>

      {/* Logo Container */}
      <div className="relative mb-8">
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#6C5CE7] to-[#00D9FF] rounded-full blur-2xl opacity-50 animate-pulse" />
        
        {/* Logo Circle */}
        <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-[#6C5CE7] to-[#00D9FF] flex items-center justify-center shadow-2xl">
          <span className="text-6xl font-bold text-white">N</span>
        </div>
      </div>

      {/* App Name */}
      <h1 className="text-4xl font-bold text-white mb-2 tracking-wider">NEXORA</h1>
      <p className="text-[#8E9AAF] text-sm mb-12">Cosmic Glass Messenger</p>

      {/* Progress Bar Container */}
      <div className="w-64 h-1 bg-[#1A1D2D] rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#6C5CE7] to-[#00D9FF] rounded-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(108,92,231,0.5)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Loading Text */}
      <p className="text-[#8E9AAF] text-xs mt-3 animate-pulse">Loading...</p>
    </div>
  );
};

export default SplashScreen;
