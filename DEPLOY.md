# 🚀 Guia de Deploy no Easypanel

## 📋 Pré-requisitos

- ✅ Conta no Easypanel
- ✅ MySQL já configurado (você já tem!)
- ✅ Repositório Git (GitHub, GitLab, etc.) - OPCIONAL

---

## 🎯 Passo 1: Deploy do Backend (Node.js API)

### 1.1 Criar Aplicação no Easypanel

1. No Easypanel, clique em **"Aplicativo"**
2. Nome: `meu-orcamento-backend`
3. Tipo: **App (Docker)**

### 1.2 Configurar o Build

**Método 1: Upload de Pasta (Mais Fácil)**
- No Easypanel, vá em "Source" > "Upload"
- Faça upload da pasta `backend/` inteira
- Build Command: `npm install`
- Start Command: `node server.js`

**Método 2: Git (Recomendado)**
- Conecte seu repositório Git
- Pasta raiz: `backend`
- Branch: `main` ou `master`

### 1.3 Variáveis de Ambiente

No Easypanel, adicione as seguintes variáveis:

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

### 1.4 Configurar Porta

- Porta interna: **3000**
- Habilitar HTTPS

### 1.5 Deploy

- Clique em **"Deploy"**
- Aguarde o build finalizar
- Anote a URL gerada (ex: `https://meu-orcamento-backend.easypanel.host`)

---

## 🎨 Passo 2: Deploy do Frontend (HTML/CSS/JS)

### 2.1 Atualizar config.js

**ANTES de fazer upload**, edite o arquivo `config.js`:

```javascript
// Substitua pela URL do seu backend!
window.API_URL = 'https://meu-orcamento-backend.easypanel.host/api';
```

### 2.2 Criar Aplicação Frontend

1. No Easypanel, clique em **"Aplicativo"** novamente
2. Nome: `meu-orcamento-frontend`
3. Tipo: **App (Docker)**

### 2.3 Configurar o Build

**Upload dos Arquivos:**
- Faça upload da pasta raiz (que contém `index.html`, `login.html`, `css/`, `js/`, etc.)
- O Dockerfile já está configurado

### 2.4 Configurar Porta

- Porta interna: **80**
- Habilitar HTTPS

### 2.5 Deploy

- Clique em **"Deploy"**
- Aguarde o build finalizar
- Anote a URL gerada (ex: `https://meu-orcamento.easypanel.host`)

---

## 🔧 Passo 3: Configurar CORS no Backend

No servidor backend, já está configurado o CORS para aceitar todas as origens em produção.

Se quiser restringir apenas para o seu domínio frontend, edite `backend/server.js`:

```javascript
// No lugar de:
app.use(cors());

// Use:
app.use(cors({
    origin: 'https://meu-orcamento.easypanel.host',
    credentials: true
}));
```

---

## ✅ Passo 4: Testar

1. Acesse a URL do frontend
2. Faça login ou registre-se
3. Teste criar contas, transações, transferências
4. Verifique se tudo está salvando no banco

---

## 🐛 Troubleshooting

### Erro de CORS
- Verifique se o backend está rodando
- Confira a URL no `config.js`
- Verifique os logs do backend no Easypanel

### Erro de Conexão com MySQL
- Verifique as variáveis de ambiente
- Confirme que o MySQL está acessível da VPS
- Teste a conexão com `node backend/check-account-schema.js`

### Frontend não carrega
- Verifique se o Nginx está rodando (porta 80)
- Confira os logs no Easypanel
- Veja se todos os arquivos foram enviados

---

## 🎉 Deploy Concluído!

Seu sistema está agora rodando em produção com:
- ✅ Backend Node.js + Express
- ✅ Frontend HTML/CSS/JS
- ✅ MySQL Database
- ✅ HTTPS habilitado
- ✅ Multi-tenancy funcionando

---

## 📝 Domínio Personalizado (Opcional)

Se quiser usar seu próprio domínio:

1. No Easypanel, vá em "Domains"
2. Adicione seu domínio (ex: `orcamento.seusite.com`)
3. Configure o DNS no seu provedor:
   ```
   Type: CNAME
   Name: orcamento
   Value: seu-app.easypanel.host
   ```

4. Aguarde propagação do DNS (até 24h)

---

## 🔄 Atualizações Futuras

Para atualizar o sistema:

1. Faça as alterações localmente
2. Teste localmente
3. No Easypanel:
   - Se usando Git: Faça push e clique em "Rebuild"
   - Se usando Upload: Faça novo upload e "Rebuild"

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs no Easypanel
2. Teste as variáveis de ambiente
3. Confirme que o MySQL está acessível
