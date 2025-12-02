import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Hook para atalhos de teclado globais
 * Melhora navegação para usuários de teclado
 */
export function useKeyboardShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignorar se estiver em input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Atalhos com Alt
      if (e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'd':
            e.preventDefault();
            navigate('/');
            break;
          case 'c':
            e.preventDefault();
            navigate('/clientes');
            break;
          case 'p':
            e.preventDefault();
            navigate('/pipeline');
            break;
          case 'u':
            e.preventDefault();
            navigate('/upload');
            break;
        }
      }

      // ESC para fechar modais/detalhes
      if (e.key === 'Escape') {
        // Dispatch custom event para componentes ouvirem
        window.dispatchEvent(new CustomEvent('app:escape'));
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [navigate]);
}
