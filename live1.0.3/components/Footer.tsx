
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="py-16 px-5 border-t border-white/5 bg-[#050507] text-white text-center">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-center mb-6 group cursor-default">
          <img src="/images/logo.png" alt="徕控 Live Control" className="h-16 w-50 group-hover:scale-105 transition-transform duration-500" />
        </div>
        
        <p className="text-slate-500 text-sm max-w-md mx-auto mb-8 leading-relaxed">
          重新定义助播中控体验，为每一场高转化直播提供最稳健的技术基石。
        </p>
        
        <div className="flex justify-center gap-8 text-slate-400 text-sm font-medium mb-10">
          <a href="#" className="hover:text-[#00f2ff] transition-colors">关于我们</a>
          <a href="#" className="hover:text-[#00f2ff] transition-colors">隐私政策</a>
          <a href="#" className="hover:text-[#00f2ff] transition-colors">服务条款</a>
          <a href="#" className="hover:text-[#00f2ff] transition-colors">合作咨询</a>
        </div>

        <div className="pt-8 border-t border-white/5">
          <p className="text-slate-600 text-xs">
            &copy; {new Date().getFullYear()} 徕控科技 (Live Control Tech). All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
