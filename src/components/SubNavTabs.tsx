import React from 'react';

export type SubNavTabType = 'bulanan' | 'mtm' | 'ytd' | 'compare';

interface SubNavTabsProps {
  activeTab: SubNavTabType;
  onChangeTab: (tab: SubNavTabType) => void;
}

export const SubNavTabs: React.FC<SubNavTabsProps> = ({ activeTab, onChangeTab }) => {
  const tabs: Array<{ id: SubNavTabType; label: string }> = [
    { id: 'bulanan', label: 'Overview Bulanan' },
    { id: 'mtm', label: 'MTM Overview' },
    { id: 'ytd', label: 'YTD Overview' },
    { id: 'compare', label: 'Compare 2025 vs 2026' },
  ];

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-1.5 flex items-center overflow-x-auto scrollbar-none">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChangeTab(tab.id)}
            className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all text-center whitespace-nowrap cursor-pointer ${
              isActive
                ? 'bg-[#2b3548] text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
