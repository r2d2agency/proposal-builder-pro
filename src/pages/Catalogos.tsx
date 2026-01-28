import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/hooks/use-toast';
import { Plus, FileText, Download, Trash2, Eye, Send } from 'lucide-react';
import { Catalog, CatalogTemplate } from '@/types/catalog';
import { Product } from '@/types';
import CatalogPDFGenerator from '@/components/catalog/CatalogPDFGenerator';

const Catalogos = () => {
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [templates, setTemplates] = useState<CatalogTemplate[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPDFOpen, setIsPDFOpen] = useState(false);
  const [selectedCatalog, setSelectedCatalog] = useState<Catalog | null>(null);

  // Form states
  const [catalogName, setCatalogName] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  const { fetchWithAuth, API_URL } = useApi();
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [catalogsRes, templatesRes, productsRes] = await Promise.all([
        fetchWithAuth('/api/catalogs'),
        fetchWithAuth('/api/templates'),
        fetchWithAuth('/api/products'),
      ]);

      if (catalogsRes.ok) setCatalogs(await catalogsRes.json());
      if (templatesRes.ok) setTemplates(await templatesRes.json());
      if (productsRes.ok) setProducts(await productsRes.json());
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!catalogName.trim() || selectedProductIds.length === 0) {
      toast({ title: 'Preencha o nome e selecione produtos', variant: 'destructive' });
      return;
    }

    try {
      const response = await fetchWithAuth('/api/catalogs', {
        method: 'POST',
        body: JSON.stringify({
          name: catalogName,
          template_id: selectedTemplateId || null,
          client_name: clientName,
          client_email: clientEmail,
          product_ids: selectedProductIds,
        }),
      });

      if (response.ok) {
        toast({ title: 'Catálogo criado com sucesso!' });
        setIsCreateOpen(false);
        resetForm();
        loadData();
      }
    } catch (error) {
      toast({ title: 'Erro ao criar catálogo', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este catálogo?')) return;

    try {
      const response = await fetchWithAuth(`/api/catalogs/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({ title: 'Catálogo excluído!' });
        loadData();
      }
    } catch (error) {
      toast({ title: 'Erro ao excluir catálogo', variant: 'destructive' });
    }
  };

  const handleGeneratePDF = async (catalog: Catalog) => {
    // Buscar catálogo completo com produtos
    try {
      const response = await fetchWithAuth(`/api/catalogs/${catalog.id}`);
      if (response.ok) {
        const fullCatalog = await response.json();
        setSelectedCatalog(fullCatalog);
        setIsPDFOpen(true);
      }
    } catch (error) {
      toast({ title: 'Erro ao carregar catálogo', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setCatalogName('');
    setClientName('');
    setClientEmail('');
    setSelectedTemplateId('');
    setSelectedProductIds([]);
  };

  const toggleProduct = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-slate-500',
      generated: 'bg-amber-500',
      sent: 'bg-green-500',
    };
    const labels: Record<string, string> = {
      draft: 'Rascunho',
      generated: 'Gerado',
      sent: 'Enviado',
    };
    return <Badge className={styles[status] || styles.draft}>{labels[status] || status}</Badge>;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Catálogos</h1>
            <p className="text-slate-400">Crie catálogos personalizados para enviar aos clientes</p>
          </div>

          <Button onClick={() => setIsCreateOpen(true)} className="bg-amber-500 hover:bg-amber-600">
            <Plus className="mr-2 h-4 w-4" />
            Novo Catálogo
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse border-slate-700 bg-slate-800/50">
                <CardHeader>
                  <div className="h-6 w-32 rounded bg-slate-700" />
                </CardHeader>
                <CardContent>
                  <div className="h-20 rounded bg-slate-700" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : catalogs.length === 0 ? (
          <Card className="border-slate-700 bg-slate-800/50">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="mb-4 h-12 w-12 text-slate-500" />
              <h3 className="mb-2 text-lg font-medium text-white">Nenhum catálogo criado</h3>
              <p className="mb-4 text-slate-400">Crie seu primeiro catálogo para enviar aos clientes</p>
              <Button onClick={() => setIsCreateOpen(true)} className="bg-amber-500 hover:bg-amber-600">
                <Plus className="mr-2 h-4 w-4" />
                Criar Catálogo
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {catalogs.map((catalog) => (
              <Card key={catalog.id} className="border-slate-700 bg-slate-800/50">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-white">{catalog.name}</CardTitle>
                    {getStatusBadge(catalog.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {catalog.client_name && (
                    <p className="text-sm text-slate-400">
                      Cliente: <span className="text-white">{catalog.client_name}</span>
                    </p>
                  )}
                  <p className="text-sm text-slate-400">
                    Produtos: <span className="text-white">{catalog.product_ids?.length || 0}</span>
                  </p>
                  <p className="text-sm text-slate-400">
                    Criado em: {new Date(catalog.created_at).toLocaleDateString('pt-BR')}
                  </p>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleGeneratePDF(catalog)}
                      className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <Download className="mr-1 h-4 w-4" />
                      PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(catalog.id)}
                      className="border-red-600/50 text-red-400 hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dialog Criar Catálogo */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto border-slate-700 bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-white">Novo Catálogo</DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Nome do Catálogo</Label>
                <Input
                  value={catalogName}
                  onChange={(e) => setCatalogName(e.target.value)}
                  className="border-slate-600 bg-slate-700 text-white"
                  placeholder="Ex: Catálogo Industrial 2024"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Template</Label>
                <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                  <SelectTrigger className="border-slate-600 bg-slate-700 text-white">
                    <SelectValue placeholder="Selecione um template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name} {t.is_default && '(Padrão)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Nome do Cliente</Label>
                <Input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="border-slate-600 bg-slate-700 text-white"
                  placeholder="Nome do cliente"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Email do Cliente</Label>
                <Input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="border-slate-600 bg-slate-700 text-white"
                  placeholder="email@cliente.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">
                Selecionar Produtos ({selectedProductIds.length} selecionados)
              </Label>
              <div className="max-h-80 space-y-2 overflow-y-auto rounded-lg border border-slate-600 p-3">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-2 transition-all ${
                      selectedProductIds.includes(product.id)
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-slate-600 hover:border-slate-500'
                    }`}
                    onClick={() => toggleProduct(product.id)}
                  >
                    <Checkbox
                      checked={selectedProductIds.includes(product.id)}
                      onCheckedChange={() => toggleProduct(product.id)}
                    />
                    {product.image_url && (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-10 w-10 rounded object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{product.name}</p>
                      <p className="text-xs text-slate-400">{product.code}</p>
                    </div>
                    <p className="text-sm font-medium text-amber-500">
                      R$ {product.price?.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateOpen(false);
                resetForm();
              }}
              className="border-slate-600"
            >
              Cancelar
            </Button>
            <Button onClick={handleCreate} className="bg-amber-500 hover:bg-amber-600">
              Criar Catálogo
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog PDF */}
      <Dialog open={isPDFOpen} onOpenChange={setIsPDFOpen}>
        <DialogContent className="max-h-[95vh] max-w-5xl overflow-y-auto border-slate-700 bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-white">Gerar PDF - {selectedCatalog?.name}</DialogTitle>
          </DialogHeader>
          {selectedCatalog && (
            <CatalogPDFGenerator
              catalog={selectedCatalog}
              onClose={() => setIsPDFOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Catalogos;
