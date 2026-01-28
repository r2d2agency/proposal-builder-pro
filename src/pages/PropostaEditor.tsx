import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Download, Eye, Plus, Minus, FileText } from 'lucide-react';
import { Product, Proposal, ProposalProduct } from '@/types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const PropostaEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchWithAuth } = useApi();
  const { toast } = useToast();
  const previewRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<ProposalProduct[]>([]);
  
  const [proposal, setProposal] = useState({
    title: '',
    client_name: '',
    client_email: '',
    client_phone: '',
    cover_title: 'Proposta Comercial',
    cover_subtitle: '',
    footer_text: 'Obrigado pela preferência!',
    company_logo_url: '',
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [proposalRes, productsRes] = await Promise.all([
        fetchWithAuth(`/api/proposals/${id}`),
        fetchWithAuth('/api/products'),
      ]);

      if (proposalRes.ok) {
        const data = await proposalRes.json();
        setProposal({
          title: data.title,
          client_name: data.client_name,
          client_email: data.client_email || '',
          client_phone: data.client_phone || '',
          cover_title: data.cover_title || 'Proposta Comercial',
          cover_subtitle: data.cover_subtitle || '',
          footer_text: data.footer_text || 'Obrigado pela preferência!',
          company_logo_url: data.company_logo_url || '',
        });
        setSelectedProducts(data.products || []);
      }

      if (productsRes.ok) {
        const data = await productsRes.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetchWithAuth(`/api/proposals/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...proposal,
          products: selectedProducts,
        }),
      });

      if (response.ok) {
        toast({ title: 'Proposta salva com sucesso!' });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a proposta.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleProduct = (product: Product) => {
    const exists = selectedProducts.find((p) => p.product_id === product.id);
    if (exists) {
      setSelectedProducts(selectedProducts.filter((p) => p.product_id !== product.id));
    } else {
      setSelectedProducts([
        ...selectedProducts,
        { product_id: product.id, product, quantity: 1 },
      ]);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    setSelectedProducts(
      selectedProducts.map((p) =>
        p.product_id === productId
          ? { ...p, quantity: Math.max(1, p.quantity + delta) }
          : p
      )
    );
  };

  const generatePDF = async () => {
    if (!previewRef.current) return;

    toast({ title: 'Gerando PDF...' });

    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`proposta-${proposal.client_name.replace(/\s+/g, '-')}.pdf`);

      toast({ title: 'PDF gerado com sucesso!' });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar o PDF.',
        variant: 'destructive',
      });
    }
  };

  const totalValue = selectedProducts.reduce(
    (acc, p) => acc + (p.custom_price || p.product.price) * p.quantity,
    0
  );

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/propostas')}
              className="text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">{proposal.title}</h1>
              <p className="text-slate-400">Cliente: {proposal.client_name}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={generatePDF}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <Download className="mr-2 h-4 w-4" />
              Gerar PDF
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-amber-500 hover:bg-amber-600"
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Editor */}
          <div className="space-y-6">
            <Tabs defaultValue="capa" className="w-full">
              <TabsList className="bg-slate-800 border border-slate-700">
                <TabsTrigger value="capa">Capa</TabsTrigger>
                <TabsTrigger value="produtos">Produtos</TabsTrigger>
                <TabsTrigger value="rodape">Rodapé</TabsTrigger>
              </TabsList>

              <TabsContent value="capa" className="mt-4">
                <Card className="border-slate-700 bg-slate-800/50">
                  <CardHeader>
                    <CardTitle className="text-white">Configuração da Capa</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Título Principal</Label>
                      <Input
                        value={proposal.cover_title}
                        onChange={(e) => setProposal({ ...proposal, cover_title: e.target.value })}
                        className="border-slate-600 bg-slate-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Subtítulo</Label>
                      <Input
                        value={proposal.cover_subtitle}
                        onChange={(e) => setProposal({ ...proposal, cover_subtitle: e.target.value })}
                        className="border-slate-600 bg-slate-700 text-white"
                        placeholder="Ex: Soluções personalizadas para você"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">URL do Logo</Label>
                      <Input
                        value={proposal.company_logo_url}
                        onChange={(e) => setProposal({ ...proposal, company_logo_url: e.target.value })}
                        className="border-slate-600 bg-slate-700 text-white"
                        placeholder="https://..."
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="produtos" className="mt-4">
                <Card className="border-slate-700 bg-slate-800/50">
                  <CardHeader>
                    <CardTitle className="text-white">Selecionar Produtos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      <div className="space-y-2">
                        {products.map((product) => {
                          const selected = selectedProducts.find(
                            (p) => p.product_id === product.id
                          );
                          return (
                            <div
                              key={product.id}
                              className="flex items-center gap-4 rounded-lg border border-slate-700 p-3 hover:bg-slate-700/50"
                            >
                              <Checkbox
                                checked={!!selected}
                                onCheckedChange={() => toggleProduct(product)}
                              />
                              {product.image_url && (
                                <img
                                  src={product.image_url}
                                  alt={product.name}
                                  className="h-12 w-12 rounded object-cover"
                                />
                              )}
                              <div className="flex-1">
                                <p className="font-medium text-white">{product.name}</p>
                                <p className="text-sm text-slate-400">{product.code}</p>
                              </div>
                              <p className="font-medium text-amber-500">
                                R$ {product.price.toFixed(2)}
                              </p>
                              {selected && (
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => updateQuantity(product.id, -1)}
                                    className="h-8 w-8 text-slate-400"
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <span className="w-8 text-center text-white">
                                    {selected.quantity}
                                  </span>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => updateQuantity(product.id, 1)}
                                    className="h-8 w-8 text-slate-400"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="rodape" className="mt-4">
                <Card className="border-slate-700 bg-slate-800/50">
                  <CardHeader>
                    <CardTitle className="text-white">Configuração do Rodapé</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Texto do Rodapé</Label>
                      <Textarea
                        value={proposal.footer_text}
                        onChange={(e) => setProposal({ ...proposal, footer_text: e.target.value })}
                        className="border-slate-600 bg-slate-700 text-white"
                        rows={4}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Preview */}
          <div>
            <Card className="border-slate-700 bg-slate-800/50">
              <CardHeader className="flex flex-row items-center gap-2">
                <Eye className="h-5 w-5 text-slate-400" />
                <CardTitle className="text-white">Pré-visualização</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  ref={previewRef}
                  className="aspect-[210/297] w-full overflow-hidden rounded-lg bg-white text-slate-900"
                >
                  {/* Cover */}
                  <div className="flex h-1/3 flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 p-6 text-white">
                    {proposal.company_logo_url && (
                      <img
                        src={proposal.company_logo_url}
                        alt="Logo"
                        className="mb-4 h-16 object-contain"
                      />
                    )}
                    <h1 className="text-2xl font-bold">{proposal.cover_title}</h1>
                    {proposal.cover_subtitle && (
                      <p className="mt-2 text-sm text-slate-300">{proposal.cover_subtitle}</p>
                    )}
                    <div className="mt-4 text-sm">
                      <p>Cliente: {proposal.client_name}</p>
                    </div>
                  </div>

                  {/* Products */}
                  <div className="p-4">
                    <h2 className="mb-3 text-lg font-semibold border-b border-slate-200 pb-2">
                      Produtos Selecionados
                    </h2>
                    <div className="space-y-2">
                      {selectedProducts.length === 0 ? (
                        <p className="text-sm text-slate-400">Nenhum produto selecionado</p>
                      ) : (
                        selectedProducts.map((item) => (
                          <div
                            key={item.product_id}
                            className="flex items-center justify-between border-b border-slate-100 pb-2 text-xs"
                          >
                            <div className="flex items-center gap-2">
                              {item.product.image_url && (
                                <img
                                  src={item.product.image_url}
                                  alt=""
                                  className="h-8 w-8 rounded object-cover"
                                />
                              )}
                              <div>
                                <p className="font-medium">{item.product.name}</p>
                                <p className="text-slate-500">Qtd: {item.quantity}</p>
                              </div>
                            </div>
                            <p className="font-medium">
                              R$ {((item.custom_price || item.product.price) * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                    {selectedProducts.length > 0 && (
                      <div className="mt-4 flex justify-between border-t border-slate-200 pt-2 font-bold">
                        <span>Total:</span>
                        <span className="text-amber-600">R$ {totalValue.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="absolute bottom-0 left-0 right-0 bg-slate-800 p-4 text-center text-xs text-white">
                    {proposal.footer_text}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PropostaEditor;
