import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/hooks/use-toast';
import { Save, Building2 } from 'lucide-react';

interface CompanySettings {
  name: string;
  logo_url: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  cnpj: string;
  default_footer: string;
}

const Configuracoes = () => {
  const [settings, setSettings] = useState<CompanySettings>({
    name: '',
    logo_url: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    cnpj: '',
    default_footer: 'Obrigado pela preferência!',
  });
  const [isSaving, setIsSaving] = useState(false);
  const { fetchWithAuth } = useApi();
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetchWithAuth('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetchWithAuth('/api/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast({ title: 'Configurações salvas com sucesso!' });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as configurações.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Configurações</h1>
            <p className="text-slate-400">Configure os dados da empresa</p>
          </div>
          
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-amber-500 hover:bg-amber-600"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-slate-700 bg-slate-800/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-amber-500" />
                <CardTitle className="text-white">Dados da Empresa</CardTitle>
              </div>
              <CardDescription className="text-slate-400">
                Informações que aparecerão nas propostas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Nome da Empresa</Label>
                <Input
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  className="border-slate-600 bg-slate-700 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-slate-300">CNPJ</Label>
                <Input
                  value={settings.cnpj}
                  onChange={(e) => setSettings({ ...settings, cnpj: e.target.value })}
                  className="border-slate-600 bg-slate-700 text-white"
                  placeholder="00.000.000/0000-00"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-slate-300">URL do Logo</Label>
                <Input
                  value={settings.logo_url}
                  onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                  className="border-slate-600 bg-slate-700 text-white"
                  placeholder="https://..."
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-slate-300">Endereço</Label>
                <Textarea
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="border-slate-600 bg-slate-700 text-white"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-800/50">
            <CardHeader>
              <CardTitle className="text-white">Contato</CardTitle>
              <CardDescription className="text-slate-400">
                Informações de contato da empresa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Telefone</Label>
                <Input
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="border-slate-600 bg-slate-700 text-white"
                  placeholder="(00) 00000-0000"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-slate-300">Email</Label>
                <Input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="border-slate-600 bg-slate-700 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-slate-300">Website</Label>
                <Input
                  value={settings.website}
                  onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                  className="border-slate-600 bg-slate-700 text-white"
                  placeholder="https://..."
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-slate-300">Rodapé Padrão</Label>
                <Textarea
                  value={settings.default_footer}
                  onChange={(e) => setSettings({ ...settings, default_footer: e.target.value })}
                  className="border-slate-600 bg-slate-700 text-white"
                  rows={3}
                  placeholder="Texto que aparecerá no rodapé das propostas"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Configuracoes;
