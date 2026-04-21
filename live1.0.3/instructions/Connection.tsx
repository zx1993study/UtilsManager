
import React from 'react';

const Connection: React.FC = () => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-slate-900">
        <span className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-sm text-purple-600">2</span>
        硬件连接
      </h2>
      <div className="space-y-8">
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-8 shadow-sm">
          <h4 className="text-slate-900 font-bold mb-4 text-xl">L-Sync 无感同步技术</h4>
          <p className="text-slate-600 leading-relaxed mb-6">
            徕控采用独有的无线同步技术。只需确保中控端与直播电脑处于同一局域网，系统将自动完成配对，无需物理连线。
          </p>
          
          {/* Pairing Instructions */}
          <div className="mb-8 p-6 bg-white rounded-2xl border border-emerald-100 shadow-sm">
            <h5 className="text-emerald-700 font-bold mb-4 flex items-center gap-2">
              <i className="fa-solid fa-sync"></i> 硬件配对流程
            </h5>
            <div className="space-y-4">
               <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <i className="fa-solid fa-plug text-slate-600 mt-1"></i>
                <div>
                  <p className="text-xs text-slate-500">将 USB 外接器插入电脑设备</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="px-3 py-1 bg-slate-100 border border-slate-200 rounded text-xs font-mono text-slate-700">同时按下</div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-md text-xs font-bold border border-cyan-200">键盘悬浮窗</span>
                  <span className="text-slate-400">+</span>
                  <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-md text-xs font-bold border border-cyan-200">讲解1</span>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-slate-500">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span>配对开始：右上角绿色指示灯亮起。</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                  <span>配对成功：指示灯熄灭。</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
            <div className="flex items-start gap-3 bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
              <i className="fa-solid fa-microchip text-purple-600 mt-1"></i>
              <div>
                <p className="text-slate-900 font-bold text-sm">运行环境</p>
                <p className="text-xs text-slate-500">Windows 7及以上 64位</p>
              </div>
            </div>
          </div>
        </div>

        <div className="prose prose-slate max-w-none text-slate-600">
          <h4 className="text-slate-900 font-bold">连接常见故障排查：</h4>
          <ul className="list-disc pl-5 space-y-2 mt-4 text-sm">
            <li>检查防火墙是否允许 "徕控.exe" 通过公网/私网访问。</li>
            <li>确保路由器没有开启“AP 隔离”功能。</li>
            <li>如果搜索不到设备，请手动输入电脑端显示的 IP 地址进行连接。</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Connection;
