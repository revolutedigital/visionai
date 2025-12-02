import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useEffect, useState } from 'react';

interface BreadcrumbItem {
  label: string;
  path: string;
}

export function Breadcrumbs() {
  const location = useLocation();
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);

  useEffect(() => {
    const paths = location.pathname.split('/').filter(Boolean);
    const items: BreadcrumbItem[] = [];

    // Build breadcrumb items
    paths.forEach((path, index) => {
      const fullPath = '/' + paths.slice(0, index + 1).join('/');

      // Capitalize and format path
      let label = path.charAt(0).toUpperCase() + path.slice(1);

      // Custom labels for known routes
      if (path === 'clientes') label = 'Clientes';
      if (path === 'pipeline') label = 'Pipeline';
      if (path === 'upload') label = 'Upload';
      if (path === 'configuracoes') label = 'Configurações';

      items.push({ label, path: fullPath });
    });

    setBreadcrumbs(items);
  }, [location]);

  return (
    <nav className="flex items-center space-x-2 text-sm">
      {/* Home */}
      <Link
        to="/"
        className="flex items-center text-slate-600 hover:text-slate-900 transition-colors"
      >
        <Home className="w-4 h-4" />
      </Link>

      {/* Breadcrumb items */}
      {breadcrumbs.map((item, index) => (
        <div key={item.path} className="flex items-center space-x-2">
          <ChevronRight className="w-4 h-4 text-slate-400" />
          {index === breadcrumbs.length - 1 ? (
            // Last item (current page) - not clickable
            <span className="text-slate-900 font-medium">{item.label}</span>
          ) : (
            // Intermediate items - clickable
            <Link
              to={item.path}
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
