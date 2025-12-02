import { useState, lazy, Suspense } from 'react';
import { Award, Activity, BarChart3, Image } from 'lucide-react';
import { Skeleton } from '../Skeleton';

// Lazy load das tabs para melhor performance
const TopPerformers = lazy(() => import('./tabs/TopPerformers'));
const TipologiaInsights = lazy(() => import('./tabs/TipologiaInsights'));
const DataQualityInsights = lazy(() => import('./tabs/DataQualityInsights'));
const VisualAnalysis = lazy(() => import('./tabs/VisualAnalysis'));

type TabId = 'performers' | 'tipologia' | 'quality' | 'visual';

interface Tab {
  id: TabId;
  label: string;
  icon: any;
  component: React.LazyExoticComponent<any>;
}

const tabs: Tab[] = [
  {
    id: 'performers',
    label: 'Top Performers',
    icon: Award,
    component: TopPerformers,
  },
  {
    id: 'tipologia',
    label: 'Tipologias',
    icon: Activity,
    component: TipologiaInsights,
  },
  {
    id: 'quality',
    label: 'Qualidade',
    icon: BarChart3,
    component: DataQualityInsights,
  },
  {
    id: 'visual',
    label: 'Visual',
    icon: Image,
    component: VisualAnalysis,
  },
];

export function InsightsTabs() {
  const [activeTab, setActiveTab] = useState<TabId>('performers');

  const ActiveComponent = tabs.find((t) => t.id === activeTab)?.component;

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-semibold text-sm transition-all ${
                  isActive
                    ? 'border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                aria-label={`Ver ${tab.label}`}
                aria-selected={isActive}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        <Suspense
          fallback={
            <div className="space-y-4">
              <Skeleton width="100%" height={80} variant="rounded" />
              <Skeleton width="100%" height={120} variant="rounded" />
              <Skeleton width="100%" height={100} variant="rounded" />
            </div>
          }
        >
          {ActiveComponent && <ActiveComponent />}
        </Suspense>
      </div>
    </div>
  );
}
