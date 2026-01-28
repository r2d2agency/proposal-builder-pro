export interface CoverLayout {
  logoPosition: 'left' | 'center' | 'right';
  titlePosition: 'left' | 'center' | 'right';
  showSubtitle: boolean;
  backgroundImage?: string;
}

export interface ProductsLayout {
  columns: 1 | 2 | 3;
  showPrice: boolean;
  showDescription: boolean;
  showSpecs: boolean;
  imageSize: 'small' | 'medium' | 'large';
}

export interface FooterLayout {
  showContact: boolean;
  showAddress: boolean;
  customText: string;
}

export interface CatalogTemplate {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_family: string;
  cover_layout: CoverLayout;
  products_layout: ProductsLayout;
  footer_layout: FooterLayout;
  is_default: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Catalog {
  id: string;
  name: string;
  template_id?: string;
  template?: CatalogTemplate;
  client_name?: string;
  client_email?: string;
  product_ids: string[];
  products?: Product[];
  pdf_url?: string;
  status: 'draft' | 'generated' | 'sent';
  created_by?: string;
  created_at: string;
  updated_at: string;
}

import { Product } from './index';
