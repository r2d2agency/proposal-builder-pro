# PropoCraft - Backend API

## Scripts SQL para PostgreSQL

Execute estes comandos no seu banco PostgreSQL:

```sql
-- Extensão para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de Usuários
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Roles (separada por segurança)
CREATE TYPE user_role AS ENUM ('admin', 'vendedor');

CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    role user_role NOT NULL DEFAULT 'vendedor',
    UNIQUE (user_id, role)
);

-- Tabela de Categorias
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Produtos
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(255),
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Propostas
CREATE TABLE proposals (
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
CREATE TABLE proposal_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INTEGER DEFAULT 1,
    custom_price DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Configurações da Empresa
CREATE TABLE company_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255),
    logo_url TEXT,
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(255),
    cnpj VARCHAR(20),
    default_footer TEXT,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Inserir configuração padrão
INSERT INTO company_settings (name, default_footer) 
VALUES ('Minha Empresa', 'Obrigado pela preferência!');

-- Inserir algumas categorias de exemplo
INSERT INTO categories (name, description) VALUES 
    ('Eletrônicos', 'Produtos eletrônicos em geral'),
    ('Móveis', 'Móveis e decoração'),
    ('Serviços', 'Serviços diversos');

-- Criar usuário admin inicial (senha: admin123)
-- Hash bcrypt de "admin123"
INSERT INTO users (email, password_hash, name) 
VALUES ('admin@empresa.com', '$2b$10$rQZ8K3.X3rKGVPxJ5F8qXeVWxJ5QW5JzQZ8K3.X3rKGVPxJ5F8qXe', 'Administrador');

INSERT INTO user_roles (user_id, role) 
SELECT id, 'admin' FROM users WHERE email = 'admin@empresa.com';

-- Índices para performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_proposals_created_by ON proposals(created_by);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
```

## Código da API (Node.js + Express)

Crie um novo projeto Node.js no EasyPanel:

### package.json

```json
{
  "name": "propocraft-api",
  "version": "1.0.0",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.2",
    "multer": "^1.4.5-lts.1",
    "pg": "^8.11.3",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

### .env (no EasyPanel)

```env
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=seu_secret_super_seguro_aqui
PORT=3001
UPLOAD_DIR=./uploads
```

### src/index.js

```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Configuração do diretório de uploads
const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuração do Multer para upload de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido'));
    }
  },
});

app.use(cors());
app.use(express.json());

// Servir arquivos estáticos de uploads
app.use('/uploads', express.static(uploadDir));

// Middleware de autenticação
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query(
      `SELECT u.*, ur.role FROM users u 
       LEFT JOIN user_roles ur ON u.id = ur.user_id 
       WHERE u.id = $1`,
      [decoded.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Usuário não encontrado' });
    }
    
    req.user = result.rows[0];
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' });
  }
};

// AUTH
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const result = await pool.query(
      `SELECT u.*, ur.role FROM users u 
       LEFT JOIN user_roles ur ON u.id = ur.user_id 
       WHERE u.email = $1`,
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }
    
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!validPassword) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }
    
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role || 'vendedor',
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro interno' });
  }
});

// STATS
app.get('/api/stats', authenticate, async (req, res) => {
  try {
    const [products, proposals, monthProposals, users] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM products'),
      pool.query('SELECT COUNT(*) FROM proposals'),
      pool.query(`SELECT COUNT(*) FROM proposals WHERE created_at >= date_trunc('month', CURRENT_DATE)`),
      pool.query('SELECT COUNT(*) FROM users'),
    ]);
    
    res.json({
      totalProdutos: parseInt(products.rows[0].count),
      totalPropostas: parseInt(proposals.rows[0].count),
      propostasMes: parseInt(monthProposals.rows[0].count),
      totalUsuarios: parseInt(users.rows[0].count),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro interno' });
  }
});

// PRODUCTS
app.get('/api/products', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro interno' });
  }
});

app.post('/api/products', authenticate, async (req, res) => {
  const { code, name, description, category, price, image_url } = req.body;
  
  try {
    const result = await pool.query(
      `INSERT INTO products (code, name, description, category, price, image_url) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [code, name, description, category, price, image_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro interno' });
  }
});

app.put('/api/products/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { code, name, description, category, price, image_url } = req.body;
  
  try {
    const result = await pool.query(
      `UPDATE products SET code=$1, name=$2, description=$3, category=$4, price=$5, image_url=$6, updated_at=NOW() 
       WHERE id=$7 RETURNING *`,
      [code, name, description, category, price, image_url, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro interno' });
  }
});

app.delete('/api/products/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  
  try {
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro interno' });
  }
});

// CATEGORIES
app.get('/api/categories', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro interno' });
  }
});

// PROPOSALS
app.get('/api/proposals', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM proposals ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro interno' });
  }
});

app.get('/api/proposals/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  
  try {
    const proposal = await pool.query('SELECT * FROM proposals WHERE id = $1', [id]);
    
    if (proposal.rows.length === 0) {
      return res.status(404).json({ message: 'Proposta não encontrada' });
    }
    
    const products = await pool.query(
      `SELECT pp.*, p.code, p.name, p.description, p.price, p.image_url, p.category
       FROM proposal_products pp
       JOIN products p ON pp.product_id = p.id
       WHERE pp.proposal_id = $1`,
      [id]
    );
    
    const formattedProducts = products.rows.map(row => ({
      product_id: row.product_id,
      quantity: row.quantity,
      custom_price: row.custom_price,
      product: {
        id: row.product_id,
        code: row.code,
        name: row.name,
        description: row.description,
        price: parseFloat(row.price),
        image_url: row.image_url,
        category: row.category,
      },
    }));
    
    res.json({
      ...proposal.rows[0],
      products: formattedProducts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro interno' });
  }
});

app.post('/api/proposals', authenticate, async (req, res) => {
  const { title, client_name, client_email, client_phone } = req.body;
  
  try {
    const result = await pool.query(
      `INSERT INTO proposals (title, client_name, client_email, client_phone, created_by) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title, client_name, client_email, client_phone, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro interno' });
  }
});

app.put('/api/proposals/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { title, client_name, client_email, client_phone, cover_title, cover_subtitle, footer_text, company_logo_url, products, status } = req.body;
  
  try {
    await pool.query(
      `UPDATE proposals SET 
        title=$1, client_name=$2, client_email=$3, client_phone=$4, 
        cover_title=$5, cover_subtitle=$6, footer_text=$7, company_logo_url=$8, 
        status=COALESCE($9, status), updated_at=NOW()
       WHERE id=$10`,
      [title, client_name, client_email, client_phone, cover_title, cover_subtitle, footer_text, company_logo_url, status, id]
    );
    
    // Update products
    if (products) {
      await pool.query('DELETE FROM proposal_products WHERE proposal_id = $1', [id]);
      
      for (const product of products) {
        await pool.query(
          `INSERT INTO proposal_products (proposal_id, product_id, quantity, custom_price) 
           VALUES ($1, $2, $3, $4)`,
          [id, product.product_id, product.quantity, product.custom_price]
        );
      }
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro interno' });
  }
});

app.delete('/api/proposals/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  
  try {
    await pool.query('DELETE FROM proposals WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro interno' });
  }
});

