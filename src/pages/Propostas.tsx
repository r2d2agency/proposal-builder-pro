import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/hooks/use-toast';
import { Plus, Eye, Download, Trash2, FileText, Search } from 'lucide-react';
import { Proposal } from '@/types';

const statusColors = {
  draft: 'bg-slate-500',
  sent: 'bg-blue-500',
  approved: 'bg-green-500',
  rejected: 'bg-red-500',
};

const statusLabels = {
  draft: 'Rascunho',
  sent: 'Enviada',
  approved: 'Aprovada',
  rejected: 'Rejeitada',
};

const Propostas = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { fetchWithAuth } = useApi();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    client_name: '',
    client_email: '',
    client_phone: '',
  });

  useEffect(() => {
    loadProposals();
  }, []);

  const loadProposals = async () => {
    try {
      const response = await fetchWithAuth('/api/proposals');
      if (response.ok) {
        const data = await response.json();
        setProposals(data);
      }
    } catch (error) {
      console.error('Erro ao carregar propostas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetchWithAuth('/api/proposals', {
        method: 'POST',
        body: JSON.stringify(form),
      });

      if (response.ok) {
        const newProposal = await response.json();
        toast({ title: 'Proposta criada!' });
        setIsDialogOpen(false);
        navigate(`/propostas/${newProposal.id}/editar`);
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível criar a proposta.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta proposta?')) return;

    try {
      const response = await fetchWithAuth(`/api/proposals/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({ title: 'Proposta excluída!' });
        loadProposals();
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a proposta.',
        variant: 'destructive',
      });
    }
  };

  const filteredProposals = proposals.filter((proposal) =>
    proposal.title.toLowerCase().includes(search.toLowerCase()) ||
    proposal.client_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Propostas</h1>
            <p className="text-slate-400">Crie e gerencie suas propostas comerciais</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-amber-500 to-amber-600 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Nova Proposta
              </Button>
            </DialogTrigger>
            <DialogContent className="border-slate-700 bg-slate-800 text-white">
              <DialogHeader>
                <DialogTitle>Nova Proposta</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label>Título da Proposta</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="border-slate-600 bg-slate-700"
                    placeholder="Ex: Proposta Comercial - Janeiro 2024"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Nome do Cliente</Label>
                  <Input
                    value={form.client_name}
                    onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                    className="border-slate-600 bg-slate-700"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={form.client_email}
                      onChange={(e) => setForm({ ...form, client_email: e.target.value })}
                      className="border-slate-600 bg-slate-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input
                      value={form.client_phone}
                      onChange={(e) => setForm({ ...form, client_phone: e.target.value })}
                      className="border-slate-600 bg-slate-700"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-amber-500 hover:bg-amber-600">
                    Criar e Editar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                placeholder="Buscar por título ou cliente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-slate-600 bg-slate-700 pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
              </div>
            ) : filteredProposals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <FileText className="mb-4 h-12 w-12" />
                <p>Nenhuma proposta encontrada</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-slate-700/50">
                    <TableHead className="text-slate-400">Título</TableHead>
                    <TableHead className="text-slate-400">Cliente</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="text-slate-400">Data</TableHead>
                    <TableHead className="text-slate-400 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProposals.map((proposal) => (
                    <TableRow key={proposal.id} className="border-slate-700 hover:bg-slate-700/50">
                      <TableCell className="font-medium text-white">{proposal.title}</TableCell>
                      <TableCell className="text-white">{proposal.client_name}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[proposal.status]}>
                          {statusLabels[proposal.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-400">
                        {new Date(proposal.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/propostas/${proposal.id}/editar`)}
                          className="text-slate-400 hover:text-white"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/propostas/${proposal.id}/pdf`)}
                          className="text-slate-400 hover:text-amber-500"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(proposal.id)}
                          className="text-slate-400 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Propostas;
