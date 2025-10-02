# 🚀 Deploy via GitHub no Easypanel

## 📋 Passo 1: Criar Repositório no GitHub

1. Acesse https://github.com/new
2. Nome: `meu-orcamento`
3. Visibilidade: **Privado** (recomendado) ou Público
4. **NÃO** inicialize com README
5. Clique em **Create repository**

---

## 💻 Passo 2: Enviar Código para o GitHub

Abra o terminal na pasta do projeto e execute:

```bash
# Inicializar Git
git init

# Adicionar todos os arquivos
git add .

# Fazer primeiro commit
git commit -m "Initial commit - Meu Orçamento"

# Adicionar repositório remoto (substitua SEU-USUARIO)
git remote add origin https://github.com/SEU-USUARIO/meu-orcamento.git

# Enviar para o GitHub
git branch -M main
git push -u origin main
```

---

## 🎯 Passo 3: Deploy do BACKEND no Easypanel

### 3.1 Criar Aplicação

1. No Easypanel → **"Aplicativo"**
2. Nome: `meu-orcamento-backend`
3. Clique na aba **"GitHub"**

### 3.2 Conectar GitHub

1. Clique em **"Conectar GitHub"** (se ainda não conectou)
2. Autorize o Easypanel
3. Selecione o repositório: `meu-orcamento`
4. **Branch:** `main`
5. **Pasta:** `backend` ⚠️ IMPORTANTE!

### 3.3 Configurar Build

- **Build Method:** Dockerfile
- O Dockerfile já está na pasta backend

### 3.4 Variáveis de Ambiente

Adicione em "Environment":

```env
DB_HOST=easypanel.juliolopes.site
DB_USER=mysql
DB_PASSWORD=f946f7c4be97a915932c
DB_NAME=meu-orcamento
DB_PORT=3342
PORT=3000
NODE_ENV=production
JWT_SECRET=meu-orcamento-super-secret-key-2024
```

### 3.5 Porta

- **Port:** 3000
- Habilitar **HTTPS**

### 3.6 Deploy

- Clique em **"Deploy"**
- Aguarde o build
- **Copie a URL gerada!** (ex: `https://backend-abc.easypanel.host`)

---

## 🎨 Passo 4: Atualizar config.js

**ANTES** de fazer deploy do frontend:

1. Edite o arquivo `config.js` no seu código local:

```javascript
window.API_URL = 'https://SUA-URL-DO-BACKEND/api';
```

2. Faça commit:

```bash
git add config.js
git commit -m "Update API URL for production"
git push
```

---

## 🌐 Passo 5: Deploy do FRONTEND no Easypanel

### 5.1 Criar Aplicação

1. No Easypanel → **"Aplicativo"** novamente
2. Nome: `meu-orcamento-frontend`
3. Clique na aba **"GitHub"**

### 5.2 Conectar ao Mesmo Repositório

1. Selecione: `meu-orcamento`
2. **Branch:** `main`
3. **Pasta:** `/` (raiz) ⚠️ IMPORTANTE!

### 5.3 Configurar Build

- **Build Method:** Dockerfile
- O Dockerfile está na raiz

### 5.4 Porta

- **Port:** 80
- Habilitar **HTTPS**

### 5.5 Deploy

- Clique em **"Deploy"**
- Aguarde o build
- **Pronto!** Acesse a URL do frontend

---

## ✅ Verificação

1. Acesse a URL do frontend
2. Tente fazer login/registro
3. Crie contas, transações
4. Verifique se salva no banco

---

## 🔄 Atualizações Futuras

Para atualizar o sistema:

```bash
# Faça suas alterações
git add .
git commit -m "Descrição das mudanças"
git push
```

No Easypanel:
- Vai fazer **rebuild automático** ou
- Clique em **"Rebuild"** manualmente

---

## 🐛 Troubleshooting

### Erro de Build
- Verifique os logs no Easypanel
- Confira se a pasta está correta (`backend` ou `/`)

### Erro "Dockerfile not found"
- Confirme que o Dockerfile está na pasta correta
- Backend: `backend/Dockerfile`
- Frontend: `Dockerfile` (na raiz)

### CORS Error
- Verifique se a URL do backend está correta no `config.js`
- Confira as variáveis de ambiente

---

## 🎉 Pronto!

Seu sistema agora está em produção via GitHub com deploy automático! 🚀
