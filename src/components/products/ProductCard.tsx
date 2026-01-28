import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Pencil, 
  Trash2, 
  Zap, 
  Sun, 
  Thermometer, 
  Ruler, 
  Shield, 
  Clock,
  Award,
  Lightbulb
} from 'lucide-react';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export const ProductCard = ({ product, onEdit, onDelete }: ProductCardProps) => {
  return (
    <Card className="border-slate-700 bg-slate-800/50 hover:bg-slate-800/80 transition-all duration-200 overflow-hidden group">
      {/* Imagem */}
      <div className="relative h-40 bg-slate-900 flex items-center justify-center overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-contain p-4"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
        ) : (
          <Lightbulb className="h-16 w-16 text-slate-700" />
        )}
        
        {/* Badge da linha */}
        <Badge 
          className="absolute top-2 left-2 bg-amber-500/90 text-white border-0 text-xs"
        >
          {product.line}
        </Badge>
        
        {/* Ações no hover */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="secondary"
            size="icon"
            onClick={() => onEdit(product)}
            className="h-8 w-8 bg-slate-700/90 hover:bg-slate-600"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={() => onDelete(product.id)}
            className="h-8 w-8 bg-slate-700/90 hover:bg-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Cabeçalho */}
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-white line-clamp-2 leading-tight">
              {product.name}
            </h3>
            <span className="font-mono text-xs text-slate-500 shrink-0">
              #{product.code}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">{product.category}</p>
        </div>

        {/* Especificações principais */}
        <div className="grid grid-cols-2 gap-2">
          <SpecItem icon={Zap} label="Potência" value={`${product.power_watts}W`} />
          <SpecItem icon={Sun} label="Fluxo" value={product.luminous_flux} />
          <SpecItem icon={Thermometer} label="Temp. Cor" value={product.color_temperature} />
          <SpecItem icon={Lightbulb} label="Facho" value={product.beam_angle} />
        </div>

        {/* Especificações secundárias */}
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
            <Shield className="h-3 w-3 mr-1" />
            {product.ip_rating}
          </Badge>
          <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
            <Clock className="h-3 w-3 mr-1" />
            {product.life_expectancy}
          </Badge>
          <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
            <Award className="h-3 w-3 mr-1" />
            {product.warranty_years} anos
          </Badge>
        </div>

        {/* Dimensões */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Ruler className="h-3 w-3" />
          <span>{product.dimensions}</span>
        </div>

        {/* Rodapé com preço */}
        <div className="pt-2 border-t border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {product.voltage}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {product.irc}
            </Badge>
          </div>
          <span className="text-lg font-bold text-amber-400">
            R$ {product.price.toFixed(2)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

interface SpecItemProps {
  icon: React.ElementType;
  label: string;
  value: string;
}

const SpecItem = ({ icon: Icon, label, value }: SpecItemProps) => (
  <div className="flex items-center gap-2 bg-slate-900/50 rounded-md px-2 py-1.5">
    <Icon className="h-3.5 w-3.5 text-amber-500 shrink-0" />
    <div className="min-w-0">
      <p className="text-[10px] text-slate-500 uppercase tracking-wide">{label}</p>
      <p className="text-xs font-medium text-white truncate">{value}</p>
    </div>
  </div>
);
