FROM node:20-alpine

WORKDIR /app

# Copiar package.json
COPY package.json ./

# Instalar dependências
RUN npm install --production

# Copiar código fonte
COPY . .

# Criar diretório de uploads
RUN mkdir -p uploads

# Expor porta
EXPOSE 3001

# Iniciar aplicação
CMD ["npm", "start"]
