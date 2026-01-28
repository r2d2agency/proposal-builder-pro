import { CoverLayout, ProductsLayout, FooterLayout } from '@/types/catalog';

interface TemplatePreviewProps {
  template: {
    name: string;
    logo_url?: string;
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    font_family: string;
    cover_layout: CoverLayout;
    products_layout: ProductsLayout;
    footer_layout: FooterLayout;
  };
}

const TemplatePreview = ({ template }: TemplatePreviewProps) => {
  const { primary_color, secondary_color, cover_layout, products_layout } = template;

  const getAlignment = (position: 'left' | 'center' | 'right') => {
    return position === 'left' ? 'items-start' : position === 'right' ? 'items-end' : 'items-center';
  };

  const getTextAlign = (position: 'left' | 'center' | 'right') => {
    return position === 'left' ? 'text-left' : position === 'right' ? 'text-right' : 'text-center';
  };

  return (
    <div className="space-y-3" style={{ fontFamily: template.font_family }}>
      {/* Capa - Proporção A4 */}
      <div
        className="relative overflow-hidden rounded-lg shadow-lg"
        style={{ 
          backgroundColor: secondary_color,
          aspectRatio: '210 / 297', // Proporção A4
        }}
      >
        <div className="absolute inset-0 flex flex-col p-4">
          {/* Logo */}
          <div className={`flex ${getAlignment(cover_layout.logoPosition)} mb-3`}>
            {template.logo_url ? (
              <img
                src={template.logo_url}
                alt="Logo"
                className="h-8 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div
                className="flex h-8 w-16 items-center justify-center rounded text-[10px] text-white/70"
                style={{ backgroundColor: primary_color }}
              >
                LOGO
              </div>
            )}
          </div>

          {/* Título centralizado */}
          <div className={`flex flex-1 flex-col justify-center ${getTextAlign(cover_layout.titlePosition)}`}>
            <h2 className="text-base font-bold text-white">Catálogo de Produtos</h2>
            {cover_layout.showSubtitle && (
              <p className="mt-1 text-[10px] text-white/70">Iluminação LED Profissional</p>
            )}
          </div>

          {/* Data no rodapé */}
          <div 
            className="pt-2 text-center text-[8px] text-white/50"
            style={{ borderTop: `2px solid ${primary_color}` }}
          >
            Janeiro 2024
          </div>
        </div>
      </div>

      {/* Página de Produtos - Proporção A4 */}
      <div
        className="relative overflow-hidden rounded-lg bg-white shadow-lg"
        style={{ aspectRatio: '210 / 297' }}
      >
        <div className="absolute inset-0 flex flex-col p-3">
          {/* Header */}
          <div 
            className="mb-2 flex items-center justify-between pb-1"
            style={{ borderBottom: `2px solid ${primary_color}` }}
          >
            <div 
              className="h-5 w-10 rounded text-[6px] flex items-center justify-center text-white"
              style={{ backgroundColor: primary_color }}
            >
              LOGO
            </div>
            <span className="text-[8px]" style={{ color: secondary_color }}>Catálogo</span>
          </div>

          {/* Grid de produtos */}
          <div
            className={`flex-1 grid gap-2 ${
              products_layout.columns === 1
                ? 'grid-cols-1'
                : products_layout.columns === 2
                ? 'grid-cols-2'
                : 'grid-cols-3'
            }`}
          >
            {[1, 2, 3, 4, 5, 6].slice(0, products_layout.columns * 2).map((i) => (
              <div key={i} className="rounded border border-gray-200 p-1.5">
                <div
                  className={`mb-1 rounded bg-gray-100 ${
                    products_layout.imageSize === 'small'
                      ? 'h-6'
                      : products_layout.imageSize === 'medium'
                      ? 'h-10'
                      : 'h-14'
                  }`}
                />
                <div className="text-[8px] font-medium" style={{ color: secondary_color }}>
                  Produto {i}
                </div>
                {products_layout.showDescription && (
                  <div className="mt-0.5 h-1.5 w-full rounded bg-gray-200" />
                )}
                {products_layout.showPrice && (
                  <div className="mt-1 text-[8px] font-bold" style={{ color: primary_color }}>
                    R$ 199,90
                  </div>
                )}
                {products_layout.showSpecs && (
                  <div className="mt-0.5 flex gap-0.5">
                    <div className="h-1 w-4 rounded bg-gray-200" />
                    <div className="h-1 w-3 rounded bg-gray-200" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div 
            className="mt-2 flex items-center justify-between pt-1 text-[7px] text-gray-500"
            style={{ borderTop: `1px solid ${primary_color}` }}
          >
            <span>contato@empresa.com</span>
            <span>Página 2</span>
          </div>
        </div>
      </div>

      {/* Página Final - Proporção A4 */}
      <div
        className="relative overflow-hidden rounded-lg shadow-lg"
        style={{ 
          backgroundColor: secondary_color,
          aspectRatio: '210 / 297',
        }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
          <div 
            className="mb-3 flex h-10 w-16 items-center justify-center rounded text-[10px] text-white"
            style={{ backgroundColor: primary_color }}
          >
            LOGO
          </div>
          <h3 className="text-sm font-bold text-white">Entre em Contato</h3>
          <div className="mt-2 space-y-1 text-[9px] text-white/70">
            <p>📞 (11) 99999-9999</p>
            <p>✉️ contato@empresa.com</p>
          </div>
          {template.footer_layout.customText && (
            <p className="mt-3 text-[8px] text-white/50">
              {template.footer_layout.customText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplatePreview;
