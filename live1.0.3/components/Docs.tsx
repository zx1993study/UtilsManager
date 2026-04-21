
import React, { useState } from 'react';
import QuickStart from '../instructions/QuickStart';
import Connection from '../instructions/Connection';
import FeaturesGuide from '../instructions/FeaturesGuide';
import FAQ from '../instructions/FAQ';

type DocSection = 'quickstart' | 'connection' | 'features' | 'faq';
type FeatureSubSection = 'talk' | 'price' | 'warmup' | 'extend' | 'others';

interface DocsProps {
  onBack: () => void;
}

const Docs: React.FC<DocsProps> = ({ onBack }) => {
  const [activeSection, setActiveSection] = useState<DocSection>('quickstart');
  const [activeSub, setActiveSub] = useState<FeatureSubSection | null>(null);

  const sections = [
    { id: 'quickstart', title: '快速开始', icon: 'fa-rocket' },
    { id: 'connection', title: '硬件连接', icon: 'fa-plug-circle-bolt' },
    { 
      id: 'features', 
      title: '功能手册', 
      icon: 'fa-book-open',
      subItems: [
        { id: 'talk', title: '1. 讲解' },
        { id: 'price', title: '2. 改价' },
        { id: 'warmup', title: '3. 预热' },
        { id: 'extend', title: '4. 扩展' },
        { id: 'others', title: '5. 其他' },
      ]
    },
    { id: 'faq', title: '常见问题', icon: 'fa-circle-question' }
  ];

  const handleMainClick = (id: DocSection) => {
    setActiveSection(id);
    if (id === 'features') {
      setActiveSub('talk'); // Default to the first sub-item for Features
    } else {
      setActiveSub(null);
    }
  };

  const handleSubClick = (mainId: DocSection, subId: FeatureSubSection) => {
    setActiveSection(mainId);
    setActiveSub(subId);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'quickstart': return <QuickStart />;
      case 'connection': return <Connection />;
      case 'features': return <FeaturesGuide activeSub={activeSub || 'talk'} />;
      case 'faq': return <FAQ />;
      default: return <QuickStart />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-[5%] py-8 flex flex-col gap-8 min-h-[70vh] animate-in fade-in duration-700">
      {/* Top Action Bar with Back Button */}
      <div className="flex items-center">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 transition-all group font-bold text-sm"
        >
          <i className="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
          返回首页
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        <aside className="lg:w-72 flex-shrink-0">
          <div className="sticky top-28 space-y-2 bg-slate-50 border border-slate-200 p-4 rounded-3xl shadow-sm">
            <div className="mb-6 px-4">
              <h4 className="text-slate-900 font-bold text-lg">操作指引</h4>
            </div>
            
            <div className="space-y-1">
              {sections.map(section => (
                <div key={section.id} className="flex flex-col">
                  <button 
                    onClick={() => handleMainClick(section.id as DocSection)}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group ${
                      activeSection === section.id 
                        ? 'bg-cyan-50 text-cyan-600 border border-cyan-100 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      activeSection === section.id ? 'bg-cyan-600 text-white' : 'bg-slate-200 text-slate-500 group-hover:text-slate-700'
                    }`}>
                      <i className={`fa-solid ${section.icon} text-sm`}></i>
                    </div>
                    <span className="font-bold text-sm tracking-wide">{section.title}</span>
                  </button>

                  {section.subItems && (
                    <div className={`ml-12 mt-1 border-l border-slate-200 space-y-1 overflow-hidden transition-all duration-500 ${activeSection === 'features' ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'}`}>
                      {section.subItems.map(sub => (
                        <button
                          key={sub.id}
                          onClick={() => handleSubClick(section.id as DocSection, sub.id as FeatureSubSection)}
                          className={`w-full text-left px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                            activeSub === sub.id 
                              ? 'text-cyan-600 bg-cyan-50 translate-x-1' 
                              : 'text-slate-500 hover:text-slate-800 hover:translate-x-1'
                          }`}
                        >
                          {sub.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>


          </div>
        </aside>

        <div className="flex-grow bg-white border border-slate-200 rounded-[32px] p-8 md:p-12 shadow-xl overflow-hidden relative min-h-[500px]">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Docs;
