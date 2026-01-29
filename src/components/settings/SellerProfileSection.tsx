import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { User } from 'lucide-react';

interface SellerProfile {
  seller_name: string;
  seller_email: string;
  seller_phone: string;
  seller_whatsapp: string;
  seller_website: string;
}

interface SellerProfileSectionProps {
  settings: SellerProfile;
  onChange: (settings: SellerProfile) => void;
}

export const SellerProfileSection = ({ settings, onChange }: SellerProfileSectionProps) => {
  return (
    <Card className="border-slate-700 bg-slate-800/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-amber-500" />
          <CardTitle className="text-white">Meus Dados de Vendedor</CardTitle>
        </div>
        <CardDescription className="text-slate-400">
          Essas informações aparecerão como assinatura nos catálogos que você gerar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-slate-300">Nome</Label>
            <Input
              value={settings.seller_name}
              onChange={(e) => onChange({ ...settings, seller_name: e.target.value })}
              className="border-slate-600 bg-slate-700 text-white"
              placeholder="Seu nome completo"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Email</Label>
            <Input
              type="email"
              value={settings.seller_email}
              onChange={(e) => onChange({ ...settings, seller_email: e.target.value })}
              className="border-slate-600 bg-slate-700 text-white"
              placeholder="seu@email.com"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-slate-300">Telefone</Label>
            <Input
              value={settings.seller_phone}
              onChange={(e) => onChange({ ...settings, seller_phone: e.target.value })}
              className="border-slate-600 bg-slate-700 text-white"
              placeholder="(00) 00000-0000"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">WhatsApp</Label>
            <Input
              value={settings.seller_whatsapp}
              onChange={(e) => onChange({ ...settings, seller_whatsapp: e.target.value })}
              className="border-slate-600 bg-slate-700 text-white"
              placeholder="(00) 00000-0000"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-300">Website / Portfólio</Label>
          <Input
            value={settings.seller_website}
            onChange={(e) => onChange({ ...settings, seller_website: e.target.value })}
            className="border-slate-600 bg-slate-700 text-white"
            placeholder="https://seu-site.com"
          />
        </div>

        {/* Preview da assinatura */}
        <div className="space-y-2">
          <Label className="text-slate-300">Prévia da Assinatura</Label>
          <div className="rounded-lg border border-slate-600 bg-slate-900 p-4">
            <div className="border-l-4 border-amber-500 pl-4">
              <p className="font-semibold text-white">
                {settings.seller_name || 'Seu Nome'}
              </p>
              <div className="mt-1 space-y-0.5 text-sm text-slate-400">
                {settings.seller_email && <p>✉️ {settings.seller_email}</p>}
                {settings.seller_phone && <p>📞 {settings.seller_phone}</p>}
                {settings.seller_whatsapp && (
                  <p>
                    <span className="text-green-500">📱</span> {settings.seller_whatsapp}
                  </p>
                )}
                {settings.seller_website && <p>🌐 {settings.seller_website}</p>}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
