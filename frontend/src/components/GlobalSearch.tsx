import { useState, useCallback, useEffect, useRef } from 'react';
import { Search, X, FileText, MapPin, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRateLimit, RATE_LIMIT_PRESETS } from '../hooks/useRateLimit';

interface SearchResult {
  id: string;
  type: 'cliente' | 'tipologia';
  title: string;
  subtitle?: string;
  path: string;
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Componente de busca global (Cmd+K / Ctrl+K)
 * Busca em clientes, tipologias, etc.
 */
export function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const { isAllowed } = useRateLimit(RATE_LIMIT_PRESETS.search);

  /**
   * Executar busca
   */
  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || !isAllowed()) return;

    setIsLoading(true);

    try {
      // Buscar clientes
      const response = await fetch(
        `http://localhost:5000/api/clientes?search=${encodeURIComponent(searchQuery)}`
      );

      if (response.ok) {
        const data = await response.json();

        const clientResults: SearchResult[] = (data.clientes || [])
          .slice(0, 5)
          .map((cliente: any) => ({
            id: cliente.id,
            type: 'cliente' as const,
            title: cliente.nome,
            subtitle: cliente.endereco || cliente.tipologia,
            path: `/clientes/${cliente.id}`,
          }));

        setResults(clientResults);
      }
    } catch (error) {
      console.error('Erro ao buscar:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAllowed]);

  /**
   * Debounce da busca
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        search(query);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, search]);

  /**
   * Focar input ao abrir
   */
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  /**
   * Keyboard navigation
   */
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = results[selectedIndex];
        if (selected) {
          navigate(selected.path);
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, navigate, onClose]);

  /**
   * Resetar ao fechar
   */
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-0 top-20 z-50 flex justify-center px-4 animate-slide-up">
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-200">
            <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar clientes, tipologias..."
              className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400"
            />
            {isLoading && <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />}
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              aria-label="Fechar busca"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Results */}
          {results.length > 0 ? (
            <div className="max-h-96 overflow-y-auto">
              {results.map((result, index) => (
                <button
                  key={result.id}
                  onClick={() => {
                    navigate(result.path);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 p-4 text-left transition-colors ${
                    index === selectedIndex
                      ? 'bg-indigo-50 border-l-4 border-indigo-600'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {result.type === 'cliente' ? (
                    <MapPin className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                  ) : (
                    <FileText className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{result.title}</p>
                    {result.subtitle && (
                      <p className="text-sm text-gray-600 truncate">{result.subtitle}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : query ? (
            <div className="p-8 text-center text-gray-500">
              {isLoading ? 'Buscando...' : 'Nenhum resultado encontrado'}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-400">
              <p className="text-sm">Digite para buscar...</p>
              <p className="text-xs mt-2">
                Use <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">↑</kbd>{' '}
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">↓</kbd> para navegar
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
