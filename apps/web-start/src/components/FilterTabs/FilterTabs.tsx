interface FilterTab {
  value: string;
  label: string;
}

interface FilterTabsProps {
  tabs: Array<FilterTab>;
  activeTab: string;
  onChange: (value: string) => void;
  className?: string;
}

export function FilterTabs({ tabs, activeTab, onChange, className = '' }: FilterTabsProps) {
  return (
    <div className={`flex gap-2 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
            activeTab === tab.value
              ? 'bg-white text-black'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
