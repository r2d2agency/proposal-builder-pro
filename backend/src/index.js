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

// Função para inicializar o banco de dados
const initDatabase = async () => {
  try {
    const initSQL = fs.readFileSync(path.join(__dirname, '../database/init.sql'), 'utf8');
    await pool.query(initSQL);
    console.log('✅ Banco de dados inicializado com sucesso!');
  } catch (error) {
    // Se o arquivo não existir ou já estiver inicializado, continua normalmente
    if (error.code === 'ENOENT') {
      console.log('ℹ️ Arquivo init.sql não encontrado, pulando inicialização');
    } else if (error.message.includes('already exists') || error.message.includes('duplicate')) {
      console.log('ℹ️ Banco de dados já inicializado');
    } else {
      console.error('⚠️ Erro ao inicializar banco:', error.message);
    }
  }
};

// Inicializar banco na startup
initDatabase();

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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

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
app.post('/api/upload', authenticate, upload.single('image'), (req, res) => {
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
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 API rodando na porta ${PORT}`);
  console.log(`📁 Uploads salvos em: ${path.resolve(uploadDir)}`);
});
