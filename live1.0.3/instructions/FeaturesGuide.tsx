
import React, { useState, useEffect } from 'react';

interface CarouselItem {
  title: string;
  url: string;
}

const ImageCarousel: React.FC<{ items: CarouselItem[]; label: string }> = ({ items, label }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    if (isZoomed) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % items.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [items.length, isZoomed]);

  return (
    <>
      <div className="relative h-72 overflow-hidden bg-slate-100 cursor-zoom-in group/carousel">
        {items.map((img, idx) => (
          <div 
            key={idx}
            onClick={() => setIsZoomed(true)}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out transform ${
              idx === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
            }`}
          >
            <img 
              src={img.url} 
              alt={img.title} 
              className="w-full h-full object-contain bg-white" 
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://placehold.co/800x450/f8fafc/0891b2?text=${encodeURIComponent(img.title)}`;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent z-10 opacity-60 group-hover/carousel:opacity-80 transition-opacity"></div>
            <div className="absolute bottom-6 left-8 z-20 text-white">
              <span className="px-2 py-0.5 bg-cyan-500 text-[10px] font-bold rounded uppercase mb-2 inline-block shadow-sm">{label}</span>
              <p className="text-xl font-bold">{img.title}</p>
              <p className="text-[10px] opacity-60 mt-1 flex items-center gap-1">
                <i className="fa-solid fa-magnifying-glass-plus"></i> 点击查看大图
              </p>
            </div>
          </div>
        ))}
        <div className="absolute top-6 right-8 z-20 flex gap-1.5">
          {items.map((_, idx) => (
            <button 
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentSlide(idx);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentSlide ? 'bg-white w-8' : 'bg-white/40 w-3'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Image Modal Overlay */}
      {isZoomed && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-300"
          onClick={() => setIsZoomed(false)}
        >
          <button 
            className="absolute top-8 right-8 text-white/50 hover:text-white text-3xl transition-colors p-2"
            onClick={() => setIsZoomed(false)}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
          
          <div 
            className="relative max-w-6xl w-full h-full flex flex-col items-center justify-center gap-6 animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={items[currentSlide].url} 
              alt={items[currentSlide].title}
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://placehold.co/1200x800/1e293b/0891b2?text=${encodeURIComponent(items[currentSlide].title)}`;
              }}
            />
            <div className="text-center">
              <h4 className="text-white text-2xl font-bold mb-2">{items[currentSlide].title}</h4>
              <div className="flex justify-center gap-2">
                {items.map((_, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      idx === currentSlide ? 'bg-cyan-500 scale-125' : 'bg-white/20 hover:bg-white/40'
                    }`}
                  />
                ))}
              </div>
            </div>
            
            {/* Navigation Arrows for Modal */}
            <button 
              onClick={() => setCurrentSlide((prev) => (prev - 1 + items.length) % items.length)}
              className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all hidden md:flex"
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <button 
              onClick={() => setCurrentSlide((prev) => (prev + 1) % items.length)}
              className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all hidden md:flex"
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

const HardwareMockup: React.FC<{ highlightedKeys: number[]; label: string; title: string }> = ({ highlightedKeys, label, title }) => {
  const keys = [
    '讲解1', '讲解2', '讲解3', '全讲解',
    '改价1', '改价2', '改价3', '全改价',
    '预热1', '预热2', '预热3', '预热4',
    '扩展1', '扩展2', '扩展3', '键盘/悬浮'
  ];

  return (
    <div className="relative h-72 overflow-hidden bg-slate-900 flex items-center justify-center">
      <div className="absolute inset-0 z-0 opacity-20">
        <img src="https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover" alt="" />
      </div>
      
      {/* Precision Hardware Mockup */}
      <div className="relative z-10 w-48 h-56 bg-[#121212] rounded-2xl border border-slate-700 shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-4 flex flex-col gap-2 transform transition-all duration-700 hover:scale-105 text-white">
        <div className="flex justify-between items-center mb-1">
          <div className="flex gap-1">
            <div className="w-6 h-1 bg-cyan-500/30 rounded-full"></div>
            <div className="w-2 h-1 bg-slate-700 rounded-full"></div>
          </div>
          <div className="flex gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 opacity-40"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-2 flex-grow">
          {keys.map((keyName, i) => (
            <div 
              key={i} 
              className={`rounded-lg border text-center flex items-center justify-center text-[6px] font-bold leading-tight transition-all duration-500 ${
                highlightedKeys.includes(i) 
                  ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.4)] scale-105 z-10' 
                  : 'bg-[#1a1a1a] text-slate-600 border-slate-800'
              }`}
            >
              {keyName}
            </div>
          ))}
          {/* Bottom helper row mimics physical photo */}
          <div className={`col-span-2 rounded-lg border text-[6px] flex items-center justify-center transition-all ${highlightedKeys.includes(16) ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.4)]' : 'bg-[#1a1a1a] border-slate-800 text-slate-700'}`}>还原</div>
          <div className={`col-span-2 rounded-lg border text-[6px] flex items-center justify-center transition-all ${highlightedKeys.includes(17) ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.4)]' : 'bg-[#1a1a1a] border-slate-800 text-slate-700'}`}>评论</div>
        </div>
        
        <div className="text-[7px] text-center font-bold text-slate-500 tracking-[3px] mt-1">LIVE CONTROL</div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent z-10"></div>
      <div className="absolute bottom-6 left-8 z-20 text-white">
        <span className="px-2 py-0.5 bg-purple-500 text-[10px] font-bold rounded uppercase mb-2 inline-block">{label}</span>
        <p className="text-xl font-bold">{title}</p>
      </div>
    </div>
  );
};

