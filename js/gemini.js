/**
 * AI API Integration
 * Handles financial analysis requests through backend proxy
 */

/**
 * Get financial analysis from AI API (via backend)
 */
async function getFinancialAnalysis() {
    const loader = document.getElementById('gemini-analysis-loader');
    const contentDiv = document.getElementById('gemini-analysis-content');
    
    openModal('gemini-analysis-modal');
    loader.style.display = 'flex';
    contentDiv.style.display = 'none';

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const monthTransactions = state.transactions.filter(t => new Date(t.date) >= startOfMonth && new Date(t.date) <= endOfMonth);
    const totalIncome = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    
    const expensesByCategory = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
            const category = state.categories.find(c => c.id === t.categoryId);
            let parent = category;
            while (parent && parent.parentId) {
                parent = state.categories.find(c => c.id === parent.parentId);
            }
            const categoryName = parent?.name || category?.name || 'Sem Categoria';
            if (!acc[categoryName]) { acc[categoryName] = 0; }
            acc[categoryName] += t.amount;
            return acc;
        }, {});

    let expensesSummary = Object.entries(expensesByCategory).map(([name, amount]) => `${name}: ${formatCurrency(amount)}`).join('\n');
    const systemPrompt = `Você é um consultor financeiro amigável e prestativo. Analise os seguintes dados financeiros de um usuário para o mês atual. Forneça um resumo claro, aponte áreas onde ele está gastando mais, e ofereça 2-3 dicas práticas e acionáveis para economizar ou melhorar a gestão financeira. Seja encorajador e evite linguagem de julgamento. Responda em markdown simples (use # para títulos, * para listas e ** para negrito).`;
    const userQuery = `Olá! Por favor, analise minhas finanças para este mês.\n- Renda Total do Mês: ${formatCurrency(totalIncome)}\n- Despesas Totais do Mês: ${formatCurrency(totalExpenses)}\n- Resumo de Gastos por Categoria:\n${expensesSummary}`;

    try {
        // Use backend proxy for security (API key hidden in backend)
        const result = await aiAPI.analyze(systemPrompt, userQuery);
        const analysisText = result.analysis;

        contentDiv.innerHTML = analysisText ? simpleMarkdownToHtml(analysisText) : `<p class="text-red-500">Não foi possível obter uma análise. A resposta da API estava vazia.</p>`;
    } catch (error) {
        console.error("Error calling AI API:", error);
        contentDiv.innerHTML = `<p class="text-red-500">Ocorreu um erro ao tentar analisar suas finanças. Por favor, tente novamente mais tarde. Erro: ${error.message}</p>`;
    } finally {
        loader.style.display = 'none';
        contentDiv.style.display = 'block';
    }
}

/**
 * Simple Markdown to HTML converter
 */
function simpleMarkdownToHtml(md) {
    return md
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(?! \*)(.*?)\*/g, '<em>$1</em>')
        .replace(/^\* (.*$)/gim, '<ul><li>$1</li></ul>')
        .replace(/<\/ul>\s?<ul>/g, '')
        .replace(/\n/g, '<br>');
}
