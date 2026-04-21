
import React from 'react';

const features = [
  {
    icon: 'fa-bolt',
    title: '平播 & 快速过品',
    desc: '专为高频过品设计。一键弹窗讲解，无延迟同步，让主播与中控配合天衣无缝。',
    tags: ['0延迟', '极速响应']
  },
  {
    icon: 'fa-hourglass-half',
    title: '智能憋单系统',
    desc: '通过倒计时、限时改价、库存回滚组合拳，精准把控直播间流量波峰，拉爆人气。',
    tags: ['节奏控制', '转化提升']
  },
  {
    icon: 'fa-gem',
    title: '一物一拍',
    desc: '非标品（翡翠/二奢）专属模式。快速录入，生成专属下单链接，所见即所得。',
    tags: ['孤品神器', '快速上架']
  },
  {
    icon: 'fa-layer-group',
    title: '多 SKU 矩阵管理',
    desc: '复杂库存一键管理。支持多规格智能检索，无论多少个品，助播都能秒级定位。',
    tags: ['智能搜索', '库存同步']
  },
  {
    icon: 'fa-mobile-screen',
    title: '无线移动中控',
    desc: '彻底摆脱数据线。助播可在直播间自由走动配合，摆脱线缆束缚，互动更灵活。',
    tags: ['移动端', '自由走动']
  },
  {
    icon: 'fa-chart-line',
    title: '实时数据看板',
    desc: '可视化数据大屏，实时监控点击率与转化率，辅助运营即时调整排品策略。',
    tags: ['数据驱动', '策略辅助']
  }
];

const Features: React.FC = () => {
  return (
    <section id="features" className="py-24 px-[5%] relative z-10">
      <div className="text-center mb-16">
        <span className="text-[#00f2ff] uppercase tracking-[3px] text-xs font-bold block mb-4">Core Features</span>
        <h2 className="text-4xl md:text-5xl font-bold mb-4">六大核心引擎</h2>
        <p className="text-slate-400">全场景覆盖，为高转化直播间而生</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {features.map((f, idx) => (
          <div 
            key={idx} 
            className="group relative bg-white/[0.04] backdrop-blur-md border border-white/10 rounded-2xl p-8 transition-all duration-400 overflow-hidden hover:border-[#00f2ff] hover:-translate-y-2 hover:bg-white/[0.08] hover:shadow-[0_10px_40px_-10px_rgba(0,242,255,0.2)]"
          >
            {/* Hover Shine Effect */}
            <div className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent transition-all duration-700 group-hover:left-[100%]" />
            
            <div className="w-14 h-14 bg-gradient-to-br from-white/10 to-white/[0.02] border border-white/10 rounded-xl flex items-center justify-center mb-6 text-2xl text-[#00f2ff]">
              <i className={`fa-solid ${f.icon}`}></i>
            </div>
            
            <h3 className="text-xl font-bold mb-4 text-white">{f.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              {f.desc}
            </p>
            
            <div className="flex flex-wrap gap-2 mt-auto">
              {f.tags.map((tag, tidx) => (
                <span key={tidx} className="text-[10px] font-bold text-[#00f2ff] bg-cyan-500/10 px-3 py-1 rounded-full uppercase">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
