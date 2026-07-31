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

const cropSlugMap: Record<string, string> = {
  'bajra': 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=600&q=80',
  'banana': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80',
  'black gram': '/crops/black-gram.png',
  'brinjal': '/crops/brinjal.png',
  'cabbage': 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?auto=format&fit=crop&w=600&q=80',
  'carrot': 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80',
  'cauliflower': 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?auto=format&fit=crop&w=600&q=80',
  'chilli': '/crops/chilli.png',
  'coconut': '/crops/coconut.png',
  'coffee': '/crops/coffee.png',
  'coriander': 'https://images.unsplash.com/photo-1588879460618-9249e7d947d1?auto=format&fit=crop&w=600&q=80',
  'cotton': '/crops/cotton.png',
  'cucumber': 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?auto=format&fit=crop&w=600&q=80',
  'garlic': 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?auto=format&fit=crop&w=600&q=80',
  'ginger': 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80',
  'gram': '/crops/gram.png',

  'green gram': '/crops/green-gram.png',

  'groundnut': '/crops/groundnut.jpg',


  'jowar': 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=600&q=80',
  'jute': '/crops/jute.png',
  'maize': 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80',
  'mango': 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80',
  'mustard': 'https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&w=600&q=80',
  'okra': 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=600&q=80',
  'onion': 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80',
  'paddy': '/crops/paddy.png',
  'papaya': 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?auto=format&fit=crop&w=600&q=80',
  'peas': 'https://images.unsplash.com/photo-1592394533824-9440e5d68510?auto=format&fit=crop&w=600&q=80',
  'pigeon pea': 'https://images.unsplash.com/photo-1515543904379-3d757afe72e3?auto=format&fit=crop&w=600&q=80',
  'potato': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80',
  'radish': 'https://images.unsplash.com/photo-1593105544559-ecb03bf76f82?auto=format&fit=crop&w=600&q=80',
  'ragi': 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=600&q=80',
  'rubber': 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80',
  'sesame': 'https://images.unsplash.com/photo-1508061252966-dfd30f67ea5d?auto=format&fit=crop&w=600&q=80',
  'soybean': '/crops/soybean.png',
  'sugarcane': '/crops/sugarcane.png',
  'sunflower': 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=600&q=80',
  'tea': '/crops/tea.png',
  'tobacco': 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80',
  'tomato': 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
  'turmeric': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
  'watermelon': 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&w=600&q=80',
  'wheat': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
};

const defaultFarmImage = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80';

const diseaseSlugMap: Record<string, string> = {
  'anthracnose': '/crops/chilli.png',
  'chilli anthracnose': '/crops/chilli.png',

  'bacterial blight': '/crops/paddy-blight.png',
  'paddy bacterial blight': '/crops/paddy-blight.png',

  'bacterial wilt': 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
  'tomato bacterial wilt': 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',

  'blast': 'https://images.unsplash.com/photo-1535241749838-299277b6305f?auto=format&fit=crop&w=600&q=80',
  'paddy blast': 'https://images.unsplash.com/photo-1535241749838-299277b6305f?auto=format&fit=crop&w=600&q=80',

  'bollworm': '/crops/cotton.png',
  'cotton bollworm': '/crops/cotton.png',

  'downy mildew': 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80',
  'maize downy mildew': 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80',

  'early blight': 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
  'tomato early blight': 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',

  'late blight': '/crops/potato-blight.png',
  'potato late blight': '/crops/potato-blight.png',

  'leaf curl': 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=600&q=80',
  'cotton leaf curl': 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=600&q=80',
  'chilli leaf curl': 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=600&q=80',

  'panama wilt': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80',
  'banana panama wilt': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80',

  'purple blotch': 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80',
  'onion purple blotch': 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80',

  'red rot': '/crops/sugarcane.png',
  'sugarcane red rot': '/crops/sugarcane.png',

  'rust': '/crops/wheat-rust.png',
  'wheat rust': '/crops/wheat-rust.png',

  'scab': '/crops/potato-blight.png',
  'potato scab': '/crops/potato-blight.png',

  'sigatoka leaf spot': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80',
  'banana sigatoka leaf spot': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80',

  'smut': '/crops/wheat-smut.png',
  'wheat smut': '/crops/wheat-smut.png',

  'stalk rot': 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80',
  'maize stalk rot': 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80',

  'tikka disease': 'https://images.unsplash.com/photo-1567892320421-1c657571ea48?auto=format&fit=crop&w=600&q=80',
  'groundnut tikka disease': 'https://images.unsplash.com/photo-1567892320421-1c657571ea48?auto=format&fit=crop&w=600&q=80',

  'yellow mosaic': '/crops/soybean.png',
  'soybean yellow mosaic': '/crops/soybean.png',
};

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
  const slug = alt.toLowerCase().trim();
  const mappedUrl = cropSlugMap[slug] || diseaseSlugMap[slug];
  const localFallback = mappedUrl || defaultFarmImage;
  
  const [imgState, setImgState] = useState<'primary' | 'fallback' | 'failed'>('primary');
  const gradient = gradients[hashString(alt) % gradients.length];

  // Always prefer mappedUrl if available (since Pexels/wrong DB URLs can fail or be inaccurate)
  const isPexelsSrc = src && src.includes('pexels.com');
  const initialSrc = mappedUrl || (isPexelsSrc ? null : src) || localFallback;

  const currentSrc = imgState === 'primary' 
    ? initialSrc 
    : (imgState === 'fallback' ? localFallback : null);

  const handleError = () => {
    if (imgState === 'primary' && currentSrc !== localFallback) {
      setImgState('fallback');
    } else {
      setImgState('failed');
    }
  };

  if (imgState === 'failed' || !currentSrc) {
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
      src={currentSrc}
      alt={alt}
      loading="lazy"
      onError={handleError}
      className={className}
    />
  );
}