// USERS (admin only)
app.get('/api/users', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acesso negado' });
  }
  
  try {
    const result = await pool.query(
      `SELECT u.id, u.email, u.name, u.created_at, ur.role 
       FROM users u 
       LEFT JOIN user_roles ur ON u.id = ur.user_id 
       ORDER BY u.name`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro interno' });
  }
});

app.post('/api/users', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acesso negado' });
  }
  
  const { name, email, password, role } = req.body;
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name, created_at`,
      [email, hashedPassword, name]
    );
    
    await pool.query(
      `INSERT INTO user_roles (user_id, role) VALUES ($1, $2)`,
      [result.rows[0].id, role || 'vendedor']
    );
    
    res.status(201).json({ ...result.rows[0], role: role || 'vendedor' });
  } catch (error) {
    console.error(error);
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Email já cadastrado' });
    }
    res.status(500).json({ message: 'Erro interno' });
  }
});

app.delete('/api/users/:id', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acesso negado' });
  }
  
  const { id } = req.params;
  
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro interno' });
  }
});

// SETTINGS
app.get('/api/settings', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM company_settings LIMIT 1');
    res.json(result.rows[0] || {});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro interno' });
  }
});

app.put('/api/settings', authenticate, async (req, res) => {
  const { name, logo_url, address, phone, email, website, cnpj, default_footer } = req.body;
  
  try {
    await pool.query(
      `UPDATE company_settings SET 
        name=$1, logo_url=$2, address=$3, phone=$4, email=$5, 
        website=$6, cnpj=$7, default_footer=$8, updated_at=NOW()`,
      [name, logo_url, address, phone, email, website, cnpj, default_footer]
    );
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro interno' });
  }
});

// UPLOAD DE IMAGENS
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado' });
    }
    
    // Retorna a URL pública do arquivo
    const baseUrl = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 3001}`;
    const url = `${baseUrl}/uploads/${req.file.filename}`;
    
    res.json({ 
      success: true, 
      url,
      filename: req.file.filename,
      size: req.file.size,
    });
  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({ message: 'Erro ao fazer upload' });
  }
});

// Tratamento de erros do Multer
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'Arquivo muito grande. Máximo: 5MB' });
    }
    return res.status(400).json({ message: error.message });
  }
  if (error.message === 'Tipo de arquivo não permitido') {
    return res.status(400).json({ message: error.message });
  }
  next(error);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API rodando na porta ${PORT}`);
  console.log(`Uploads salvos em: ${path.resolve(uploadDir)}`);
});
```

## Instruções de Deploy no EasyPanel

### 1. Banco de Dados PostgreSQL
1. No EasyPanel, crie um novo serviço PostgreSQL
2. Anote as credenciais (host, porta, usuário, senha, database)
3. Conecte ao banco e execute os scripts SQL acima

### 2. API Backend
1. Crie um novo App no EasyPanel (Node.js)
2. Configure o repositório Git ou faça upload do código
3. Configure as variáveis de ambiente:
   - `DATABASE_URL`: postgresql://user:password@host:5432/database
   - `JWT_SECRET`: gere um secret seguro (ex: `openssl rand -hex 32`)
   - `PORT`: 3001
   - `UPLOAD_DIR`: ./uploads
   - `API_BASE_URL`: https://api.seudominio.com (URL pública da API)
4. Configure um volume persistente para a pasta `uploads`
5. Configure o domínio/subdomínio
6. Deploy!

### 3. Frontend (Este projeto)
1. Build do projeto: `npm run build`
2. Configure a variável `VITE_API_URL` com a URL da sua API
3. Faça deploy do frontend (pasta `dist`) em um serviço estático

### 4. Primeiro Acesso
- Email: admin@empresa.com
- Senha: admin123

**IMPORTANTE**: Altere a senha do admin após o primeiro login!

### 5. Upload de Imagens
O sistema suporta upload de imagens para produtos. As imagens são salvas na pasta `uploads` do servidor.

**Volume Persistente (EasyPanel)**:
Para que as imagens não sejam perdidas em deploys, configure um volume persistente:
1. No EasyPanel, vá nas configurações do serviço da API
2. Adicione um volume apontando para `/app/uploads`
3. Isso garante que os arquivos permaneçam entre redeploys
