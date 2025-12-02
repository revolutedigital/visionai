import toast, { Toast as ToastType } from 'react-hot-toast';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react';

/**
 * Utilitários para toast notifications customizados
 * Usa react-hot-toast com design system do projeto
 */

interface CustomToastProps {
  message: string;
  description?: string;
  icon?: React.ReactNode;
  t: ToastType;
}

function CustomToast({ message, description, icon, t }: CustomToastProps) {
  return (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          {icon && <div className="flex-shrink-0 pt-0.5">{icon}</div>}
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">{message}</p>
            {description && (
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            )}
          </div>
        </div>
      </div>
      <div className="flex border-l border-gray-200">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

/**
 * Toast de sucesso
 */
export function successToast(message: string, description?: string) {
  toast.custom((t) => (
    <CustomToast
      t={t}
      message={message}
      description={description}
      icon={<CheckCircle2 className="w-6 h-6 text-green-500" />}
    />
  ), {
    duration: 4000,
  });
}

/**
 * Toast de erro
 */
export function errorToast(message: string, description?: string) {
  toast.custom((t) => (
    <CustomToast
      t={t}
      message={message}
      description={description}
      icon={<AlertCircle className="w-6 h-6 text-red-500" />}
    />
  ), {
    duration: 6000,
  });
}

/**
 * Toast de aviso
 */
export function warningToast(message: string, description?: string) {
  toast.custom((t) => (
    <CustomToast
      t={t}
      message={message}
      description={description}
      icon={<AlertTriangle className="w-6 h-6 text-yellow-500" />}
    />
  ), {
    duration: 5000,
  });
}

/**
 * Toast de informação
 */
export function infoToast(message: string, description?: string) {
  toast.custom((t) => (
    <CustomToast
      t={t}
      message={message}
      description={description}
      icon={<Info className="w-6 h-6 text-blue-500" />}
    />
  ), {
    duration: 4000,
  });
}

/**
 * Toast de loading (útil para operações longas)
 */
export function loadingToast(message: string) {
  return toast.loading(message, {
    style: {
      background: '#fff',
      color: '#111827',
      borderRadius: '0.5rem',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    },
  });
}

/**
 * Remover toast de loading e mostrar resultado
 */
export function dismissLoadingToast(toastId: string, type: 'success' | 'error', message: string) {
  toast.dismiss(toastId);
  if (type === 'success') {
    successToast(message);
  } else {
    errorToast(message);
  }
}

/**
 * Toast de promessa (mostra loading → success/error automaticamente)
 */
export function promiseToast<T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string;
    error: string;
  }
): Promise<T> {
  return toast.promise(
    promise,
    {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    },
    {
      style: {
        background: '#fff',
        color: '#111827',
        borderRadius: '0.5rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      },
      success: {
        duration: 4000,
        icon: <CheckCircle2 className="w-6 h-6 text-green-500" />,
      },
      error: {
        duration: 6000,
        icon: <AlertCircle className="w-6 h-6 text-red-500" />,
      },
    }
  );
}

/**
 * Exportar toast original para casos específicos
 */
export { toast };
