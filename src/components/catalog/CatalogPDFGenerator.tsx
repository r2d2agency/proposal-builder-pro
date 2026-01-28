import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Catalog, CatalogTemplate } from '@/types/catalog';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/hooks/use-toast';
import { Download, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface CatalogPDFGeneratorProps {
  catalog: Catalog;
  onClose: () => void;
}

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

const CatalogPDFGenerator = ({ catalog, onClose }: CatalogPDFGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [template, setTemplate] = useState<CatalogTemplate | null>(null);
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { fetchWithAuth } = useApi();
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [templateRes, settingsRes] = await Promise.all([
        catalog.template_id ? fetchWithAuth(`/api/templates/${catalog.template_id}`) : null,
        fetchWithAuth('/api/settings'),
      ]);

      if (templateRes?.ok) {
        setTemplate(await templateRes.json());
      }
      if (settingsRes.ok) {
        setCompanySettings(await settingsRes.json());
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const primaryColor = template?.primary_color || '#f59e0b';
  const secondaryColor = template?.secondary_color || '#1e293b';
  const accentColor = template?.accent_color || '#3b82f6';
  const fontFamily = template?.font_family || 'Inter';

  const coverLayout = template?.cover_layout || {
    logoPosition: 'center',
    titlePosition: 'center',
    showSubtitle: true,
  };

  const productsLayout = template?.products_layout || {
    columns: 2,
    showPrice: true,
    showDescription: true,
    showSpecs: true,
    imageSize: 'medium',
  };

  const footerLayout = template?.footer_layout || {
    showContact: true,
    showAddress: true,
    customText: '',
  };

  const getAlignment = (position: 'left' | 'center' | 'right') => {
    return position === 'left' ? 'flex-start' : position === 'right' ? 'flex-end' : 'center';
  };

  const handleGeneratePDF = async () => {
    if (!contentRef.current) return;

    setIsGenerating(true);

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Capturar cada página
      const pages = contentRef.current.querySelectorAll('.pdf-page');

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i] as HTMLElement;

        const canvas = await html2canvas(page, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);

        if (i > 0) {
          pdf.addPage();
        }

        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      }

      // Download
      pdf.save(`${catalog.name.replace(/\s+/g, '_')}.pdf`);

      toast({ title: 'PDF gerado com sucesso!' });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({ title: 'Erro ao gerar PDF', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  const products = catalog.products || [];

  // Calcular produtos por página (baseado no layout)
  const productsPerPage = productsLayout.columns === 1 ? 3 : productsLayout.columns === 2 ? 4 : 6;
  const productPages: typeof products[] = [];

  for (let i = 0; i < products.length; i += productsPerPage) {
    productPages.push(products.slice(i, i + productsPerPage));
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={handleGeneratePDF}
          disabled={isGenerating}
          className="bg-amber-500 hover:bg-amber-600"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Gerando PDF...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Baixar PDF
            </>
          )}
        </Button>
      </div>

      {/* Preview do PDF */}
      <div className="max-h-[70vh] overflow-auto rounded-lg border border-slate-600 bg-gray-200 p-4">
        <div ref={contentRef} style={{ fontFamily }}>
          {/* Capa */}
          <div
            className="pdf-page mb-4"
            style={{
              width: '210mm',
              height: '297mm',
              backgroundColor: secondaryColor,
              padding: '40px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ display: 'flex', justifyContent: getAlignment(coverLayout.logoPosition) }}>
              {(template?.logo_url || companySettings?.logo_url) && (
                <img
                  src={template?.logo_url || companySettings?.logo_url}
                  alt="Logo"
                  style={{ height: '80px', objectFit: 'contain' }}
                  crossOrigin="anonymous"
                />
              )}
            </div>

            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: getAlignment(coverLayout.titlePosition),
                textAlign: coverLayout.titlePosition,
              }}
            >
              <h1 style={{ color: '#fff', fontSize: '48px', fontWeight: 'bold', marginBottom: '16px' }}>
                {catalog.name}
              </h1>
              {coverLayout.showSubtitle && (
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '24px' }}>
                  {catalog.client_name
                    ? `Preparado para ${catalog.client_name}`
                    : companySettings?.name || 'Catálogo de Produtos'}
                </p>
              )}
            </div>

            <div
              style={{
                color: 'rgba(255,255,255,0.6)',
                fontSize: '14px',
                textAlign: 'center',
                borderTop: `2px solid ${primaryColor}`,
                paddingTop: '20px',
              }}
            >
              {new Date().toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' })}
            </div>
          </div>

          {/* Páginas de produtos */}
          {productPages.map((pageProducts, pageIndex) => (
            <div
              key={pageIndex}
              className="pdf-page mb-4"
              style={{
                width: '210mm',
                height: '297mm',
                backgroundColor: '#fff',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px',
                  paddingBottom: '10px',
                  borderBottom: `2px solid ${primaryColor}`,
                }}
              >
                {(template?.logo_url || companySettings?.logo_url) && (
                  <img
                    src={template?.logo_url || companySettings?.logo_url}
                    alt="Logo"
                    style={{ height: '40px', objectFit: 'contain' }}
                    crossOrigin="anonymous"
                  />
                )}
                <span style={{ color: secondaryColor, fontSize: '12px' }}>
                  {catalog.name}
                </span>
              </div>

              {/* Grid de produtos */}
              <div
                style={{
                  flex: 1,
                  display: 'grid',
                  gridTemplateColumns: `repeat(${productsLayout.columns}, 1fr)`,
                  gap: '16px',
                }}
              >
                {pageProducts.map((product) => (
                  <div
                    key={product.id}
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    {product.image_url && (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        style={{
                          width: '100%',
                          height:
                            productsLayout.imageSize === 'small'
                              ? '100px'
                              : productsLayout.imageSize === 'medium'
                              ? '150px'
                              : '200px',
                          objectFit: 'contain',
                          marginBottom: '12px',
                          borderRadius: '4px',
                        }}
                        crossOrigin="anonymous"
                      />
                    )}

                    <h3 style={{ color: secondaryColor, fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>
                      {product.name}
                    </h3>

                    <p style={{ color: '#6b7280', fontSize: '12px', marginBottom: '8px' }}>
                      Código: {product.code}
                    </p>

                    {productsLayout.showDescription && product.description && (
                      <p style={{ color: '#374151', fontSize: '12px', marginBottom: '8px', lineHeight: '1.4' }}>
                        {product.description.substring(0, 100)}
                        {product.description.length > 100 && '...'}
                      </p>
                    )}

                    {productsLayout.showSpecs && (
                      <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '8px' }}>
                        {product.power_watts && <span>Potência: {product.power_watts}W • </span>}
                        {product.luminous_flux && <span>Fluxo: {product.luminous_flux} • </span>}
                        {product.color_temperature && <span>{product.color_temperature}</span>}
                      </div>
                    )}

                    {productsLayout.showPrice && (
                      <div style={{ marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid #e5e7eb' }}>
                        <span style={{ color: primaryColor, fontSize: '18px', fontWeight: 'bold' }}>
                          R$ {product.price?.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div
                style={{
                  marginTop: '20px',
                  paddingTop: '10px',
                  borderTop: `1px solid ${primaryColor}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '10px',
                  color: '#6b7280',
                }}
              >
                <div>
                  {footerLayout.showContact && companySettings?.phone && (
                    <span>{companySettings.phone} • </span>
                  )}
                  {footerLayout.showContact && companySettings?.email && (
                    <span>{companySettings.email}</span>
                  )}
                </div>
                <div>Página {pageIndex + 2}</div>
              </div>
            </div>
          ))}

          {/* Página final / Contato */}
          <div
            className="pdf-page"
            style={{
              width: '210mm',
              height: '297mm',
              backgroundColor: secondaryColor,
              padding: '40px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            {(template?.logo_url || companySettings?.logo_url) && (
              <img
                src={template?.logo_url || companySettings?.logo_url}
                alt="Logo"
                style={{ height: '100px', objectFit: 'contain', marginBottom: '40px' }}
                crossOrigin="anonymous"
              />
            )}

            <h2 style={{ color: '#fff', fontSize: '36px', fontWeight: 'bold', marginBottom: '20px' }}>
              {companySettings?.name || 'Entre em Contato'}
            </h2>

            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '18px', lineHeight: '2' }}>
              {footerLayout.showContact && companySettings?.phone && <p>📞 {companySettings.phone}</p>}
              {footerLayout.showContact && companySettings?.email && <p>✉️ {companySettings.email}</p>}
              {companySettings?.website && <p>🌐 {companySettings.website}</p>}
              {footerLayout.showAddress && companySettings?.address && (
                <p style={{ marginTop: '20px' }}>📍 {companySettings.address}</p>
              )}
            </div>

            {footerLayout.customText && (
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginTop: '40px' }}>
                {footerLayout.customText}
              </p>
            )}

            {companySettings?.default_footer && (
              <p
                style={{
                  color: primaryColor,
                  fontSize: '16px',
                  marginTop: '60px',
                  fontWeight: 'bold',
                }}
              >
                {companySettings.default_footer}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatalogPDFGenerator;
