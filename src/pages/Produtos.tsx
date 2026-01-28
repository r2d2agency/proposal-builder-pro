import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Package, LayoutGrid, List } from 'lucide-react';
import { Product, Category, ProductLine } from '@/types';
import { ProductForm, ProductFormData } from '@/components/products/ProductForm';
import { ProductTable } from '@/components/products/ProductTable';
import { ProductGrid } from '@/components/products/ProductGrid';
import { products as mockProducts, categories as mockCategories, productLines as mockLines } from '@/data/mockData';

const emptyForm: ProductFormData = {
  code: '',
  name: '',
  description: '',
  category: '',
  line: '',
  price: '',
  image_url: '',
  power_watts: '',
  luminous_flux: '',
  color_temperature: '5000K',
  beam_angle: '60°',
  dimensions: '',
  ip_rating: 'IP66',
  warranty_years: '5',
  voltage: '220V',
  life_expectancy: '102.000h',
  irc: 'IRC>80',
  energy_class: 'Classe A',
};

type ViewMode = 'grid' | 'table';

const Produtos = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [lines, setLines] = useState<ProductLine[]>([]);
  const [search, setSearch] = useState('');
  const [selectedLine, setSelectedLine] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormData>(emptyForm);
  const { toast } = useToast();

  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    setProducts(mockProducts);
    setCategories(mockCategories);
    setLines(mockLines);
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newProduct: Product = {
      id: editingProduct?.id || Date.now().toString(),
      code: form.code,
      name: form.name,
      description: form.description,
      category: form.category,
      line: form.line,
      price: parseFloat(form.price),
      image_url: form.image_url,
      power_watts: parseInt(form.power_watts) || 0,
      luminous_flux: form.luminous_flux,
      color_temperature: form.color_temperature,
      beam_angle: form.beam_angle,
      dimensions: form.dimensions,
      ip_rating: form.ip_rating,
      warranty_years: parseInt(form.warranty_years) || 0,
      voltage: form.voltage,
      life_expectancy: form.life_expectancy,
      irc: form.irc,
      energy_class: form.energy_class,
      created_at: editingProduct?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (editingProduct) {
      setProducts(products.map((p) => (p.id === editingProduct.id ? newProduct : p)));
      toast({ title: 'Produto atualizado!', description: 'Operação realizada com sucesso.' });
    } else {
      setProducts([...products, newProduct]);
      toast({ title: 'Produto cadastrado!', description: 'Operação realizada com sucesso.' });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      code: product.code,
      name: product.name,
      description: product.description,
      category: product.category,
      line: product.line,
      price: product.price.toString(),
      image_url: product.image_url,
      power_watts: product.power_watts.toString(),
      luminous_flux: product.luminous_flux,
      color_temperature: product.color_temperature,
      beam_angle: product.beam_angle,
      dimensions: product.dimensions,
      ip_rating: product.ip_rating,
      warranty_years: product.warranty_years.toString(),
      voltage: product.voltage,
      life_expectancy: product.life_expectancy,
      irc: product.irc,
      energy_class: product.energy_class,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    setProducts(products.filter((p) => p.id !== id));
    toast({ title: 'Produto excluído!' });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingProduct(null);
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.code.toLowerCase().includes(search.toLowerCase());
    const matchesLine = selectedLine === 'all' || product.line === selectedLine;
    return matchesSearch && matchesLine;
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Produtos</h1>
            <p className="text-slate-400">
              Catálogo com {products.length} produtos cadastrados
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-gradient-to-r from-amber-500 to-amber-600 text-white"
                onClick={resetForm}
              >
                <Plus className="mr-2 h-4 w-4" />
                Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="border-slate-700 bg-slate-800 text-white sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                </DialogTitle>
              </DialogHeader>
              <ProductForm
                form={form}
                onChange={setForm}
                onSubmit={handleSubmit}
                onCancel={() => setIsDialogOpen(false)}
                categories={categories}
                lines={lines}
                isEditing={!!editingProduct}
              />
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input
                  placeholder="Buscar por nome ou código..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="border-slate-600 bg-slate-700 pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Select value={selectedLine} onValueChange={setSelectedLine}>
                  <SelectTrigger className="w-40 border-slate-600 bg-slate-700">
                    <SelectValue placeholder="Linha" />
                  </SelectTrigger>
                  <SelectContent className="border-slate-600 bg-slate-700">
                    <SelectItem value="all">Todas as Linhas</SelectItem>
                    {lines.map((line) => (
                      <SelectItem key={line.id} value={line.name}>
                        {line.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <ToggleGroup 
                  type="single" 
                  value={viewMode} 
                  onValueChange={(value) => value && setViewMode(value as ViewMode)}
                  className="border border-slate-600 rounded-md"
                >
                  <ToggleGroupItem 
                    value="grid" 
                    aria-label="Visualização em grid"
                    className="data-[state=on]:bg-amber-500 data-[state=on]:text-white"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem 
                    value="table" 
                    aria-label="Visualização em tabela"
                    className="data-[state=on]:bg-amber-500 data-[state=on]:text-white"
                  >
                    <List className="h-4 w-4" />
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Package className="mb-4 h-12 w-12" />
                <p>Nenhum produto encontrado</p>
              </div>
            ) : viewMode === 'grid' ? (
              <ProductGrid
                products={filteredProducts}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ) : (
              <ProductTable
                products={filteredProducts}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Produtos;
