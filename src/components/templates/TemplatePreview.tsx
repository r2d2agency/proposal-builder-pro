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
  const { primary_color, secondary_color, accent_color, cover_layout, products_layout } = template;

  const getAlignment = (position: 'left' | 'center' | 'right') => {
    return position === 'left' ? 'items-start' : position === 'right' ? 'items-end' : 'items-center';
  };

  const getTextAlign = (position: 'left' | 'center' | 'right') => {
    return position === 'left' ? 'text-left' : position === 'right' ? 'text-right' : 'text-center';
  };

  return (
    <div className="space-y-4" style={{ fontFamily: template.font_family }}>
      {/* Capa */}
      <div
        className="rounded-lg p-6"
        style={{ backgroundColor: secondary_color }}
      >
        <div className={`flex flex-col ${getAlignment(cover_layout.logoPosition)} mb-4`}>
          {template.logo_url ? (
            <img
              src={template.logo_url}
              alt="Logo"
              className="h-12 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div
              className="flex h-12 w-24 items-center justify-center rounded text-xs text-white/70"
              style={{ backgroundColor: primary_color }}
            >
              LOGO
            </div>
          )}
        </div>

        <div className={`${getTextAlign(cover_layout.titlePosition)}`}>
          <h2 className="text-xl font-bold text-white">Catálogo de Produtos</h2>
          {cover_layout.showSubtitle && (
            <p className="mt-1 text-sm text-white/70">Iluminação LED Profissional</p>
          )}
        </div>
      </div>

      {/* Produtos Preview */}
      <div className="rounded-lg bg-white p-4">
        <div
          className={`grid gap-3 ${
            products_layout.columns === 1
              ? 'grid-cols-1'
              : products_layout.columns === 2
              ? 'grid-cols-2'
              : 'grid-cols-3'
          }`}
        >
          {[1, 2, 3, 4].slice(0, products_layout.columns * 2).map((i) => (
            <div key={i} className="rounded border border-gray-200 p-2">
              <div
                className={`mb-2 rounded bg-gray-100 ${
                  products_layout.imageSize === 'small'
                    ? 'h-12'
                    : products_layout.imageSize === 'medium'
                    ? 'h-16'
                    : 'h-24'
                }`}
              />
              <div className="text-xs font-medium" style={{ color: secondary_color }}>
                Produto {i}
              </div>
              {products_layout.showDescription && (
                <div className="mt-1 h-2 w-full rounded bg-gray-200" />
              )}
              {products_layout.showPrice && (
                <div className="mt-2 text-xs font-bold" style={{ color: primary_color }}>
                  R$ 199,90
                </div>
              )}
              {products_layout.showSpecs && (
                <div className="mt-1 flex gap-1">
                  <div className="h-2 w-8 rounded bg-gray-200" />
                  <div className="h-2 w-6 rounded bg-gray-200" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Rodapé */}
      <div
        className="rounded-lg p-4"
        style={{ backgroundColor: secondary_color, borderTop: `3px solid ${primary_color}` }}
      >
        <div className="flex items-center justify-between text-xs text-white/70">
          <div>
            {template.footer_layout.showContact && <span>contato@empresa.com</span>}
          </div>
          <div>
            {template.footer_layout.showAddress && <span>São Paulo, SP</span>}
          </div>
        </div>
        {template.footer_layout.customText && (
          <p className="mt-2 text-center text-xs text-white/50">
            {template.footer_layout.customText}
          </p>
        )}
      </div>
    </div>
  );
};

export default TemplatePreview;
