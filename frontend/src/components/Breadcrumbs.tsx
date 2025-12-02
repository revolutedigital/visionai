import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  path: string;
}

/**
 * Breadcrumbs para navegação contextual
 * Mostra o caminho atual do usuário
 */
export function Breadcrumbs() {
  const location = useLocation();

  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const paths = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Mapear paths para labels legíveis
    const pathMap: Record<string, string> = {
      clientes: 'Clientes',
      pipeline: 'Pipeline',
      upload: 'Upload',
      configuracoes: 'Configurações',
    };

    paths.forEach((path, index) => {
      const fullPath = '/' + paths.slice(0, index + 1).join('/');

      // Se for um ID (UUID), usar "Detalhes"
      const isId = path.match(/^[a-f0-9-]{36}$/i);

      breadcrumbs.push({
        label: isId ? 'Detalhes' : pathMap[path] || path,
        path: fullPath,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  // Não mostrar breadcrumbs na home
  if (location.pathname === '/') {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center space-x-2 text-sm">
        {/* Home */}
        <li>
          <Link
            to="/"
            className="flex items-center gap-1 text-gray-600 hover:text-indigo-600 transition-colors"
            aria-label="Voltar para Dashboard"
          >
            <Home className="w-4 h-4" />
            <span className="sr-only">Dashboard</span>
          </Link>
        </li>

        {/* Breadcrumbs dinâmicos */}
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <li key={item.path} className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-gray-400" aria-hidden="true" />

              {isLast ? (
                <span
                  className="font-semibold text-gray-900"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.path}
                  className="text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
