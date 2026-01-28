# PropoCraft API

Backend API para o sistema PropoCraft.

## Configuração

1. Clone este repositório
2. Copie `.env.example` para `.env` e configure as variáveis
3. Execute `npm install`
4. Execute `npm start`

## Variáveis de Ambiente

| Variável | Descrição |
|----------|-----------|
| DATABASE_URL | URL de conexão PostgreSQL |
| JWT_SECRET | Chave secreta para tokens JWT |
| PORT | Porta da API (padrão: 3001) |
| UPLOAD_DIR | Diretório para uploads (padrão: ./uploads) |
| API_BASE_URL | URL pública da API |

## Deploy no EasyPanel

1. Crie um novo App Node.js
2. Conecte este repositório (branch: main)
3. Configure as variáveis de ambiente
4. Adicione um volume persistente para `/app/uploads`
5. Deploy!

## Endpoints

- `POST /api/auth/login` - Autenticação
- `GET /api/stats` - Estatísticas
- `GET/POST/PUT/DELETE /api/products` - Produtos
- `GET /api/categories` - Categorias
- `GET/POST/PUT/DELETE /api/proposals` - Propostas
- `GET/POST/DELETE /api/users` - Usuários (admin)
- `GET/PUT /api/settings` - Configurações
- `POST /api/upload` - Upload de imagens
