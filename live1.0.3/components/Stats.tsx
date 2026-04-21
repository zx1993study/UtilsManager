
import React from 'react';

const stats = [
  { icon: 'fa-infinity', val: '', label: '支持多平台切换' },
  { icon: '', val: '0.1s', label: '指令响应速度' },
  { icon: '', val: '99.9%', label: '系统稳定性' },
];

const Stats: React.FC = () => {
  return (
    <div className="mt-20 bg-white/[0.02] backdrop-blur-sm border-y border-white/10 py-12 px-5 flex flex-wrap justify-around text-center gap-10">
      {stats.map((s, idx) => (
        <div key={idx} className="flex flex-col items-center">
          <div className="text-4xl md:text-5xl text-[#bd00ff] font-mono font-bold mb-2">
            {s.icon ? <i className={`fa-solid ${s.icon}`}></i> : s.val}
          </div>
          <p className="text-slate-400 text-sm uppercase tracking-wider">{s.label}</p>
        </div>
      ))}
    </div>
  );
};

export default Stats;
