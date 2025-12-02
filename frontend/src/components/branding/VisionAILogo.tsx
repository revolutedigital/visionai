interface VisionAILogoProps {
  variant?: 'full' | 'icon' | 'text';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function VisionAILogo({ variant = 'full', size = 'md', className = '' }: VisionAILogoProps) {
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-12',
  };

  const iconSizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl',
  };

  // Icon only - Stylized eye with neural network
  if (variant === 'icon') {
    return (
      <div className={`${iconSizeClasses[size]} ${className}`}>
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Outer eye shape with gradient */}
          <defs>
            <linearGradient id="eyeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
            <linearGradient id="pupilGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e40af" />
              <stop offset="100%" stopColor="#3730a3" />
            </linearGradient>
          </defs>

          {/* Eye outline */}
          <path
            d="M10 50 Q 10 30, 50 30 Q 90 30, 90 50 Q 90 70, 50 70 Q 10 70, 10 50 Z"
            fill="url(#eyeGradient)"
            stroke="currentColor"
            strokeWidth="2"
            className="text-indigo-700"
          />

          {/* Iris */}
          <circle cx="50" cy="50" r="18" fill="url(#pupilGradient)" />

          {/* Pupil with data point */}
          <circle cx="50" cy="50" r="10" fill="#1e1b4b" />
          <circle cx="50" cy="50" r="3" fill="#60a5fa" className="animate-pulse" />

          {/* Neural network connections */}
          <g opacity="0.6" className="text-indigo-300" stroke="currentColor" strokeWidth="1.5">
            <line x1="50" y1="32" x2="50" y2="20" strokeDasharray="2,2" />
            <line x1="68" y1="50" x2="80" y2="50" strokeDasharray="2,2" />
            <line x1="50" y1="68" x2="50" y2="80" strokeDasharray="2,2" />
            <line x1="32" y1="50" x2="20" y2="50" strokeDasharray="2,2" />
          </g>

          {/* Data nodes */}
          <circle cx="50" cy="20" r="3" fill="#a78bfa" />
          <circle cx="80" cy="50" r="3" fill="#a78bfa" />
          <circle cx="50" cy="80" r="3" fill="#a78bfa" />
          <circle cx="20" cy="50" r="3" fill="#a78bfa" />
        </svg>
      </div>
    );
  }

  // Text only
  if (variant === 'text') {
    return (
      <div className={`font-bold ${textSizeClasses[size]} ${className}`}>
        <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-purple-700 bg-clip-text text-transparent">
          Vision
        </span>
        <span className="text-indigo-900 ml-1">AI</span>
      </div>
    );
  }

  // Full logo with icon + text - render icon inline to avoid recursion
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Icon inline */}
      <div className={iconSizeClasses[size]}>
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="eyeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
            <linearGradient id="pupilGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e40af" />
              <stop offset="100%" stopColor="#3730a3" />
            </linearGradient>
          </defs>
          <path
            d="M10 50 Q 10 30, 50 30 Q 90 30, 90 50 Q 90 70, 50 70 Q 10 70, 10 50 Z"
            fill="url(#eyeGradient)"
            stroke="currentColor"
            strokeWidth="2"
            className="text-indigo-700"
          />
          <circle cx="50" cy="50" r="18" fill="url(#pupilGradient)" />
          <circle cx="50" cy="50" r="10" fill="#1e1b4b" />
          <circle cx="50" cy="50" r="3" fill="#60a5fa" className="animate-pulse" />
          <g opacity="0.6" className="text-indigo-300" stroke="currentColor" strokeWidth="1.5">
            <line x1="50" y1="32" x2="50" y2="20" strokeDasharray="2,2" />
            <line x1="68" y1="50" x2="80" y2="50" strokeDasharray="2,2" />
            <line x1="50" y1="68" x2="50" y2="80" strokeDasharray="2,2" />
            <line x1="32" y1="50" x2="20" y2="50" strokeDasharray="2,2" />
          </g>
          <circle cx="50" cy="20" r="3" fill="#a78bfa" />
          <circle cx="80" cy="50" r="3" fill="#a78bfa" />
          <circle cx="50" cy="80" r="3" fill="#a78bfa" />
          <circle cx="20" cy="50" r="3" fill="#a78bfa" />
        </svg>
      </div>
      {/* Text */}
      <div className={`font-bold ${textSizeClasses[size]}`}>
        <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-purple-700 bg-clip-text text-transparent">
          Vision
        </span>
        <span className="text-indigo-900">AI</span>
      </div>
    </div>
  );
}
