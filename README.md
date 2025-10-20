# 💰 Meu Orçamento

Sistema completo de gestão financeira pessoal e multi-tenant desenvolvido com HTML, CSS, JavaScript (vanilla) no frontend e Node.js + MySQL no backend.

## ✨ Features

- 🔐 **Multi-Tenancy**: Autenticação JWT com isolamento por organização
- 💳 **Contas**: Gerenciamento com ícones personalizados (10 opções coloridas)
- 📊 **Transações**: Receitas e despesas com atualização automática de saldos
- 🔄 **Transferências**: Entre contas com validação
- 🏷️ **Categorias**: Principais e subcategorias hierárquicas
- 📈 **Dashboard**: Cards informativos, gráficos e análises
- 💾 **Orçamento**:Planejamento mensal
- 🌙 **Dark Mode**: Interface adaptável
- 📱 **Responsivo**: Mobile, tablet e desktop

### 📊 **Dashboard Interativo**

- **Cards de resumo**: Saldo total, receitas, despesas e balanço mensal
- **Progresso do orçamento**: Barra visual comparando gasto x planejado
- **Taxa de poupança**: Percentual de economia em relação à renda
- **Gráfico de pizza**: Despesas por categoria (mês atual)
- **Gráfico de barras**: Receitas vs despesas (últimos 6 meses)

### 💰 **Gestão de Orçamento**

- Definir limites por categoria (valor fixo ou percentual da renda)
- Acompanhamento de progresso em tempo real
- Comparação entre planejado e gasto
- Alertas visuais quando ultrapassar 70% e 90% do orçamento

### 📝 **Lançamentos Financeiros**

- Adicionar receitas e despesas
- Vincular a contas e categorias
- Edição e exclusão com atualização automática de saldos
- Listagem ordenada por data

### 💳 **Gerenciamento de Contas**

- Criar múltiplas contas (banco, carteira, etc.)
- Saldo atualizado automaticamente com transações
- Editar e excluir com segurança

### 🏷️ **Categorias Hierárquicas**

- Categorias principais e subcategorias
- Estrutura aninhada ilimitada
- Exclusão em cascata
- Organização visual com indentação

### ✨ **Análise Financeira com IA (Google Gemini)**

- Análise personalizada dos dados financeiros
- Identificação de gastos excessivos
- Dicas práticas de economia
- Sistema de retry automático

### 🌓 **Tema Dark/Light**

- Alternância manual entre temas
- Detecção automática da preferência do sistema
- Persistência no localStorage
- Gráficos adaptados ao tema

---

## 🚀 Como Usar

### **1. Instalação**

Não requer instalação! É uma aplicação 100% frontend.

```bash
# Clone ou baixe o projeto
git clone seu-repositorio-aqui

# Abra o arquivo index.html em um navegador
```

### **2. Configurar API do Gemini (Opcional)**

Para usar a análise financeira com IA:

1. Obtenha uma API key em: [https://ai.google.dev](https://ai.google.dev)
2. Abra o arquivo `js/gemini.js`
3. Insira sua chave na linha 43:

```javascript
const apiKey = "SUA_API_KEY_AQUI";
```

### **3. Começar a Usar**

1. **Crie uma conta** (ex: "Banco Principal", "Carteira")
2. **Adicione categorias** (ex: "Moradia", "Alimentação")
3. **Lance transações** (receitas e despesas)
4. **Defina seu orçamento** mensal
5. **Acompanhe no dashboard** seus progressos
6. **Use o botão "Analisar Finanças"** para obter insights da IA

---

## 📁 Estrutura do Projeto

```
meu_orçamento/
├── index.html          # Estrutura HTML da aplicação
├── css/
│   └── styles.css      # Estilos customizados
├── js/
│   ├── state.js        # Gerenciamento de estado e dados
│   ├── ui.js           # Funções de renderização
│   ├── app.js          # Lógica principal e event listeners
│   └── gemini.js       # Integração com API Gemini
└── README.md           # Esta documentação
```

---

## 🛠️ Tecnologias

| Tecnologia                  | Uso                        |
| --------------------------- | -------------------------- |
| **HTML5**             | Estrutura semântica       |
| **Tailwind CSS**      | Framework CSS utilitário  |
| **JavaScript ES6+**   | Lógica da aplicação     |
| **Chart.js**          | Gráficos interativos      |
| **Google Gemini API** | Análise financeira com IA |
| **LocalStorage**      | Persistência de tema      |

---

## 💡 Dados de Demonstração

A aplicação vem com dados de exemplo para você explorar:

- 2 contas (Carteira, Banco Principal)
- 7 categorias hierárquicas
- 14 transações (mês atual + 5 meses anteriores)
- 3 itens de orçamento

---

## 🎨 Capturas de Tela

### Dashboard

- 4 cards de resumo financeiro
- 2 gráficos interativos
- Barra de progresso do orçamento
- Taxa de poupança em destaque

### Orçamento

- Lista de itens do orçamento
- Progresso visual de cada categoria
- Comparação gasto x planejado

### Lançamentos

- Tabela completa de transações
- Filtros por categoria e conta
- Cores diferenciadas (verde=receita, vermelho=despesa)

---

## 📝 Notas Técnicas

### **Armazenamento**

- Dados armazenados em memória (não persistem após reload)
- Tema persiste no localStorage
- Para persistência real, integre com backend/LocalStorage

### **API Gemini**

- Requer conexão com internet
- Chave de API necessária
- Sistema de retry com backoff exponencial
- Formato de resposta: Markdown simplificado

### **Compatibilidade**

- Navegadores modernos (Chrome, Firefox, Edge, Safari)
- Requer suporte a ES6+
- Responsivo para mobile/tablet/desktop

---

## 🔒 Segurança

⚠️ **IMPORTANTE**:

- Nunca exponha sua API Key em produção
- Para uso real, implemente um backend proxy
- Considere variáveis de ambiente
- Esta é uma versão de demonstração/estudo

---

## 🤝 Contribuindo

Sinta-se livre para:

- Reportar bugs
- Sugerir melhorias
- Fazer fork do projeto
- Enviar pull requests

---

## 📄 Licença

Este projeto é livre para uso pessoal e educacional.

---

## 👨‍💻 Autor

Desenvolvido com ❤️ como projeto de estudo de frontend e integração com IA.

---

## 🔮 Melhorias Futuras

- [ ] Persistência de dados com LocalStorage/IndexedDB
- [ ] Exportação de relatórios em PDF
- [ ] Gráficos adicionais (linha, radar)
- [ ] Filtros avançados de transações
- [ ] Multi-moeda
- [ ] Backup/restauração de dados
- [ ] PWA (Progressive Web App)
- [ ] Integração com bancos (Open Banking)
