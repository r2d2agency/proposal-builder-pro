import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CatalogTemplate, CoverLayout, ProductsLayout, FooterLayout } from '@/types/catalog';
import { Save, X, Palette, Layout, FileText, Image, Upload, Loader2 } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/hooks/use-toast';
import TemplatePreview from './TemplatePreview';

interface TemplateEditorProps {
  template: CatalogTemplate | null;
  onSave: (data: Partial<CatalogTemplate>) => void;
  onCancel: () => void;
}

const defaultCoverLayout: CoverLayout = {
  logoPosition: 'center',
  titlePosition: 'center',
  showSubtitle: true,
};

const defaultProductsLayout: ProductsLayout = {
  columns: 2,
  showPrice: true,
  showDescription: true,
  showSpecs: true,
  imageSize: 'medium',
};

const defaultFooterLayout: FooterLayout = {
  showContact: true,
  showAddress: true,
  customText: '',
};

const TemplateEditor = ({ template, onSave, onCancel }: TemplateEditorProps) => {
  const [name, setName] = useState(template?.name || '');
  const [description, setDescription] = useState(template?.description || '');
  const [logoUrl, setLogoUrl] = useState(template?.logo_url || '');
  const [primaryColor, setPrimaryColor] = useState(template?.primary_color || '#f59e0b');
  const [secondaryColor, setSecondaryColor] = useState(template?.secondary_color || '#1e293b');
  const [accentColor, setAccentColor] = useState(template?.accent_color || '#3b82f6');
  const [fontFamily, setFontFamily] = useState(template?.font_family || 'Inter');
  const [coverLayout, setCoverLayout] = useState<CoverLayout>(
    template?.cover_layout || defaultCoverLayout
  );
  const [productsLayout, setProductsLayout] = useState<ProductsLayout>(
    template?.products_layout || defaultProductsLayout
  );
  const [footerLayout, setFooterLayout] = useState<FooterLayout>(
    template?.footer_layout || defaultFooterLayout
  );
  const [isDefault, setIsDefault] = useState(template?.is_default || false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile } = useApi();
  const { toast } = useToast();

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({ title: 'Formato inválido', description: 'Use PNG, JPG, SVG ou WebP', variant: 'destructive' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Arquivo muito grande', description: 'Máximo 5MB', variant: 'destructive' });
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadFile(file);
      setLogoUrl(result.url);
      toast({ title: 'Logo enviado com sucesso!' });
    } catch (error) {
      toast({ title: 'Erro ao enviar logo', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = () => {
    onSave({
      name,
      description,
      logo_url: logoUrl,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      accent_color: accentColor,
      font_family: fontFamily,
      cover_layout: coverLayout,
      products_layout: productsLayout,
      footer_layout: footerLayout,
      is_default: isDefault,
    });
  };

  const fonts = ['Inter', 'Roboto', 'Open Sans', 'Montserrat', 'Lato', 'Poppins', 'Oswald', 'Raleway'];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Editor */}
      <div className="space-y-4">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800">
            <TabsTrigger value="general" className="data-[state=active]:bg-amber-500">
              <FileText className="mr-1 h-4 w-4" />
              Geral
            </TabsTrigger>
            <TabsTrigger value="colors" className="data-[state=active]:bg-amber-500">
              <Palette className="mr-1 h-4 w-4" />
              Cores
            </TabsTrigger>
            <TabsTrigger value="cover" className="data-[state=active]:bg-amber-500">
              <Image className="mr-1 h-4 w-4" />
              Capa
            </TabsTrigger>
            <TabsTrigger value="products" className="data-[state=active]:bg-amber-500">
              <Layout className="mr-1 h-4 w-4" />
              Produtos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Nome do Template</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-slate-600 bg-slate-700 text-white"
                placeholder="Ex: Catálogo Industrial"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Descrição</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="border-slate-600 bg-slate-700 text-white"
                rows={2}
                placeholder="Descrição breve do template"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Logo do Template</Label>
              <div className="space-y-3">
                {logoUrl && (
                  <div className="flex items-center gap-3 rounded-lg border border-slate-600 bg-slate-700 p-3">
                    <img src={logoUrl} alt="Logo" className="h-12 w-auto max-w-[120px] object-contain" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setLogoUrl('')}
                      className="ml-auto text-red-400 hover:text-red-300"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    {isUploading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}
                    {isUploading ? 'Enviando...' : 'Enviar Logo'}
                  </Button>
                </div>
                <Input
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="border-slate-600 bg-slate-700 text-white"
                  placeholder="Ou cole uma URL..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Fonte</Label>
              <Select value={fontFamily} onValueChange={setFontFamily}>
                <SelectTrigger className="border-slate-600 bg-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fonts.map((font) => (
                    <SelectItem key={font} value={font}>
                      {font}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-slate-300">Template Padrão</Label>
              <Switch checked={isDefault} onCheckedChange={setIsDefault} />
            </div>
          </TabsContent>

          <TabsContent value="colors" className="mt-4 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Cor Primária</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-10 w-14 cursor-pointer rounded border-0"
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="border-slate-600 bg-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Cor Secundária</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="h-10 w-14 cursor-pointer rounded border-0"
                  />
                  <Input
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="border-slate-600 bg-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Cor de Destaque</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="h-10 w-14 cursor-pointer rounded border-0"
                  />
                  <Input
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="border-slate-600 bg-slate-700 text-white"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-slate-600 p-4">
              <p className="mb-2 text-sm text-slate-400">Preview das cores:</p>
              <div className="flex gap-4">
                <div className="flex-1 rounded p-4 text-center text-white" style={{ backgroundColor: primaryColor }}>
                  Primária
                </div>
                <div className="flex-1 rounded p-4 text-center text-white" style={{ backgroundColor: secondaryColor }}>
                  Secundária
                </div>
                <div className="flex-1 rounded p-4 text-center text-white" style={{ backgroundColor: accentColor }}>
                  Destaque
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="cover" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Posição do Logo</Label>
              <Select
                value={coverLayout.logoPosition}
                onValueChange={(v) => setCoverLayout({ ...coverLayout, logoPosition: v as CoverLayout['logoPosition'] })}
              >
                <SelectTrigger className="border-slate-600 bg-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Esquerda</SelectItem>
                  <SelectItem value="center">Centro</SelectItem>
                  <SelectItem value="right">Direita</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Posição do Título</Label>
              <Select
                value={coverLayout.titlePosition}
                onValueChange={(v) => setCoverLayout({ ...coverLayout, titlePosition: v as CoverLayout['titlePosition'] })}
              >
                <SelectTrigger className="border-slate-600 bg-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Esquerda</SelectItem>
                  <SelectItem value="center">Centro</SelectItem>
                  <SelectItem value="right">Direita</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-slate-300">Mostrar Subtítulo</Label>
              <Switch
                checked={coverLayout.showSubtitle}
                onCheckedChange={(v) => setCoverLayout({ ...coverLayout, showSubtitle: v })}
              />
            </div>
          </TabsContent>

          <TabsContent value="products" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Colunas por Página</Label>
              <Select
                value={String(productsLayout.columns)}
                onValueChange={(v) => setProductsLayout({ ...productsLayout, columns: parseInt(v) as 1 | 2 | 3 })}
              >
                <SelectTrigger className="border-slate-600 bg-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Coluna</SelectItem>
                  <SelectItem value="2">2 Colunas</SelectItem>
                  <SelectItem value="3">3 Colunas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Tamanho da Imagem</Label>
              <Select
                value={productsLayout.imageSize}
                onValueChange={(v) => setProductsLayout({ ...productsLayout, imageSize: v as ProductsLayout['imageSize'] })}
              >
                <SelectTrigger className="border-slate-600 bg-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Pequena</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="large">Grande</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-slate-300">Mostrar Preço</Label>
                <Switch
                  checked={productsLayout.showPrice}
                  onCheckedChange={(v) => setProductsLayout({ ...productsLayout, showPrice: v })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-slate-300">Mostrar Descrição</Label>
                <Switch
                  checked={productsLayout.showDescription}
                  onCheckedChange={(v) => setProductsLayout({ ...productsLayout, showDescription: v })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-slate-300">Mostrar Especificações</Label>
                <Switch
                  checked={productsLayout.showSpecs}
                  onCheckedChange={(v) => setProductsLayout({ ...productsLayout, showSpecs: v })}
                />
              </div>
            </div>

            <div className="mt-4 border-t border-slate-700 pt-4">
              <h4 className="mb-3 text-sm font-medium text-white">Rodapé</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-slate-300">Mostrar Contato</Label>
                  <Switch
                    checked={footerLayout.showContact}
                    onCheckedChange={(v) => setFooterLayout({ ...footerLayout, showContact: v })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-slate-300">Mostrar Endereço</Label>
                  <Switch
                    checked={footerLayout.showAddress}
                    onCheckedChange={(v) => setFooterLayout({ ...footerLayout, showAddress: v })}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Texto Personalizado</Label>
                  <Textarea
                    value={footerLayout.customText}
                    onChange={(e) => setFooterLayout({ ...footerLayout, customText: e.target.value })}
                    className="border-slate-600 bg-slate-700 text-white"
                    rows={2}
                    placeholder="Texto adicional para o rodapé..."
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onCancel} className="border-slate-600">
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-amber-500 hover:bg-amber-600" disabled={!name.trim()}>
            <Save className="mr-2 h-4 w-4" />
            Salvar
          </Button>
        </div>
      </div>

      {/* Preview */}
      <div className="rounded-lg border border-slate-700 bg-slate-950 p-4">
        <h3 className="mb-4 text-sm font-medium text-slate-400">Preview do Catálogo</h3>
        <TemplatePreview
          template={{
            name,
            logo_url: logoUrl,
            primary_color: primaryColor,
            secondary_color: secondaryColor,
            accent_color: accentColor,
            font_family: fontFamily,
            cover_layout: coverLayout,
            products_layout: productsLayout,
            footer_layout: footerLayout,
          }}
        />
      </div>
    </div>
  );
};

export default TemplateEditor;
