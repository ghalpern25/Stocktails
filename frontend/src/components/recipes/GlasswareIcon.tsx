import { Wine, GlassWater, Beer, Coffee } from 'lucide-react';

const GLASSWARE_ICONS: Record<string, React.ReactNode> = {
  'Rocks Glass': <GlassWater className="w-5 h-5 text-gray-600" />,
  'Collins Glass': <GlassWater className="w-5 h-5 text-gray-600" style={{ transform: 'scaleY(1.3)' }} />,
  'Coupe Glass': <Wine className="w-5 h-5 text-gray-600" style={{ transform: 'rotate(180deg)' }} />,
  'Martini Glass': <Wine className="w-5 h-5 text-gray-600" />,
  'Pint Glass': <GlassWater className="w-5 h-5 text-gray-600" style={{ transform: 'scaleY(1.2)' }} />,
  'Copper Mule Mug': <Coffee className="w-5 h-5 text-gray-600" />,
  'Wine Glass': <Wine className="w-5 h-5 text-gray-600" />,
  'Shot Glass': <Beer className="w-5 h-5 text-gray-600" style={{ transform: 'scale(0.7)' }} />,
  'Tiki Glass': <GlassWater className="w-5 h-5 text-gray-600" style={{ transform: 'scaleY(1.4)' }} />,
};

export function GlasswareIcon({ glassware }: { glassware: string | null }) {
  if (!glassware) return null;
  return GLASSWARE_ICONS[glassware] || <GlassWater className="w-5 h-5 text-gray-600" />;
}

export default GlasswareIcon;
