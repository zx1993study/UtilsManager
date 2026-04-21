
import React, { useEffect, useRef } from 'react';

const UniverseBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // 创建星星
    const createStars = () => {
      if (!containerRef.current) return;
      
      // 清除现有星星
      const existingStars = containerRef.current.querySelectorAll('.star');
      existingStars.forEach(star => star.remove());
      
      // 创建新星星
      for (let i = 0; i < 150; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        // 设置随机位置和大小
        const size = Math.random() * 2 + 1;
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const duration = Math.random() * 4 + 2;
        const delay = Math.random() * 5;
        
        // 应用样式
        star.style.position = 'absolute';
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${left}%`;
        star.style.top = `${top}%`;
        star.style.backgroundColor = 'white';
        star.style.borderRadius = '50%';
        star.style.boxShadow = `0 0 2px rgba(255,255,255,0.8)`;
        star.style.animation = `blink ${duration}s ease-in-out ${delay}s infinite`;
        
        containerRef.current.appendChild(star);
      }
    };
    
    createStars();
  }, []);
  
  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[-10] overflow-hidden"
      style={{
        background: 'radial-gradient(circle at center, #1a1a2e 0%, #000000 100%)'
      }}
    >
      {/* 太阳光晕 */}
      <div 
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(67,56,202,0.5) 0%, rgba(0,0,0,0) 70%)',
          filter: 'blur(30px)',
          zIndex: 0
        }}
      />
    </div>
  );
};

export default UniverseBackground;
