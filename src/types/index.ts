export interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  price: number;
  image_url: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Proposal {
  id: string;
  title: string;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  cover_title: string;
  cover_subtitle?: string;
  footer_text: string;
  company_logo_url?: string;
  products: ProposalProduct[];
  status: 'draft' | 'sent' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface ProposalProduct {
  product_id: string;
  product: Product;
  quantity: number;
  custom_price?: number;
}

export interface ProposalTemplate {
  id: string;
  name: string;
  cover_title: string;
  cover_subtitle?: string;
  footer_text: string;
  company_logo_url?: string;
  primary_color: string;
  secondary_color: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'vendedor';
  created_at: string;
}
