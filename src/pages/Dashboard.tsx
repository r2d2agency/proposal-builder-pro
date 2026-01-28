import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApi } from '@/hooks/useApi';
import { Package, FileText, TrendingUp, Users } from 'lucide-react';

interface Stats {
  totalProdutos: number;
  totalPropostas: number;
  propostasMes: number;
  totalUsuarios: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalProdutos: 0,
    totalPropostas: 0,
    propostasMes: 0,
    totalUsuarios: 0,
  });
  const { fetchWithAuth } = useApi();

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetchWithAuth('/api/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      }
    };
    loadStats();
  }, []);

  const cards = [
    { title: 'Total de Produtos', value: stats.totalProdutos, icon: Package, color: 'from-blue-500 to-blue-600' },
    { title: 'Propostas Geradas', value: stats.totalPropostas, icon: FileText, color: 'from-amber-500 to-amber-600' },
    { title: 'Propostas este Mês', value: stats.propostasMes, icon: TrendingUp, color: 'from-green-500 to-green-600' },
    { title: 'Usuários Ativos', value: stats.totalUsuarios, icon: Users, color: 'from-purple-500 to-purple-600' },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400">Visão geral do sistema</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <Card key={card.title} className="border-slate-700 bg-slate-800/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">
                  {card.title}
                </CardTitle>
                <div className={`rounded-lg bg-gradient-to-br ${card.color} p-2`}>
                  <card.icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{card.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader>
            <CardTitle className="text-white">Últimas Propostas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-400">As propostas recentes aparecerão aqui.</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
