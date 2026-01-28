import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2 } from 'lucide-react';
import { Product } from '@/types';

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export const ProductTable = ({ products, onEdit, onDelete }: ProductTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-slate-700 hover:bg-slate-700/50">
          <TableHead className="text-slate-400">Código</TableHead>
          <TableHead className="text-slate-400">Produto</TableHead>
          <TableHead className="text-slate-400">Linha</TableHead>
          <TableHead className="text-slate-400">Potência</TableHead>
          <TableHead className="text-slate-400">Fluxo</TableHead>
          <TableHead className="text-slate-400">IP</TableHead>
          <TableHead className="text-slate-400">Preço</TableHead>
          <TableHead className="text-slate-400 text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id} className="border-slate-700 hover:bg-slate-700/50">
            <TableCell className="font-mono text-white text-sm">{product.code}</TableCell>
            <TableCell className="text-white">
              <div className="flex items-center gap-3">
                {product.image_url && (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-10 w-10 rounded object-cover"
                  />
                )}
                <div>
                  <div className="font-medium">{product.name}</div>
                  <div className="text-xs text-slate-400">{product.category}</div>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline" className="border-amber-500/50 text-amber-400 text-xs">
                {product.line}
              </Badge>
            </TableCell>
            <TableCell className="text-white text-sm">{product.power_watts}W</TableCell>
            <TableCell className="text-slate-400 text-sm">{product.luminous_flux}</TableCell>
            <TableCell>
              <Badge variant="secondary" className="text-xs">
                {product.ip_rating}
              </Badge>
            </TableCell>
            <TableCell className="text-white font-medium">
              R$ {product.price.toFixed(2)}
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(product)}
                className="text-slate-400 hover:text-white h-8 w-8"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(product.id)}
                className="text-slate-400 hover:text-red-500 h-8 w-8"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
