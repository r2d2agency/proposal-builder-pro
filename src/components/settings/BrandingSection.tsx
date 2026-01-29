import { useState, useRef, ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Palette, Upload, X, Loader2, Link } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/hooks/use-toast';

interface BrandingSettings {
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_family: string;
}

interface BrandingSectionProps {
  settings: BrandingSettings;
  onChange: (settings: BrandingSettings) => void;
}

const fontOptions = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Lato', label: 'Lato' },
];

export const BrandingSection = ({ settings, onChange }: BrandingSectionProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile } = useApi();
  const { toast } = useToast();

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Arquivo inválido',
        description: 'Por favor, selecione apenas arquivos de imagem.',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: 'O tamanho máximo é 5MB.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      const data = await uploadFile(file);
      onChange({ ...settings, logo_url: data.url });
      toast({
        title: 'Logo enviado!',
        description: 'Logo atualizado com sucesso.',
      });
    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: 'Erro no upload',
        description: 'Não foi possível enviar a imagem. Verifique se o backend está configurado.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange({ ...settings, logo_url: urlInput.trim() });
      setUrlInput('');
      toast({
        title: 'Logo atualizado!',
        description: 'URL do logo definida com sucesso.',
      });
    }
  };

  const handleClearLogo = () => {
    onChange({ ...settings, logo_url: '' });
  };

  return (
    <Card className="border-slate-700 bg-slate-800/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-amber-500" />
          <CardTitle className="text-white">Identidade Visual</CardTitle>
        </div>
        <CardDescription className="text-slate-400">
          Configure as cores e logo que serão usados nos catálogos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Logo Upload */}
        <div className="space-y-3">
          <Label className="text-slate-300">Logo da Empresa</Label>
          {settings.logo_url ? (
            <div className="relative group">
              <div className="flex items-center gap-4 rounded-lg border border-slate-600 bg-slate-900 p-4">
                <img
                  src={settings.logo_url}
                  alt="Logo"
                  className="h-16 w-auto max-w-[200px] object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="border-slate-600"
                  >
                    <Upload className="mr-1 h-4 w-4" />
                    Trocar
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleClearLogo}
                  >
                    <X className="mr-1 h-4 w-4" />
                    Remover
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>
          ) : (
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-700">
                <TabsTrigger value="upload" className="text-xs">
                  <Upload className="mr-1 h-3 w-3" />
                  Enviar Arquivo
                </TabsTrigger>
                <TabsTrigger value="url" className="text-xs">
                  <Link className="mr-1 h-3 w-3" />
                  URL
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="mt-3">
                <div
                  className="flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed border-slate-600 p-8 transition-colors hover:border-amber-500/50"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {isUploading ? (
                    <>
                      <Loader2 className="h-12 w-12 animate-spin text-amber-500" />
                      <span className="text-sm text-slate-400">Enviando...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-12 w-12 text-slate-500" />
                      <span className="text-sm text-slate-400">
                        Clique para enviar o logo da empresa
                      </span>
                      <span className="text-xs text-slate-500">PNG, JPG, SVG ou WebP (máx. 5MB)</span>
                    </>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="url" className="mt-3 space-y-3">
                <Input
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://exemplo.com/logo.png"
                  className="border-slate-600 bg-slate-700 text-white"
                />
                <Button
                  type="button"
                  onClick={handleUrlSubmit}
                  disabled={!urlInput.trim()}
                  className="w-full bg-amber-500 hover:bg-amber-600"
                >
                  Usar URL
                </Button>
              </TabsContent>
            </Tabs>
          )}
        </div>

        {/* Colors */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label className="text-slate-300">Cor Primária</Label>
            <div className="flex gap-2">
              <div
                className="h-10 w-10 cursor-pointer rounded-lg border border-slate-600 shrink-0"
                style={{ backgroundColor: settings.primary_color }}
                onClick={() => document.getElementById('primary-color')?.click()}
              />
              <Input
                id="primary-color"
                type="color"
                value={settings.primary_color}
                onChange={(e) => onChange({ ...settings, primary_color: e.target.value })}
                className="sr-only"
              />
              <Input
                value={settings.primary_color}
                onChange={(e) => onChange({ ...settings, primary_color: e.target.value })}
                className="flex-1 border-slate-600 bg-slate-700 text-white font-mono text-sm"
                placeholder="#000000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Cor Secundária</Label>
            <div className="flex gap-2">
              <div
                className="h-10 w-10 cursor-pointer rounded-lg border border-slate-600 shrink-0"
                style={{ backgroundColor: settings.secondary_color }}
                onClick={() => document.getElementById('secondary-color')?.click()}
              />
              <Input
                id="secondary-color"
                type="color"
                value={settings.secondary_color}
                onChange={(e) => onChange({ ...settings, secondary_color: e.target.value })}
                className="sr-only"
              />
              <Input
                value={settings.secondary_color}
                onChange={(e) => onChange({ ...settings, secondary_color: e.target.value })}
                className="flex-1 border-slate-600 bg-slate-700 text-white font-mono text-sm"
                placeholder="#000000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Cor de Destaque</Label>
            <div className="flex gap-2">
              <div
                className="h-10 w-10 cursor-pointer rounded-lg border border-slate-600 shrink-0"
                style={{ backgroundColor: settings.accent_color }}
                onClick={() => document.getElementById('accent-color')?.click()}
              />
              <Input
                id="accent-color"
                type="color"
                value={settings.accent_color}
                onChange={(e) => onChange({ ...settings, accent_color: e.target.value })}
                className="sr-only"
              />
              <Input
                value={settings.accent_color}
                onChange={(e) => onChange({ ...settings, accent_color: e.target.value })}
                className="flex-1 border-slate-600 bg-slate-700 text-white font-mono text-sm"
                placeholder="#000000"
              />
            </div>
          </div>
        </div>

        {/* Font */}
        <div className="space-y-2">
          <Label className="text-slate-300">Fonte</Label>
          <select
            value={settings.font_family}
            onChange={(e) => onChange({ ...settings, font_family: e.target.value })}
            className="w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-white"
          >
            {fontOptions.map((font) => (
              <option key={font.value} value={font.value}>
                {font.label}
              </option>
            ))}
          </select>
        </div>

        {/* Preview */}
        <div className="space-y-2">
          <Label className="text-slate-300">Prévia das Cores</Label>
          <div className="flex gap-4 rounded-lg border border-slate-600 bg-slate-900 p-4">
            <div className="flex flex-col items-center gap-1">
              <div
                className="h-12 w-12 rounded-lg"
                style={{ backgroundColor: settings.primary_color }}
              />
              <span className="text-xs text-slate-400">Primária</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div
                className="h-12 w-12 rounded-lg"
                style={{ backgroundColor: settings.secondary_color }}
              />
              <span className="text-xs text-slate-400">Secundária</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div
                className="h-12 w-12 rounded-lg"
                style={{ backgroundColor: settings.accent_color }}
              />
              <span className="text-xs text-slate-400">Destaque</span>
            </div>
            <div className="ml-4 flex flex-1 flex-col justify-center">
              <span
                className="text-lg font-bold"
                style={{ fontFamily: settings.font_family, color: settings.primary_color }}
              >
                Título de Exemplo
              </span>
              <span
                className="text-sm"
                style={{ fontFamily: settings.font_family, color: settings.secondary_color }}
              >
                Texto secundário
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
