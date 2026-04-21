
import React from 'react';

interface NavbarProps {
  onNavigate: (page: 'home' | 'docs') => void;
  currentPage: 'home' | 'docs';
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage }) => {
  return (
    <nav className={`fixed top-0 left-0 w-full z-[100] backdrop-blur-md px-[5%] py-4 flex justify-between items-center transition-all duration-500 bg-[#050507]/80 border-b border-white/5 shadow-lg`}>
      <div 
        onClick={() => onNavigate('home')}
        className="text-2xl font-bold flex items-center gap-3 cursor-pointer group transition-all drop-shadow-[0_0_10px_rgba(0,242,255,0.5)]"
      >
        <img src="/images/logo.png" alt="徕控 Live Control" className="h-16 w-50 group-hover:scale-105 transition-transform" />
      </div>
      
      <div className="flex items-center gap-6">
        <a 
          href="#" 
          className="px-6 py-2 rounded-md text-sm font-bold transition-all border border-[#00f2ff] text-[#00f2ff] bg-cyan-500/5 hover:bg-[#00f2ff] hover:text-black hover:shadow-[0_0_20px_#00f2ff]"
        >
          下载客户端
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