interface FeaturesGuideProps {
  activeSub: 'talk' | 'price' | 'warmup' | 'extend' | 'others';
}

const FeaturesGuide: React.FC<FeaturesGuideProps> = ({ activeSub }) => {
  return (
    <div key={activeSub} className="animate-in fade-in slide-in-from-right-4 duration-500">
      <h2 className="text-3xl font-bold mb-12 flex items-center gap-3 text-slate-900 border-b border-slate-100 pb-6">
        <span className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-lg text-emerald-600">
          <i className="fa-solid fa-book-open"></i>
        </span>
        功能手册
      </h2>

      <div className="space-y-12">
        {/* 1. 讲解 Section */}
        {activeSub === 'talk' && (
          <section className="animate-in fade-in duration-700">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-cyan-100 flex items-center justify-center text-cyan-600 shadow-sm border border-cyan-200">
                <i className="fa-solid fa-microphone-lines text-xl"></i>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900">讲解控制</h3>
                <p className="text-xs text-slate-400 font-medium">Talk & Product Showcase</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
              <div className="bg-slate-50 border border-slate-200/60 rounded-[32px] overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col group">
                <ImageCarousel 
                  label="后台配置" 
                  items={[
                    { title: '讲解键位设置', url: 'images/jiangjie1.png' },
                    { title: '单个商品绑定', url: 'images/jiangjie2.png' },
                    { title: '全讲解循环配置', url: 'images/jiangjie3.png' }
                  ]} 
                />
                <div className="p-8 md:p-10 flex-grow">
                  <h4 className="text-cyan-600 font-bold mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-desktop text-sm"></i> 后台配置
                  </h4>
                  <p className="text-sm text-slate-600 mb-6 leading-relaxed">精准控制直播间讲解弹窗的商品内容，实现主播讲到哪，中控弹到哪。</p>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-slate-100 hover:border-cyan-200 transition-all">
                      <span className="w-6 h-6 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center text-xs font-bold">1</span>
                      <p className="text-sm text-slate-500">支持单个商品精细化讲解绑定。</p>
                    </li>
                    <li className="flex items-start gap-3 p-4 bg-cyan-500/5 rounded-2xl border border-cyan-100">
                      <span className="w-6 h-6 rounded-full bg-cyan-500 text-white flex items-center justify-center text-[10px] shadow-sm"><i className="fa-solid fa-arrows-spin"></i></span>
                      <div className="flex flex-col">
                        <p className="text-sm font-bold text-cyan-800">全讲解模式</p>
                        <p className="text-xs text-cyan-700/70 mt-1">自动循环推送选中列表，无需人工干预。</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/60 rounded-[32px] overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col group">
                <div className="relative h-72 overflow-hidden bg-white flex items-center justify-center">
                  <img src="images/zhongkong.png" alt="中控设备" className="w-full h-full object-contain" />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent z-10"></div>
                  <div className="absolute bottom-6 left-8 z-20 text-slate-900">
                    <span className="px-2 py-0.5 bg-cyan-500 text-white text-[10px] font-bold rounded uppercase mb-2 inline-block">物理操作</span>
                    <p className="text-xl font-bold">讲解快捷键区</p>
                  </div>
                </div>
                <div className="p-8 md:p-10 flex-grow">
                  <h4 className="text-cyan-600 font-bold mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-keyboard text-sm"></i> 中控操作
                  </h4>
                  <p className="text-sm text-slate-600 mb-6 leading-relaxed">对应物理键盘首排四个按键，专为高频讲解动作设计，反馈迅速。</p>
                  <div className="p-4 bg-white rounded-2xl border border-slate-100 text-center">
                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">点按触发</p>
                    <p className="text-sm font-bold text-slate-700">即刻讲解对应的商品弹窗</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 2. 改价 Section */}
        {activeSub === 'price' && (
          <section className="animate-in fade-in duration-700">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600 shadow-sm border border-purple-200">
                <i className="fa-solid fa-tags text-xl"></i>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900">改价与库存</h3>
                <p className="text-xs text-slate-400 font-medium">Price Control & Stock</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
              <div className="bg-slate-50 border border-slate-200/60 rounded-[32px] overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col group">
                <ImageCarousel 
                  label="后台配置" 
                  items={[
                    { title: '改价键位设置', url: 'images/gaijia1.png' },
                    { title: '单个商品改价', url: 'images/gaijia2.png' },
                    { title: '多个商品改价', url: 'images/gaijia3.png' }
                  ]} 
                />
                <div className="p-8 md:p-10 flex-grow">
                  <h4 className="text-purple-600 font-bold mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-desktop text-sm"></i> 后台配置
                  </h4>
                  <p className="text-sm text-slate-600 mb-6 leading-relaxed">在憋单关键节点，实现毫秒级改价同步，确保全直播间用户体验一致。</p>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-slate-100">
                      <span className="w-6 h-6 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-xs font-bold">1</span>
                      <p className="text-sm text-slate-500">预设多级阶梯价，根据人气随时切换。</p>
                    </li>
                    <li className="flex items-start gap-3 p-4 bg-purple-500/5 rounded-2xl border border-purple-100">
                      <span className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-[10px]"><i className="fa-solid fa-bolt"></i></span>
                      <div className="flex flex-col">
                        <p className="text-sm font-bold text-purple-800">支持全改价</p>
                        <p className="text-xs text-purple-700/70 mt-1">一键同步所有选中商品价格，秒杀爆发更彻底。</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/60 rounded-[32px] overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col group">
                <div className="relative h-72 overflow-hidden bg-white flex items-center justify-center">
                  <img src="images/zhongkong.png" alt="中控设备" className="w-full h-full object-contain" />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent z-10"></div>
                  <div className="absolute bottom-6 left-8 z-20 text-slate-900">
                    <span className="px-2 py-0.5 bg-purple-500 text-white text-[10px] font-bold rounded uppercase mb-2 inline-block">物理操作</span>
                    <p className="text-xl font-bold">改价快捷键区</p>
                  </div>
                </div>
                <div className="p-8 md:p-10 flex-grow">
                  <h4 className="text-purple-600 font-bold mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-keyboard text-sm"></i> 中控操作
                  </h4>
                  <p className="text-sm text-slate-600 mb-6 leading-relaxed">对应物理键盘第二排。在主播高呼“3, 2, 1”时按下，极速占领用户心智。</p>
                  <div className="flex gap-4 p-4 bg-purple-50 border border-purple-100 rounded-2xl">
                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-purple-600 shadow-sm flex-shrink-0">
                      <i className="fa-solid fa-stopwatch-20"></i>
                    </div>
                    <p className="text-xs text-purple-800/80 leading-relaxed font-medium">
                      配合“全改价”键，可对直播间所有预热商品同时进行价格生效，瞬间引爆全场。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 3. 预热 Section */}
        {activeSub === 'warmup' && (
          <section className="animate-in fade-in duration-700">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 shadow-sm border border-red-200">
                <i className="fa-solid fa-fire-flame-curved text-xl"></i>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900">预热策略</h3>
                <p className="text-xs text-slate-400 font-medium">Pre-heat & Teaser</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
              <div className="bg-slate-50 border border-slate-200/60 rounded-[32px] overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col group">
                <ImageCarousel 
                  label="后台配置" 
                  items={[
                    { title: '预热键位设置', url: 'images/yure1.png' },
                    { title: '单个商品预热绑定', url: 'images/yure2.png' },
//                     { title: '预热组件管理', url: './yure3.png' }
                  ]} 
                />
                <div className="p-8 md:p-10 flex-grow">
                  <h4 className="text-red-600 font-bold mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-desktop text-sm"></i> 后台配置
                  </h4>
                  <p className="text-sm text-slate-600 mb-6 leading-relaxed">精准编排直播间的预热节奏，确保每一个爆款都有充分的铺垫氛围。</p>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-slate-100">
                      <span className="w-6 h-6 rounded-full bg-red-50 text-red-600 flex items-center justify-center text-xs font-bold">1</span>
                      <p className="text-sm text-slate-500">支持为每个预热按键独立绑定单个特定商品。</p>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/60 rounded-[32px] overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col group">
                <div className="relative h-72 overflow-hidden bg-white flex items-center justify-center">
                  <img src="images/zhongkong.png" alt="中控设备" className="w-full h-full object-contain" />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent z-10"></div>
                  <div className="absolute bottom-6 left-8 z-20 text-slate-900">
                    <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded uppercase mb-2 inline-block">物理操作</span>
                    <p className="text-xl font-bold">预热按键区</p>
                  </div>
                </div>
                <div className="p-8 md:p-10 flex-grow">
                  <h4 className="text-red-600 font-bold mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-keyboard text-sm"></i> 中控操作
                  </h4>
                  <p className="text-sm text-slate-600 mb-6 leading-relaxed">对应物理键盘第三排。四个独立键位可分别绑定单个预热商品，实现精准点火。</p>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3 text-xs text-slate-500 bg-white p-4 rounded-xl border border-slate-100">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <span className="font-bold">预热1-4: 分别触发对应绑定的商品预热组件</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 4. 扩展 Section */}
        {activeSub === 'extend' && (
          <section className="animate-in fade-in duration-700">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm border border-blue-200">
                <i className="fa-solid fa-wand-magic-sparkles text-xl"></i>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900">扩展功能</h3>
                <p className="text-xs text-slate-400 font-medium">Advanced & Customizable</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
              <div className="bg-slate-50 border border-slate-200/60 rounded-[32px] overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col group">
                <ImageCarousel 
                  label="后台配置" 
                  items={[
                    { title: '扩展功能设置', url: 'images/tuozhan1.png' },
                    { title: '扩展商品讲解、改价、预热功能', url: 'images/tuozhan2.png' },
                    { title: '扩展播放音频功能', url: 'images/tuozhan3.png' },
                    { title: '扩展评论功能', url: 'images/tuozhan4.png' }
                  ]} 
                />
                <div className="p-8 md:p-10 flex-grow">
                  <h4 className="text-blue-600 font-bold mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-desktop text-sm"></i> 后台配置
                  </h4>
                  <p className="text-sm text-slate-600 mb-6 leading-relaxed">支持将 “扩展1-3” 键位灵活自定义，满足直播间个性化操作需求。</p>
                  <div className="grid grid-cols-2 gap-3">
                    {['讲解', '改价', '预热', '评论', '播放音频'].map((item) => (
                      <div key={item} className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-slate-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                        <span className="text-xs font-medium text-slate-600">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/60 rounded-[32px] overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col group">
                <div className="relative h-72 overflow-hidden bg-white flex items-center justify-center">
                  <img src="images/zhongkong.png" alt="中控设备" className="w-full h-full object-contain" />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent z-10"></div>
                  <div className="absolute bottom-6 left-8 z-20 text-slate-900">
                    <span className="px-2 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded uppercase mb-2 inline-block">物理操作</span>
                    <p className="text-xl font-bold">扩展按键区</p>
                  </div>
                </div>
                <div className="p-8 md:p-10 flex-grow">
                  <h4 className="text-blue-600 font-bold mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-keyboard text-sm"></i> 中控操作
                  </h4>
                  <p className="text-sm text-slate-600 mb-6 leading-relaxed">对应物理键盘第四排。支持三个独立自定义键位（扩展1、2、3），一触即达。</p>
                  <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100">
                    <p className="text-[10px] text-blue-800 font-bold uppercase mb-2 tracking-widest">操作逻辑</p>
                    <p className="text-xs text-blue-700 leading-relaxed italic">
                      “无需离开当前操作流，即可触发预设的宏指令，无论是播放背景音还是快速回复粉丝评论，皆在指尖。”
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 5. 其他 Section */}
        {activeSub === 'others' && (
          <section className="animate-in fade-in duration-700 pb-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 shadow-sm border border-slate-200">
                <i className="fa-solid fa-sliders text-xl"></i>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900">其他设置</h3>
                <p className="text-xs text-slate-400 font-medium">Administration & Control</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
              <div className="bg-slate-50 border border-slate-200/60 rounded-[32px] overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col group">
                <ImageCarousel 
                  label="后台配置" 
                  items={[
                    { title: '评论键位设置', url: 'images/qita1.png' },
                    { title: '评论功能设置', url: 'images/qita2.png' },
                    { title: '打开悬浮窗布局', url: 'images/qita3.png' }
                  ]} 
                />
                <div className="p-8 md:p-10 flex-grow">
                  <h4 className="text-slate-600 font-bold mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-desktop text-sm"></i> 后台配置
                  </h4>
                  <p className="text-sm text-slate-600 mb-6 leading-relaxed">全方位掌控直播间的交互细节，从自动化评论到虚拟操控布局。</p>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-slate-100">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold">1</span>
                      <div className="flex flex-col">
                        <p className="text-sm font-bold text-slate-800">精细化评论策略</p>
                        <p className="text-xs text-slate-500 mt-1">支持设置评论循环次数与循环间隔。保存所有评论后，点击物理键即可按序列自动发送。</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3 p-4 bg-slate-900/5 rounded-2xl border border-slate-200">
                      <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]"><i className="fa-solid fa-window-restore"></i></span>
                      <div className="flex flex-col">
                        <p className="text-sm font-bold text-slate-800">键盘悬浮窗</p>
                        <p className="text-xs text-slate-700/70 mt-1">后台可开启全局悬浮窗，无需物理硬件也能实时操控所有中控功能。</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/60 rounded-[32px] overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col group">
                <div className="relative h-72 overflow-hidden bg-white flex items-center justify-center">
                  <img src="images/zhongkong.png" alt="中控设备" className="w-full h-full object-contain" />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent z-10"></div>
                  <div className="absolute bottom-6 left-8 z-20 text-slate-900">
                    <span className="px-2 py-0.5 bg-slate-500 text-white text-[10px] font-bold rounded uppercase mb-2 inline-block">物理操作</span>
                    <p className="text-xl font-bold">中控操作</p>
                  </div>
                </div>
                <div className="p-8 md:p-10 flex-grow">
                  <h4 className="text-slate-600 font-bold mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-keyboard text-sm"></i> 中控操作
                  </h4>
                  <p className="text-sm text-slate-600 mb-6 leading-relaxed">对应物理键盘底部的功能按键。用于执行全局系统指令与评论交互。</p>
                  <div className="space-y-4">
                    <div className="p-4 bg-white rounded-xl border border-slate-100 flex justify-between items-center group/item hover:border-red-100 transition-colors">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">还原 (Reset)</p>
                        <p className="text-xs font-bold text-slate-700">即刻终止当前评论发送任务</p>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500 group-hover/item:bg-red-500 group-hover/item:text-white transition-all">
                        <i className="fa-solid fa-stop text-sm"></i>
                      </div>
                    </div>
                    <div className="p-4 bg-white rounded-xl border border-slate-100 flex justify-between items-center group/item hover:border-cyan-100 transition-colors">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">评论 (Comment)</p>
                        <p className="text-xs font-bold text-slate-700">触发后台预设的循环发送序列</p>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-500 group-hover/item:bg-cyan-500 group-hover/item:text-white transition-all">
                        <i className="fa-solid fa-comments text-sm"></i>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 pt-6 border-t border-slate-100">
                    <p className="text-[11px] text-slate-400 italic leading-relaxed">
                      * 硬件底层支持 OTA 升级。配对时请同时按下“键盘悬浮窗”与“讲解1”键。指示灯亮起表示配对中，熄灭表示成功。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default FeaturesGuide;
