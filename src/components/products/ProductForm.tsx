import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Category, ProductLine } from '@/types';

export interface ProductFormData {
  code: string;
  name: string;
  description: string;
  category: string;
  line: string;
  price: string;
  image_url: string;
  power_watts: string;
  luminous_flux: string;
  color_temperature: string;
  beam_angle: string;
  dimensions: string;
  ip_rating: string;
  warranty_years: string;
  voltage: string;
  life_expectancy: string;
  irc: string;
  energy_class: string;
}

interface ProductFormProps {
  form: ProductFormData;
  onChange: (form: ProductFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  categories: Category[];
  lines: ProductLine[];
  isEditing: boolean;
}

const beamAngles = ['60°', '90°', '100°', '105°', '120°'];
const colorTemperatures = ['3000K', '4000K', '5000K', '6000K'];
const ipRatings = ['IP20', 'IP44', 'IP54', 'IP65', 'IP66', 'IP67', 'IP68'];
const voltages = ['127V', '220V', 'Bivolt'];
const energyClasses = ['Classe A', 'Classe B', 'Classe C'];
const ircOptions = ['IRC>70', 'IRC>80', 'IRC>90'];

export const ProductForm = ({
  form,
  onChange,
  onSubmit,
  onCancel,
  categories,
  lines,
  isEditing,
}: ProductFormProps) => {
  const updateField = (field: keyof ProductFormData, value: string) => {
    onChange({ ...form, [field]: value });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      {/* Seção: Identificação */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-amber-500 border-b border-slate-700 pb-1">
          Identificação
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Código *</Label>
            <Input
              value={form.code}
              onChange={(e) => updateField('code', e.target.value)}
              className="border-slate-600 bg-slate-700 h-9"
              required
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Preço (R$) *</Label>
            <Input
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) => updateField('price', e.target.value)}
              className="border-slate-600 bg-slate-700 h-9"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Nome *</Label>
          <Input
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            className="border-slate-600 bg-slate-700 h-9"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Linha</Label>
            <Select value={form.line} onValueChange={(v) => updateField('line', v)}>
              <SelectTrigger className="border-slate-600 bg-slate-700 h-9">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent className="border-slate-600 bg-slate-700">
                {lines.map((line) => (
                  <SelectItem key={line.id} value={line.name}>
                    {line.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Categoria</Label>
            <Select value={form.category} onValueChange={(v) => updateField('category', v)}>
              <SelectTrigger className="border-slate-600 bg-slate-700 h-9">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent className="border-slate-600 bg-slate-700">
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Descrição</Label>
          <Textarea
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            className="border-slate-600 bg-slate-700 min-h-[60px]"
            rows={2}
          />
        </div>
      </div>

      {/* Seção: Especificações Técnicas */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-amber-500 border-b border-slate-700 pb-1">
          Especificações Técnicas
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Potência (W)</Label>
            <Input
              type="number"
              value={form.power_watts}
              onChange={(e) => updateField('power_watts', e.target.value)}
              className="border-slate-600 bg-slate-700 h-9"
              placeholder="100"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Fluxo Luminoso</Label>
            <Input
              value={form.luminous_flux}
              onChange={(e) => updateField('luminous_flux', e.target.value)}
              className="border-slate-600 bg-slate-700 h-9"
              placeholder="13.380lm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Temp. de Cor</Label>
            <Select value={form.color_temperature} onValueChange={(v) => updateField('color_temperature', v)}>
              <SelectTrigger className="border-slate-600 bg-slate-700 h-9">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent className="border-slate-600 bg-slate-700">
                {colorTemperatures.map((temp) => (
                  <SelectItem key={temp} value={temp}>
                    {temp}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Abertura do Facho</Label>
            <Select value={form.beam_angle} onValueChange={(v) => updateField('beam_angle', v)}>
              <SelectTrigger className="border-slate-600 bg-slate-700 h-9">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent className="border-slate-600 bg-slate-700">
                {beamAngles.map((angle) => (
                  <SelectItem key={angle} value={angle}>
                    {angle}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Tensão</Label>
            <Select value={form.voltage} onValueChange={(v) => updateField('voltage', v)}>
              <SelectTrigger className="border-slate-600 bg-slate-700 h-9">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent className="border-slate-600 bg-slate-700">
                {voltages.map((volt) => (
                  <SelectItem key={volt} value={volt}>
                    {volt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Índice IP</Label>
            <Select value={form.ip_rating} onValueChange={(v) => updateField('ip_rating', v)}>
              <SelectTrigger className="border-slate-600 bg-slate-700 h-9">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent className="border-slate-600 bg-slate-700">
                {ipRatings.map((ip) => (
                  <SelectItem key={ip} value={ip}>
                    {ip}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Dimensões</Label>
            <Input
              value={form.dimensions}
              onChange={(e) => updateField('dimensions', e.target.value)}
              className="border-slate-600 bg-slate-700 h-9"
              placeholder="A:27xB:10xC:22 (cm)"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Vida Útil</Label>
            <Input
              value={form.life_expectancy}
              onChange={(e) => updateField('life_expectancy', e.target.value)}
              className="border-slate-600 bg-slate-700 h-9"
              placeholder="102.000h"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Garantia (anos)</Label>
            <Input
              type="number"
              value={form.warranty_years}
              onChange={(e) => updateField('warranty_years', e.target.value)}
              className="border-slate-600 bg-slate-700 h-9"
              placeholder="5"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">IRC</Label>
            <Select value={form.irc} onValueChange={(v) => updateField('irc', v)}>
              <SelectTrigger className="border-slate-600 bg-slate-700 h-9">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent className="border-slate-600 bg-slate-700">
                {ircOptions.map((irc) => (
                  <SelectItem key={irc} value={irc}>
                    {irc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Classe Energética</Label>
            <Select value={form.energy_class} onValueChange={(v) => updateField('energy_class', v)}>
              <SelectTrigger className="border-slate-600 bg-slate-700 h-9">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent className="border-slate-600 bg-slate-700">
                {energyClasses.map((cls) => (
                  <SelectItem key={cls} value={cls}>
                    {cls}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Seção: Imagem */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-amber-500 border-b border-slate-700 pb-1">
          Imagem
        </h3>
        <div className="space-y-1">
          <Label className="text-xs">URL da Imagem</Label>
          <Input
            value={form.image_url}
            onChange={(e) => updateField('image_url', e.target.value)}
            className="border-slate-600 bg-slate-700 h-9"
            placeholder="https://..."
          />
        </div>
      </div>

      {/* Botões */}
      <div className="flex justify-end gap-2 pt-2 border-t border-slate-700">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-amber-500 hover:bg-amber-600">
          {isEditing ? 'Salvar' : 'Cadastrar'}
        </Button>
      </div>
    </form>
  );
};
