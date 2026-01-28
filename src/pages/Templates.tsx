import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/hooks/use-toast';
import { Plus, Palette, Edit, Trash2, Star, Copy } from 'lucide-react';
import { CatalogTemplate } from '@/types/catalog';
import TemplateEditor from '@/components/templates/TemplateEditor';

const Templates = () => {
  const [templates, setTemplates] = useState<CatalogTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<CatalogTemplate | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const { fetchWithAuth } = useApi();
  const { toast } = useToast();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await fetchWithAuth('/api/templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    setSelectedTemplate(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (template: CatalogTemplate) => {
    setSelectedTemplate(template);
    setIsEditorOpen(true);
  };

  const handleDuplicate = async (template: CatalogTemplate) => {
    try {
      const { id, created_at, updated_at, ...templateData } = template;
      const response = await fetchWithAuth('/api/templates', {
        method: 'POST',
        body: JSON.stringify({
          ...templateData,
          name: `${template.name} (Cópia)`,
          is_default: false,
        }),
      });

      if (response.ok) {
        toast({ title: 'Template duplicado com sucesso!' });
        loadTemplates();
      }
    } catch (error) {
      toast({ title: 'Erro ao duplicar template', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este template?')) return;

    try {
      const response = await fetchWithAuth(`/api/templates/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({ title: 'Template excluído!' });
        loadTemplates();
      }
    } catch (error) {
      toast({ title: 'Erro ao excluir template', variant: 'destructive' });
    }
  };

  const handleSetDefault = async (template: CatalogTemplate) => {
    try {
      const response = await fetchWithAuth(`/api/templates/${template.id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...template, is_default: true }),
      });

      if (response.ok) {
        toast({ title: 'Template definido como padrão!' });
        loadTemplates();
      }
    } catch (error) {
      toast({ title: 'Erro ao definir template padrão', variant: 'destructive' });
    }
  };

  const handleSaveTemplate = async (templateData: Partial<CatalogTemplate>) => {
    try {
      const method = selectedTemplate ? 'PUT' : 'POST';
      const url = selectedTemplate ? `/api/templates/${selectedTemplate.id}` : '/api/templates';

      const response = await fetchWithAuth(url, {
        method,
        body: JSON.stringify(templateData),
      });

      if (response.ok) {
        toast({ title: selectedTemplate ? 'Template atualizado!' : 'Template criado!' });
        setIsEditorOpen(false);
        loadTemplates();
      }
    } catch (error) {
      toast({ title: 'Erro ao salvar template', variant: 'destructive' });
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Templates de Catálogo</h1>
            <p className="text-slate-400">Crie e gerencie templates para seus catálogos em PDF</p>
          </div>

          <Button onClick={handleCreateNew} className="bg-amber-500 hover:bg-amber-600">
            <Plus className="mr-2 h-4 w-4" />
            Novo Template
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
                  <div className="h-32 rounded bg-slate-700" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : templates.length === 0 ? (
          <Card className="border-slate-700 bg-slate-800/50">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Palette className="mb-4 h-12 w-12 text-slate-500" />
              <h3 className="mb-2 text-lg font-medium text-white">Nenhum template criado</h3>
              <p className="mb-4 text-slate-400">Crie seu primeiro template para começar a gerar catálogos</p>
              <Button onClick={handleCreateNew} className="bg-amber-500 hover:bg-amber-600">
                <Plus className="mr-2 h-4 w-4" />
                Criar Template
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <Card key={template.id} className="group border-slate-700 bg-slate-800/50 transition-all hover:border-amber-500/50">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-white">
                        {template.name}
                        {template.is_default && (
                          <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                        )}
                      </CardTitle>
                      <CardDescription className="text-slate-400">
                        {template.description || 'Sem descrição'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Preview de cores */}
                  <div className="flex items-center gap-2">
                    <div
                      className="h-8 w-8 rounded-full border-2 border-slate-600"
                      style={{ backgroundColor: template.primary_color }}
                      title="Cor primária"
                    />
                    <div
                      className="h-8 w-8 rounded-full border-2 border-slate-600"
                      style={{ backgroundColor: template.secondary_color }}
                      title="Cor secundária"
                    />
                    <div
                      className="h-8 w-8 rounded-full border-2 border-slate-600"
                      style={{ backgroundColor: template.accent_color }}
                      title="Cor de destaque"
                    />
                    <span className="ml-2 text-sm text-slate-400">{template.font_family}</span>
                  </div>

                  {/* Preview do layout */}
                  <div className="rounded-lg border border-slate-600 bg-slate-900 p-3">
                    <div className="mb-2 flex h-12 items-center justify-center rounded bg-slate-800" style={{ borderLeft: `3px solid ${template.primary_color}` }}>
                      <span className="text-xs text-slate-500">Capa</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-8 rounded bg-slate-800" />
                      ))}
                    </div>
                    <div className="mt-2 h-6 rounded bg-slate-800" style={{ borderBottom: `2px solid ${template.primary_color}` }} />
                  </div>

                  {/* Ações */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(template)}
                      className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <Edit className="mr-1 h-4 w-4" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDuplicate(template)}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    {!template.is_default && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(template)}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(template.id)}
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

      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-h-[90vh] max-w-6xl overflow-y-auto border-slate-700 bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-white">
              {selectedTemplate ? 'Editar Template' : 'Novo Template'}
            </DialogTitle>
          </DialogHeader>
          <TemplateEditor
            template={selectedTemplate}
            onSave={handleSaveTemplate}
            onCancel={() => setIsEditorOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Templates;
