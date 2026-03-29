import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
}

const CosmicBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const starsRef = useRef<Star[]>([]);
  const { currentTheme } = useSelector((state: RootState) => state.theme);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    };

    const initStars = () => {
      const starCount = Math.min(200, Math.floor((canvas.width * canvas.height) / 10000));
      starsRef.current = [];
      
      for (let i = 0; i < starCount; i++) {
        starsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.8 + 0.2,
          speed: Math.random() * 0.5 + 0.1,
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Градиентный фон в зависимости от темы
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
      );
      
      switch (currentTheme) {
        case 'cosmic':
          gradient.addColorStop(0, 'rgba(30, 58, 138, 0.8)');
          gradient.addColorStop(0.5, 'rgba(15, 23, 42, 0.9)');
          gradient.addColorStop(1, 'rgba(2, 6, 23, 1)');
          break;
        case 'aurora':
          gradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)');
          gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.5)');
          gradient.addColorStop(1, 'rgba(29, 78, 216, 0.8)');
          break;
        case 'nebula':
          gradient.addColorStop(0, 'rgba(147, 51, 234, 0.4)');
          gradient.addColorStop(0.5, 'rgba(79, 70, 229, 0.6)');
          gradient.addColorStop(1, 'rgba(31, 41, 55, 0.9)');
          break;
        case 'galaxy':
          gradient.addColorStop(0, 'rgba(236, 72, 153, 0.3)');
          gradient.addColorStop(0.5, 'rgba(168, 85, 247, 0.5)');
          gradient.addColorStop(1, 'rgba(17, 24, 39, 0.9)');
          break;
        case 'dark':
          gradient.addColorStop(0, 'rgba(55, 65, 81, 0.5)');
          gradient.addColorStop(1, 'rgba(17, 24, 39, 0.9)');
          break;
        case 'light':
          gradient.addColorStop(0, 'rgba(219, 234, 254, 0.3)');
          gradient.addColorStop(1, 'rgba(147, 197, 253, 0.1)');
          break;
        default:
          gradient.addColorStop(0, 'rgba(30, 58, 138, 0.8)');
          gradient.addColorStop(1, 'rgba(2, 6, 23, 1)');
      }
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Анимация звёзд
      starsRef.current.forEach((star) => {
        // Обновление позиции
        star.y += star.speed;
        star.opacity += (Math.random() - 0.5) * 0.02;
        
        // Сброс звезды, если она вышла за экран
        if (star.y > canvas.height) {
          star.y = -10;
          star.x = Math.random() * canvas.width;
        }
        
        // Ограничение прозрачности
        star.opacity = Math.max(0.1, Math.min(1, star.opacity));
        
        // Рисование звезды
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.fill();
        
        // Добавление мерцания для больших звёзд
        if (star.size > 1.5) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 0.3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * 0.5})`;
          ctx.fill();
        }
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    animate();

    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentTheme]);

  return (
    <canvas
      ref={canvasRef}
      className="cosmic-background fixed inset-0 -z-10 pointer-events-none"
      style={{ zIndex: -1 }}
    />
  );
};

export default CosmicBackground;
