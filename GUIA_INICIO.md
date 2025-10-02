# 🚀 Guia de Início Rápido

## ✅ O que foi configurado

- ✅ Backend Node.js + Express criado
- ✅ Banco de dados MySQL configurado
- ✅ Tabelas criadas automaticamente
- ✅ API REST completa
- ✅ Frontend atualizado para usar o backend
- ✅ API Key OpenAI protegida no backend
- ✅ Dependências instaladas

---

## 🏃 Como Iniciar o Projeto

### **1. Iniciar o Backend**

Abra um terminal na pasta `backend`:

```bash
cd backend
npm start
```

Você verá:
```
🚀 Servidor rodando na porta 3000
📍 http://localhost:3000
🏥 Health check: http://localhost:3000/api/health
✅ Conectado ao banco de dados MySQL
```

### **2. Abrir o Frontend**

Em outro terminal, na raiz do projeto:

```bash
# No Windows
start index.html

# Ou simplesmente abra index.html no navegador
```

---

## 🧪 Testar se Está Funcionando

### **Teste 1: Backend Online**
Acesse no navegador: http://localhost:3000/api/health

Deve retornar:
```json
{"status":"OK","message":"Backend está funcionando!"}
```

### **Teste 2: Frontend Conectado**
1. Abra o `index.html` no navegador
2. Abra o **Console** (F12)
3. Deve aparecer: `✅ Dados carregados do backend`

### **Teste 3: Criar uma Conta**
1. Clique em "Contas" no menu lateral
2. Clique em "Adicionar Conta"
3. Preencha nome e saldo
4. Salve
5. A conta será salva no banco de dados!

### **Teste 4: Análise com IA**
1. Adicione algumas transações
2. Vá para Dashboard
3. Clique em "✨ Analisar Finanças"
4. O GPT vai analisar seus dados!

---

## 📡 Endpoints da API

### Contas
- `GET /api/accounts` - Listar todas
- `POST /api/accounts` - Criar nova
- `PUT /api/accounts/:id` - Atualizar
- `DELETE /api/accounts/:id` - Excluir

### Categorias
- `GET /api/categories` - Listar todas
- `POST /api/categories` - Criar nova
- `PUT /api/categories/:id` - Atualizar
- `DELETE /api/categories/:id` - Excluir

### Lançamentos
- `GET /api/transactions` - Listar todos
- `POST /api/transactions` - Criar novo
- `PUT /api/transactions/:id` - Atualizar
- `DELETE /api/transactions/:id` - Excluir

### Orçamento
- `GET /api/budget` - Listar itens
- `POST /api/budget` - Criar item
- `PUT /api/budget/:id` - Atualizar
- `DELETE /api/budget/:id` - Excluir

### Análise IA
- `POST /api/ai/analyze` - Analisar finanças

---

## 🔧 Comandos Úteis

```bash
# Backend
cd backend
npm start          # Iniciar servidor
npm run dev        # Iniciar com auto-reload (nodemon)
npm run init-db    # Recriar banco de dados

# Frontend
# Apenas abrir index.html no navegador
```

---

## 🗄️ Estrutura do Banco de Dados

### Conexão MySQL
- **Host**: easypanel.juliolopes.site
- **Porta**: 3342
- **Database**: meu-orcamento
- **User**: mysql

### Tabelas Criadas
- ✅ `accounts` - Contas bancárias
- ✅ `categories` - Categorias (hierárquicas)
- ✅ `transactions` - Lançamentos financeiros
- ✅ `budget_items` - Itens do orçamento

---

## 🔒 Segurança

✅ **API Key OpenAI agora está protegida!**
- Antes: Exposta no frontend (INSEGURO)
- Agora: Protegida no backend `.env` (SEGURO)

O frontend chama `/api/ai/analyze` e o backend faz a requisição para OpenAI.

---

## ⚠️ Troubleshooting

### Erro: "Não foi possível conectar ao backend"
- ✅ Verifique se o backend está rodando
- ✅ Acesse http://localhost:3000/api/health
- ✅ Confira se a porta 3000 está livre

### Erro: "Erro ao conectar ao banco de dados"
- ✅ Verifique as credenciais no arquivo `backend/.env`
- ✅ Teste a conexão MySQL manualmente
- ✅ Verifique se o servidor MySQL está acessível

### Frontend não carrega dados
- ✅ Abra o Console (F12) e veja os erros
- ✅ Verifique se o CORS está habilitado no backend
- ✅ Confirme que `API_BASE_URL` em `js/api.js` está correto

---

## 🎯 Próximos Passos

1. ✅ Backend funcionando
2. ✅ Frontend conectado
3. ⏭️ Adicionar autenticação de usuários
4. ⏭️ Deploy em produção
5. ⏭️ App mobile

---

## 📞 Suporte

Se algo não funcionar:
1. Verifique os logs do backend no terminal
2. Abra o Console do navegador (F12) e veja os erros
3. Teste os endpoints manualmente com Postman/Insomnia

**Tudo pronto! Seu sistema está completo e funcional!** 🎉
