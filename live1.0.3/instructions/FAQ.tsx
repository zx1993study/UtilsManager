
import React from 'react';

const FAQ: React.FC = () => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-slate-900">
        <span className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-sm text-orange-600">4</span>
        常见问题 (FAQ)
      </h2>
      <div className="space-y-4">
        {[
          { q: '支持苹果 macOS 或移动端系统吗？', a: '目前系统仅支持 Windows 7及以上 64位。暂不支持 iMac (macOS)、iOS 或 Android 系统。' },
          { q: '使用该系统是否会被直播平台封号？', a: '徕控使用的是官方授权的开放平台协议，完全符合平台直播自律规范，不涉及任何外挂或非法注入操作。' },
          { q: '可以同时控制多个直播间吗？', a: '目前系统仅支持 1 对 1 监控与操控，暂无企业多控版本。' },
        ].map((faq, i) => (
          <div key={i} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-md">
            <h5 className="text-cyan-700 font-bold mb-3 flex gap-2">
              <span className="text-slate-300 font-mono">Q.</span>
              {faq.q}
            </h5>
            <div className="flex gap-2">
              <span className="text-slate-300 font-mono">A.</span>
              <p className="text-slate-600 text-sm leading-relaxed">{faq.a}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
