
import React from 'react';

interface HeroProps {
  onNavigate: () => void;
}

const platforms = [
  { name: '抖音直播', img: 'images/douyin.png' },
  { name: '快手直播', img: 'images/kuaishou.png' },
  { name: '视频号直播', img: 'images/wxshipin.png' },
];

const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  return (
    <section className="min-h-[90vh] flex flex-col justify-center items-center text-center pb-[60px] px-5 relative bg-transparent">
      <div className="z-10 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] mb-6 tracking-tight">
          <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">重新定义</span>
          <br />
          <span className="bg-gradient-to-r from-[#00f2ff] to-[#bd00ff] bg-clip-text text-transparent">助播中控体验</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12">
          专为带货直播设计的智能中控台。不仅仅是中控，更是您的智能直播大脑。
          <br className="hidden md:block" />
          极简操作，毫秒级响应，一部中控掌控全场节奏。
        </p>

        {/* Platform Showcase */}
        <div className="flex flex-wrap justify-center gap-6 mb-14">
          {platforms.map((platform, idx) => (
            <div 
              key={idx} 
              className="group bg-white/5 border border-white/10 backdrop-blur-sm p-5 rounded-2xl flex flex-col items-center w-[140px] transition-all hover:-translate-y-2 hover:bg-white/10 hover:border-[#00f2ff] hover:shadow-[0_0_20px_rgba(0,242,255,0.2)]"
            >
              <div className="w-20 h-20 mb-4 flex items-center justify-center rounded-2xl bg-black/40 overflow-hidden ring-1 ring-white/10 group-hover:ring-[#00f2ff]/30">
                <img src={platform.img} alt={platform.name} className="w-full h-full object-cover" />
              </div>
              <span className="text-sm font-bold text-slate-200">{platform.name}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-5 justify-center">
          <button className="bg-gradient-to-r from-[#bd00ff] to-[#8a2be2] text-white px-10 py-4 rounded-full font-bold text-lg shadow-[0_4px_15px_rgba(189,0,255,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(189,0,255,0.7)]">
            立即下载
          </button>
          <button 
            onClick={onNavigate}
            className="border border-[#00f2ff] text-[#00f2ff] px-10 py-4 rounded-full font-bold text-lg bg-cyan-500/5 transition-all hover:bg-[#00f2ff] hover:text-black hover:shadow-[0_0_20px_#00f2ff]"
          >
            功能演示 & 说明
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
