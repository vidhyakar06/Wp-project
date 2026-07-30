import { useState } from 'react';
import { Sprout } from 'lucide-react';

const gradients = [
  'from-green-400 to-emerald-600',
  'from-lime-400 to-green-600',
  'from-amber-400 to-orange-600',
  'from-yellow-400 to-amber-600',
  'from-teal-400 to-cyan-600',
  'from-emerald-400 to-teal-600',
  'from-orange-400 to-red-500',
  'from-green-500 to-lime-600',
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

type CropImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
};

export default function CropImage({ src, alt, className = '' }: CropImageProps) {
  const [failed, setFailed] = useState(false);
  const showFallback = !src || failed;
  const gradient = gradients[hashString(alt) % gradients.length];

  if (showFallback) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br ${gradient} ${className}`}>
        <div className="flex flex-col items-center gap-1 text-white/90">
          <Sprout className="w-8 h-8" strokeWidth={1.5} />
          <span className="text-xs font-semibold tracking-wide">{alt}</span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src!}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
