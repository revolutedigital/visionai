import { useNavigate } from 'react-router-dom';
import { Upload, Play, Users, BarChart3 } from 'lucide-react';

export function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      icon: Upload,
      label: 'Upload',
      onClick: () => navigate('/upload'),
      color: 'bg-white hover:bg-indigo-50',
      textColor: 'text-indigo-600',
    },
    {
      icon: Play,
      label: 'Pipeline',
      onClick: () => navigate('/pipeline'),
      color: 'bg-white hover:bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      icon: Users,
      label: 'Clientes',
      onClick: () => navigate('/clientes'),
      color: 'bg-white hover:bg-pink-50',
      textColor: 'text-pink-600',
    },
  ];

  return (
    <div className="flex flex-col gap-2">
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <button
            key={index}
            onClick={action.onClick}
            className={`${action.color} ${action.textColor} px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all shadow-sm hover:shadow-md`}
            aria-label={action.label}
          >
            <Icon className="w-4 h-4" />
            {action.label}
          </button>
        );
      })}
    </div>
  );
}
