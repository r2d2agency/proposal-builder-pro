export interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  line: string; // Linha do produto (Industrial E, Power, Fit, Inox, Embutir)
  price: number;
  image_url: string;
  // Especificações técnicas de iluminação
  power_watts: number; // Potência em Watts
  luminous_flux: string; // Fluxo luminoso (ex: "13.380lm")
  color_temperature: string; // Temperatura de cor (ex: "5000K")
  beam_angle: string; // Abertura do facho (ex: "60°", "90°", "100°")
  dimensions: string; // Dimensões (ex: "A:27xB:10xC:22 (cm)")
  ip_rating: string; // Índice de proteção (ex: "IP66", "IP20")
  warranty_years: number; // Garantia em anos
  voltage: string; // Tensão (ex: "220V")
  life_expectancy: string; // Expectativa de vida útil (ex: "102.000h")
  irc: string; // Índice de reprodução de cores (ex: "IRC>80")
  energy_class: string; // Classe de eficiência energética (ex: "Classe A")
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface ProductLine {
  id: string;
  name: string;
  description?: string;
  application?: string; // Ex: "Indústrias, Galpões, Armazéns", "Frigoríficos"
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
