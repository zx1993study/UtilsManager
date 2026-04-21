
import React from 'react';

const QuickStart: React.FC = () => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-slate-900">
        <span className="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center text-sm text-cyan-600">1</span>
        快速开始
      </h2>
      <div className="prose prose-slate max-w-none text-slate-600 space-y-6">
        <p className="text-lg">欢迎使用徕控 Live Control！请按照以下三个核心步骤完成您的直播中控系统配置：</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {[
            { 
              step: '01', 
              title: '下载安装', 
              desc: '在官网下载最新版的PC客户版并进行安装。建议安装在非系统盘以获得最佳性能。' 
            },
            { 
              step: '02', 
              title: '账号注册|登录', 
              desc: '运行客户端程序，首次登录需注册账号并使用激活码激活。本中控台采用“一机一码”制，激活码位于中控台背面。注册后登录进行后台配置。' 
            },
            { 
              step: '03', 
              title: '上架商品', 
              desc: '登录后在跳转页面选择抖音、快手或视频号进行扫码登录。进入后台开启直播，即可选择对应直播间进行上架商品操作。' 
            },
          ].map(item => (
            <div key={item.step} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 hover:border-cyan-200 hover:bg-white hover:shadow-lg transition-all">
              <span className="text-purple-600 font-mono font-bold text-2xl">{item.step}</span>
              <h4 className="text-slate-900 font-bold mt-3 mb-2 text-lg">{item.title}</h4>
              <p className="text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-cyan-50 border border-cyan-100 p-6 rounded-xl mt-8">
          <h4 className="text-cyan-700 font-bold mb-2">💡 激活提示</h4>
          <p className="text-sm">
            如果您在设备背面未找到激活码，或激活码扫描无效，请联系您的采购渠道获取技术支持。
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuickStart;
