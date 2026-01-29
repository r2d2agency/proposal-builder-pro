-- ============================================
-- PropoCraft - Database Initialization Script
-- ============================================

-- Extensão para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELAS
-- ============================================

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Enum e Tabela de Roles
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'vendedor');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    role user_role NOT NULL DEFAULT 'vendedor',
    UNIQUE (user_id, role)
);

-- Tabela de Categorias
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Produtos
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(255),
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    image_url TEXT,
    -- Campos técnicos para iluminação
    power VARCHAR(50),
    luminous_flux VARCHAR(50),
    color_temperature VARCHAR(50),
    beam_angle VARCHAR(50),
    ip_rating VARCHAR(20),
    voltage VARCHAR(50),
    dimensions VARCHAR(100),
    weight VARCHAR(50),
    material VARCHAR(100),
    warranty VARCHAR(50),
    life_expectancy VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Propostas
CREATE TABLE IF NOT EXISTS proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255),
    client_phone VARCHAR(50),
    cover_title VARCHAR(255) DEFAULT 'Proposta Comercial',
    cover_subtitle TEXT,
    footer_text TEXT DEFAULT 'Obrigado pela preferência!',
    company_logo_url TEXT,
    status VARCHAR(20) DEFAULT 'draft',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Produtos da Proposta
CREATE TABLE IF NOT EXISTS proposal_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INTEGER DEFAULT 1,
    custom_price DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Configurações da Empresa
CREATE TABLE IF NOT EXISTS company_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255),
    logo_url TEXT,
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(255),
    cnpj VARCHAR(20),
    default_footer TEXT,
    -- Branding
    primary_color VARCHAR(20) DEFAULT '#1a1a2e',
    secondary_color VARCHAR(20) DEFAULT '#16213e',
    accent_color VARCHAR(20) DEFAULT '#f59e0b',
    font_family VARCHAR(100) DEFAULT 'Inter',
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Templates de Catálogo
CREATE TABLE IF NOT EXISTS catalog_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    -- Configurações de branding
    logo_url TEXT,
    primary_color VARCHAR(20) DEFAULT '#f59e0b',
    secondary_color VARCHAR(20) DEFAULT '#1e293b',
    accent_color VARCHAR(20) DEFAULT '#3b82f6',
    font_family VARCHAR(100) DEFAULT 'Inter',
    -- Layout da capa
    cover_layout JSONB DEFAULT '{"logoPosition": "center", "titlePosition": "center", "showSubtitle": true}',
    -- Layout dos produtos
    products_layout JSONB DEFAULT '{"columns": 2, "showPrice": true, "showDescription": true, "showSpecs": true, "imageSize": "medium"}',
    -- Layout do rodapé
    footer_layout JSONB DEFAULT '{"showContact": true, "showAddress": true, "customText": ""}',
    -- Metadados
    is_default BOOLEAN DEFAULT false,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Catálogos gerados
CREATE TABLE IF NOT EXISTS catalogs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    template_id UUID REFERENCES catalog_templates(id),
    client_name VARCHAR(255),
    client_email VARCHAR(255),
    -- Produtos selecionados (array de IDs)
    product_ids UUID[] DEFAULT '{}',
    -- PDF gerado
    pdf_url TEXT,
    status VARCHAR(20) DEFAULT 'draft',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Perfil do Vendedor
CREATE TABLE IF NOT EXISTS seller_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    seller_name VARCHAR(255),
    seller_email VARCHAR(255),
    seller_phone VARCHAR(50),
    seller_whatsapp VARCHAR(50),
    seller_website VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- ÍNDICES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);
CREATE INDEX IF NOT EXISTS idx_proposals_created_by ON proposals(created_by);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);

-- ============================================
-- DADOS INICIAIS
-- ============================================

-- Inserir configuração padrão (se não existir)
INSERT INTO company_settings (name, default_footer) 
SELECT 'Minha Empresa', 'Obrigado pela preferência!'
WHERE NOT EXISTS (SELECT 1 FROM company_settings);

-- Inserir categorias de exemplo (se não existirem)
INSERT INTO categories (name, description) 
SELECT 'Iluminação Industrial', 'Produtos para ambientes industriais'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Iluminação Industrial');

INSERT INTO categories (name, description) 
SELECT 'Iluminação Comercial', 'Produtos para ambientes comerciais'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Iluminação Comercial');

INSERT INTO categories (name, description) 
SELECT 'Iluminação Externa', 'Produtos para áreas externas'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Iluminação Externa');

-- Criar usuário admin inicial (senha: admin123)
-- Hash bcrypt válido para "admin123"
INSERT INTO users (email, password_hash, name) 
SELECT 'admin@empresa.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@empresa.com');

INSERT INTO user_roles (user_id, role) 
SELECT id, 'admin' FROM users WHERE email = 'admin@empresa.com'
AND NOT EXISTS (SELECT 1 FROM user_roles ur JOIN users u ON ur.user_id = u.id WHERE u.email = 'admin@empresa.com');

-- ============================================
-- FIM
-- ============================================
