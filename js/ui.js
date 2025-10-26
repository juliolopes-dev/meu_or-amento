/**
 * UI Rendering Functions
 * Handles all DOM rendering and chart visualizations
 */

/**
 * Main render function - delegates to specific view renderers
 */
function render() {
    // Update chart global colors based on theme
    const isDarkMode = document.documentElement.classList.contains('dark');
    Chart.defaults.color = isDarkMode ? '#94a3b8' : '#64748b';
    Chart.defaults.borderColor = isDarkMode ? '#334155' : '#e2e8f0';

    switch(state.currentView) {
        case 'dashboard':
            renderDashboard();
            break;
        case 'budget':
            renderBudget();
            break;
        case 'transactions':
            renderTransactions();
            break;
        case 'accounts':
            renderAccounts();
            break;
        case 'categories':
            renderCategories();
            break;
        case 'payables':
            renderPayables();
            break;
    }
}

/**
 * Render Dashboard view
 */
function renderDashboard() {
    const summaryCardsContent = document.getElementById('dashboard-summary-cards');
    const progressSection = document.getElementById('dashboard-progress-section');
    if (!state.accounts.length) {
         const dashboardEl = document.getElementById('dashboard');
         dashboardEl.innerHTML = `<h2 class="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-8">Dashboard</h2> <p class="text-center col-span-full text-slate-500">Adicione sua primeira conta para começar.</p>`;
        return;
    }

    const totalBalance = state.accounts.reduce((sum, acc) => sum + (parseFloat(acc.balance) || 0), 0);

    const fallbackDate = new Date();
    const selected = state.selectedMonth || { year: fallbackDate.getFullYear(), month: fallbackDate.getMonth() + 1 };
    const selectedDate = new Date(selected.year, (selected.month || 1) - 1, 1);
    const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
    const capitalize = (value) => value.charAt(0).toUpperCase() + value.slice(1);
    const monthName = capitalize(selectedDate.toLocaleDateString('pt-BR', { month: 'long' }));
    const monthLabel = capitalize(selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }));

    const monthTransactions = state.transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate >= startOfMonth && tDate <= endOfMonth;
    });
    const monthPendingPayables = state.payables.filter(p => {
        if (p.status !== 'pending' || !p.dueDate) return false;
        const due = new Date(`${p.dueDate}T00:00:00`);
        return due.getFullYear() === selectedDate.getFullYear() && due.getMonth() === selectedDate.getMonth();
    });
    const monthPendingAmount = monthPendingPayables.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    
    const totalIncome = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate savings rate
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

    const categoryChartTitle = document.getElementById('category-chart-title');
    if (categoryChartTitle) {
        categoryChartTitle.textContent = `Despesas por Categoria (${monthLabel})`;
    }
    const incomeExpenseChartTitle = document.getElementById('income-expense-chart-title');
    if (incomeExpenseChartTitle) {
        incomeExpenseChartTitle.textContent = `Receitas vs Despesas (Últimos 6 meses até ${monthName})`;
    }

    const payablesCardHtml = monthPendingPayables.length ? `
        <div class="bg-gradient-to-br from-rose-500 via-rose-400 to-amber-300 text-white p-4 rounded-lg shadow-sm relative overflow-hidden">
            <div class="absolute inset-0 bg-white/10 blur-3xl opacity-30 pointer-events-none"></div>
            <h3 class="text-sm font-medium mb-1">Contas a pagar (${monthName})</h3>
            <p class="text-2xl font-bold">${formatCurrency(monthPendingAmount)}</p>
            <p class="text-xs opacity-80 mt-1">${monthPendingPayables.length} ${monthPendingPayables.length === 1 ? 'conta' : 'contas'}</p>
        </div>` : '';

    summaryCardsContent.innerHTML = `
        ${payablesCardHtml}
        <div class="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
            <h3 class="text-sm text-slate-500 dark:text-slate-400 mb-1">Saldo Total</h3>
            <p class="text-2xl font-bold text-slate-800 dark:text-slate-100">${formatCurrency(totalBalance)}</p>
        </div>
        <div class="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
            <h3 class="text-sm text-slate-500 dark:text-slate-400 mb-1">Receitas (${monthName})</h3>
            <p class="text-2xl font-bold text-green-500">${formatCurrency(totalIncome)}</p>
        </div>
        <div class="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
            <h3 class="text-sm text-slate-500 dark:text-slate-400 mb-1">Despesas (${monthName})</h3>
            <p class="text-2xl font-bold text-red-500">${formatCurrency(totalExpenses)}</p>
        </div>
        <div class="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
            <h3 class="text-sm text-slate-500 dark:text-slate-400 mb-1">Balanço (${monthName})</h3>
            <p class="text-2xl font-bold ${totalIncome - totalExpenses >= 0 ? 'text-green-500' : 'text-red-500'}">${formatCurrency(totalIncome - totalExpenses)}</p>
        </div>
        <div class="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm flex flex-col">
            <h3 class="text-sm text-slate-500 dark:text-slate-400 mb-1">Taxa de Poupança</h3>
            <p class="text-2xl font-bold ${savingsRate >= 0 ? 'text-green-500' : 'text-red-500'}">${savingsRate.toFixed(1)}%</p>
            <p class="text-xs text-slate-500 mt-1">${totalIncome > 0 ? `referente a ${monthName}` : 'sem receitas'}</p>
        </div>
    `;
    
    const totalPlanned = state.budgetPlan.items.reduce((sum, item) => {
        const plannedAmount = item.type === 'fixed' ? item.value : totalIncome * (item.value / 100);
        return sum + plannedAmount;
    }, 0);
    
    const budgetProgressPercentage = totalPlanned > 0 ? (totalExpenses / totalPlanned) * 100 : 0;
    const budgetProgressColor = budgetProgressPercentage > 90 ? 'bg-red-500' : budgetProgressPercentage > 70 ? 'bg-yellow-500' : 'bg-slate-700';

    // Render accounts card
    const colorClasses = {
        purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
        blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
        green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
        pink: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
        orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
        indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
        emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
        amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
        teal: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400',
        cyan: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400'
    };

    progressSection.innerHTML = `
        <div class="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold text-slate-700 dark:text-slate-300">Minhas Contas</h3>
                <span class="text-sm text-slate-500 dark:text-slate-400">${state.accounts.length} ${state.accounts.length === 1 ? 'conta' : 'contas'}</span>
            </div>
            <div class="space-y-3">
                ${state.accounts.map(account => {
                    const icon = account.icon || 'wallet';
                    const color = account.color || 'purple';
                    const balance = parseFloat(account.balance) || 0;
                    return `
                        <div class="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                            <div class="flex-shrink-0 w-12 h-12 ${colorClasses[color]} rounded-xl flex items-center justify-center shadow-sm">
                                <i data-lucide="${icon}" class="w-6 h-6"></i>
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="font-semibold text-slate-800 dark:text-slate-100 truncate">${account.name}</p>
                                <p class="text-sm text-slate-500 dark:text-slate-400">Saldo disponível</p>
                            </div>
                            <div class="text-right">
                                <p class="font-bold text-lg ${balance >= 0 ? 'text-slate-800 dark:text-slate-100' : 'text-red-500'}">${formatCurrency(balance)}</p>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
        <div class="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
            <h3 class="text-lg font-semibold mb-4 text-slate-700 dark:text-slate-300">Progresso do Orçamento Mensal</h3>
            <div class="flex justify-between items-center text-sm text-slate-600 dark:text-slate-400 mb-1">
                <span>Gasto: ${formatCurrency(totalExpenses)}</span>
                <span>Planejado: ${formatCurrency(totalPlanned)}</span>
            </div>
            <div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4">
                <div class="${budgetProgressColor} h-4 rounded-full text-white text-xs flex items-center justify-center" style="width: ${Math.min(budgetProgressPercentage, 100)}%">
                   ${budgetProgressPercentage > 10 ? budgetProgressPercentage.toFixed(0) + '%' : ''}
                </div>
            </div>
            <p class="text-xs text-center mt-2 text-slate-500">${ totalPlanned > 0 ? (budgetProgressPercentage > 100 ? `Você ultrapassou seu orçamento em ${formatCurrency(totalExpenses - totalPlanned)}!` : `Você ainda tem ${formatCurrency(totalPlanned - totalExpenses)} para gastar.`) : 'Defina um orçamento para começar.'}</p>
        </div>
    `;
    
    // Re-initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    renderCategoryPieChart(monthTransactions);
    renderIncomeExpenseChart(selectedDate);
}

/**
 * Render category pie chart
 */
function renderCategoryPieChart(monthTransactions) {
    const chartContainer = document.getElementById('pie-chart-container');
    chartContainer.innerHTML = '<canvas id="category-pie-chart"></canvas>';
    const ctx = document.getElementById('category-pie-chart').getContext('2d');
    
    const expensesByCategory = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
            const key = t.categoryId || 'uncategorized';
            if (!acc[key]) {
                const category = state.categories.find(c => c.id === t.categoryId);
                acc[key] = {
                    label: category?.name || 'Sem Categoria',
                    total: 0
                };
            }
            acc[key].total += t.amount;
            return acc;
        }, {});

    const categoryKeys = Object.keys(expensesByCategory);
    const labels = categoryKeys.map(key => expensesByCategory[key].label);
    const data = categoryKeys.map(key => expensesByCategory[key].total);
    
    if (charts.categoryPie) charts.categoryPie.destroy();
    const pieCanvas = document.getElementById('category-pie-chart');
    pieCanvas.onclick = null;

    if(data.length === 0){
        chartContainer.innerHTML = `<div class="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">Sem despesas para exibir.</div>`;
        charts.categoryPieMetadata = null;
        return;
    }

    charts.categoryPie = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: 'Despesas por Categoria',
                data: data,
                backgroundColor: ['#334155', '#10B981', '#F59E0B', '#EF4444', '#64748b', '#0ea5e9', '#ec4899'],
                hoverOffset: 4,
                borderColor: document.documentElement.classList.contains('dark') ? '#1e293b' : '#fff',
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } } }
    });

    charts.categoryPieMetadata = {
        categoryKeys,
        monthTransactions
    };

    pieCanvas.onclick = (event) => {
        if (!charts.categoryPie) return;
        const points = charts.categoryPie.getElementsAtEventForMode(event, 'nearest', { intersect: true }, true);
        if (!points.length) return;
        const { index } = points[0];
        const categoryKey = charts.categoryPieMetadata?.categoryKeys?.[index];
        if (typeof categoryKey === 'undefined') {
            return;
        }
        const categoryLabel = labels[index];
        handleCategoryExpensesClick(categoryKey, categoryLabel, charts.categoryPieMetadata.monthTransactions);
    };
}

/**
 * Render income vs expense chart
 */
function renderIncomeExpenseChart(referenceDate = new Date()) {
    const chartContainer = document.getElementById('bar-chart-container');
    chartContainer.innerHTML = '<canvas id="income-expense-chart"></canvas>';
    const ctx = document.getElementById('income-expense-chart').getContext('2d');

    const labels = [];
    const incomeData = [];
    const expenseData = [];

    const baseDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
    for (let i = 5; i >= 0; i--) {
        const date = new Date(baseDate.getFullYear(), baseDate.getMonth() - i, 1);
        labels.push(date.toLocaleString('pt-BR', { month: 'short', year: '2-digit' }));
        
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        const monthTransactions = state.transactions.filter(t => new Date(t.date) >= startOfMonth && new Date(t.date) <= endOfMonth);
        const monthIncome = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const monthExpense = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

        incomeData.push(monthIncome);
        expenseData.push(monthExpense);
    }
    
    if (charts.incomeExpense) charts.incomeExpense.destroy();
    if (!incomeData.some(d => d > 0) && !expenseData.some(d => d > 0)) {
        chartContainer.innerHTML = `<div class="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">Sem dados históricos para exibir.</div>`;
        return;
    }

    charts.incomeExpense = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                { label: 'Receitas', data: incomeData, backgroundColor: '#10B981', borderRadius: 4 },
                { label: 'Despesas', data: expenseData, backgroundColor: '#EF4444', borderRadius: 4 }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
    });
}

/**
 * Handle click on category pie chart to show expense details
 */
function handleCategoryExpensesClick(categoryKey, categoryLabel, monthTransactions = []) {
    const titleEl = document.getElementById('category-expenses-title');
    if (titleEl) {
        titleEl.textContent = `Gastos - ${categoryLabel}`;
    }

    let relevantCategoryIds = [];
    if (categoryKey === 'uncategorized') {
        relevantCategoryIds = [null];
    } else {
        relevantCategoryIds = [categoryKey, ...getSubCategoryIds(categoryKey)];
    }

    const expenses = monthTransactions.filter(t => {
        if (t.type !== 'expense') return false;
        if (categoryKey === 'uncategorized') {
            return !t.categoryId;
        }
        return relevantCategoryIds.includes(t.categoryId);
    });

    const totalAmount = expenses.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    const subtitleEl = document.getElementById('category-expenses-subtitle');
    if (subtitleEl) {
        const countLabel = expenses.length === 1 ? 'lançamento' : 'lançamentos';
        subtitleEl.textContent = `${expenses.length} ${countLabel} - Total ${formatCurrency(totalAmount)}`;
    }

    const contentEl = document.getElementById('category-expenses-content');
    if (contentEl) {
        if (!expenses.length) {
            contentEl.innerHTML = `<p class="text-center text-slate-500 dark:text-slate-400 py-6">Nenhuma despesa encontrada para esta categoria.</p>`;
        } else {
            contentEl.innerHTML = expenses.map(t => {
                const account = state.accounts.find(a => a.id === t.accountId);
                const dateStr = new Date(t.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
                return `
                    <div class="border border-slate-200 dark:border-slate-700 rounded-lg p-4 flex justify-between items-start gap-4">
                        <div>
                            <p class="text-sm font-semibold text-slate-700 dark:text-slate-200">${t.description}</p>
                            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">${dateStr} - ${account?.name || 'Conta não informada'}</p>
                        </div>
                        <span class="text-sm font-bold text-red-500">${formatCurrency(t.amount)}</span>
                    </div>
                `;
            }).join('');
        }
    }

    openModal('category-expenses-modal');
}

/**
 * Render Budget view
 */
function renderBudget() {
    const summaryDiv = document.getElementById('budget-summary');
    const listDiv = document.getElementById('budget-list');

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const monthTransactions = state.transactions.filter(t => new Date(t.date) >= startOfMonth && new Date(t.date) <= endOfMonth);
    const totalIncomeThisMonth = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalPlanned = state.budgetPlan.items.reduce((sum, item) => (item.type === 'fixed' ? item.value : totalIncomeThisMonth * (item.value / 100)) + sum, 0);
    const totalSpent = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    summaryDiv.innerHTML = `
        <div class="grid grid-cols-3 gap-6 text-center">
            <div>
                <h4 class="text-slate-500 dark:text-slate-400">Receitas do Mês (Real)</h4>
                <p class="text-2xl font-bold text-green-500">${formatCurrency(totalIncomeThisMonth)}</p>
            </div>
            <div>
                <h4 class="text-slate-500 dark:text-slate-400">Total Orçado (Despesas)</h4>
                <p class="text-2xl font-bold text-slate-800 dark:text-slate-200">${formatCurrency(totalPlanned)}</p>
            </div>
            <div>
                <h4 class="text-slate-500 dark:text-slate-400">Total Gasto</h4>
                <p class="text-2xl font-bold text-red-500">${formatCurrency(totalSpent)}</p>
            </div>
        </div>
    `;
    
    if (!state.budgetPlan.items.length) {
        listDiv.innerHTML = `<p class="text-center py-10 text-slate-500 dark:text-slate-400">Nenhum item no orçamento. Adicione um para começar a planejar.</p>`;
        return;
    }

    listDiv.innerHTML = state.budgetPlan.items.map(item => {
        const category = state.categories.find(c => c.id === item.categoryId);
        const relevantCategoryIds = [item.categoryId, ...getSubCategoryIds(item.categoryId)];
        const spent = monthTransactions.filter(t => relevantCategoryIds.includes(t.categoryId) && t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const plannedAmount = item.type === 'fixed' ? item.value : totalIncomeThisMonth * (item.value / 100);
        const displayValue = item.type === 'fixed' ? formatCurrency(item.value) : `${item.value}%`;
        const percentage = plannedAmount > 0 ? (spent / plannedAmount) * 100 : 0;
        const progressBarColor = percentage > 90 ? 'bg-red-500' : percentage > 70 ? 'bg-yellow-500' : 'bg-slate-700';

        return `
            <div class="p-4 border-b border-slate-200 dark:border-slate-700">
                <div class="flex justify-between items-center mb-2">
                    <div class="flex items-center">
                        <span class="font-semibold text-slate-700 dark:text-slate-300">${category ? category.name : 'Sem Categoria'}</span>
                        <span class="text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full px-2 py-1 ml-3">${displayValue}</span>
                    </div>
                    <div>
                        <button data-id="${item.id}" class="edit-budget-item-btn text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-sm">Editar</button>
                        <button data-id="${item.id}" class="delete-budget-item-btn text-red-500 hover:text-red-700 text-sm ml-2">Excluir</button>
                    </div>
                </div>
                <div class="flex justify-between items-center text-sm text-slate-600 dark:text-slate-400">
                    <span>${formatCurrency(spent)}</span>
                    <span>${formatCurrency(plannedAmount)}</span>
                </div>
                <div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 mt-1">
                    <div class="${progressBarColor} h-2.5 rounded-full" style="width: ${Math.min(percentage, 100)}%"></div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Render Transactions view
 */
function renderTransactions() {
    const list = document.getElementById('transactions-list');
    
    // Combine transactions and transfers
    const sortedTransactions = [...state.transactions].sort((a,b) => new Date(b.date) - new Date(a.date));
    const sortedTransfers = [...state.transfers].sort((a,b) => new Date(b.date) - new Date(a.date));
    
    // Merge and sort all items
    const allItems = [...sortedTransactions, ...sortedTransfers].sort((a,b) => new Date(b.date) - new Date(a.date));

    if (!allItems.length) {
        list.innerHTML = `<p class="text-center py-10 text-slate-500 dark:text-slate-400">Nenhum lançamento encontrado.</p>`;
        return;
    }
    
    list.innerHTML = `
        <table class="w-full text-left">
            <thead class="bg-slate-50 dark:bg-slate-900">
                <tr class="border-b border-slate-200 dark:border-slate-700">
                    <th class="p-3 text-sm font-semibold text-slate-600 dark:text-slate-400">Data</th>
                    <th class="p-3 text-sm font-semibold text-slate-600 dark:text-slate-400">Descrição</th>
                    <th class="p-3 text-sm font-semibold text-slate-600 dark:text-slate-400">Categoria/Origem</th>
                    <th class="p-3 text-sm font-semibold text-slate-600 dark:text-slate-400">Conta/Destino</th>
                    <th class="p-3 text-sm font-semibold text-slate-600 dark:text-slate-400 text-right">Valor</th>
                    <th class="p-3 text-sm font-semibold text-slate-600 dark:text-slate-400 text-center">Ações</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
                ${allItems.map(item => {
                    // Check if it's a transfer
                    if (item.fromAccountId && item.toAccountId) {
                        const fromAccount = state.accounts.find(a => a.id === item.fromAccountId);
                        const toAccount = state.accounts.find(a => a.id === item.toAccountId);
                        return `
                            <tr class="bg-purple-50/50 dark:bg-purple-900/10">
                                <td class="p-3 text-sm text-slate-500 dark:text-slate-400">${new Date(item.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
                                <td class="p-3 font-medium text-slate-700 dark:text-slate-300">
                                    <i data-lucide="arrow-left-right" class="w-4 h-4 inline text-purple-600"></i>
                                    ${item.description}
                                </td>
                                <td class="p-3 text-sm text-slate-600 dark:text-slate-400">${fromAccount?.name || 'N/A'}</td>
                                <td class="p-3 text-sm text-slate-600 dark:text-slate-400">${toAccount?.name || 'N/A'}</td>
                                <td class="p-3 text-right font-medium text-purple-600 dark:text-purple-400">${formatCurrency(item.amount)}</td>
                                <td class="p-3 text-center">
                                    <button data-id="${item.id}" class="delete-transfer-btn text-red-500 hover:text-red-700">Excluir</button>
                                </td>
                            </tr>
                        `;
                    } else {
                        // Regular transaction
                        const account = state.accounts.find(a => a.id === item.accountId);
                        const category = state.categories.find(c => c.id === item.categoryId);
                        let categoryName = 'N/A';
                        if (category) {
                            const parent = state.categories.find(p => p.id === category.parentId);
                            categoryName = parent ? `<span class="text-slate-400">${parent.name} /</span> ${category.name}` : category.name;
                        }
                        return `
                            <tr>
                                <td class="p-3 text-sm text-slate-500 dark:text-slate-400">${new Date(item.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
                                <td class="p-3 font-medium text-slate-700 dark:text-slate-300">${item.description}</td>
                                <td class="p-3 text-sm text-slate-600 dark:text-slate-400">${categoryName}</td>
                                <td class="p-3 text-sm text-slate-500 dark:text-slate-400">${account?.name || 'N/A'}</td>
                                <td class="p-3 text-right font-medium ${item.type === 'income' ? 'text-green-500' : 'text-red-500'}">${formatCurrency(item.amount)}</td>
                                <td class="p-3 text-center">
                                    <button data-id="${item.id}" class="edit-transaction-btn text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Editar</button>
                                    <button data-id="${item.id}" class="delete-transaction-btn text-red-500 hover:text-red-700 ml-2">Excluir</button>
                                </td>
                            </tr>
                        `;
                    }
                }).join('')}
            </tbody>
        </table>
    `;
    
    // Re-initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/**
 * Render Accounts view
 */
function renderAccounts() {
    const list = document.getElementById('accounts-list');
    if(!state.accounts.length) {
        list.innerHTML = `<p class="text-center col-span-full text-slate-500 dark:text-slate-400">Nenhuma conta encontrada.</p>`;
        return;
    }

    list.innerHTML = state.accounts.map(account => {
        const icon = account.icon || 'wallet';
        const color = account.color || 'purple';
        const colorClasses = {
            purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
            blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
            green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
            pink: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
            orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
            indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
            emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
            amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
            teal: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400',
            cyan: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400'
        };
        
        return `
        <div class="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all border border-slate-100 dark:border-slate-700">
            <div class="flex items-start gap-4">
                <div class="flex-shrink-0 w-14 h-14 ${colorClasses[color]} rounded-2xl flex items-center justify-center shadow-md">
                    <i data-lucide="${icon}" class="w-7 h-7"></i>
                </div>
                <div class="flex-1">
                    <h4 class="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">${account.name}</h4>
                    <p class="text-3xl font-bold text-slate-900 dark:text-white">${formatCurrency(account.balance)}</p>
                </div>
                <div class="flex gap-2">
                    <button data-id="${account.id}" class="edit-account-btn p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700 rounded-lg transition-all">
                        <i data-lucide="edit-3" class="w-4 h-4"></i>
                    </button>
                    <button data-id="${account.id}" class="delete-account-btn p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
        </div>
    `}).join('');
    
    // Re-initialize Lucide icons after rendering
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/**
 * Render Categories view
 */
function renderCategories() {
    const list = document.getElementById('categories-list');
    if(!state.categories.length) {
        list.innerHTML = `<p class="text-center py-10 text-slate-500 dark:text-slate-400">Nenhuma categoria encontrada.</p>`;
        return;
    }

    const categoriesHtml = (parentId = null, level = 0) => {
        return state.categories
            .filter(c => c.parentId === parentId)
            .sort((a,b) => a.name.localeCompare(b.name))
            .map(cat => {
                const marginLeft = level * 24;
                return `
                    <div class="border-b border-slate-200 dark:border-slate-700">
                        <div class="flex justify-between items-center p-3" style="margin-left: ${marginLeft}px;">
                            <span class="font-medium text-slate-700 dark:text-slate-300">${cat.name}</span>
                            <div class="text-center">
                                <button data-parent-id="${cat.id}" class="add-subcategory-btn text-green-500 hover:text-green-700 text-sm font-bold">+ Sub</button>
                                <button data-id="${cat.id}" class="edit-category-btn text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-sm ml-4">Editar</button>
                                <button data-id="${cat.id}" class="delete-category-btn text-red-500 hover:text-red-700 text-sm ml-2">Excluir</button>
                            </div>
                        </div>
                    </div>
                    ${categoriesHtml(cat.id, level + 1)}
                `;
            }).join('');
    };

    list.innerHTML = `
        <div class="font-semibold p-3 border-b border-slate-300 dark:border-slate-600 flex justify-between bg-slate-50 dark:bg-slate-900 rounded-t-lg text-sm text-slate-600 dark:text-slate-400">
            <span>Nome da Categoria</span>
            <span>Ações</span>
        </div>
        ${categoriesHtml()}
    `;
}

/**
 * Render Payables view
 */
function renderPayables() {
    const summaryEl = document.getElementById('payables-summary');
    const listEl = document.getElementById('payables-list');
    if (!summaryEl || !listEl) {
        return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pending = state.payables.filter(p => p.status === 'pending');
    const totalPendingAmount = pending.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    const overdue = pending.filter(p => {
        if (!p.dueDate) return false;
        const due = new Date(`${p.dueDate}T00:00:00`);
        return due < today;
    });
    const totalOverdueAmount = overdue.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

    const selected = state.selectedMonth || { year: today.getFullYear(), month: today.getMonth() + 1 };
    const paidThisMonth = state.payables.filter(p => {
        if (p.status !== 'paid' || !p.paidAt) return false;
        const paidDate = new Date(p.paidAt);
        return paidDate.getFullYear() === selected.year && (paidDate.getMonth() + 1) === selected.month;
    });
    const totalPaidAmount = paidThisMonth.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

    summaryEl.innerHTML = `
        <div class="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
            <h3 class="text-sm text-slate-500 dark:text-slate-400 mb-1">Contas pendentes</h3>
            <p class="text-2xl font-bold text-slate-800 dark:text-slate-100">${pending.length}</p>
            <p class="text-xs text-slate-500 dark:text-slate-400">${formatCurrency(totalPendingAmount)}</p>
        </div>
        <div class="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
            <h3 class="text-sm text-slate-500 dark:text-slate-400 mb-1">Atrasadas</h3>
            <p class="text-2xl font-bold ${overdue.length ? 'text-red-500' : 'text-slate-800 dark:text-slate-100'}">${overdue.length}</p>
            <p class="text-xs text-slate-500 dark:text-slate-400">${formatCurrency(totalOverdueAmount)}</p>
        </div>
        <div class="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
            <h3 class="text-sm text-slate-500 dark:text-slate-400 mb-1">Pagas no mês</h3>
            <p class="text-2xl font-bold text-green-500">${paidThisMonth.length}</p>
            <p class="text-xs text-slate-500 dark:text-slate-400">${formatCurrency(totalPaidAmount)}</p>
        </div>
    `;

    if (!state.payables.length) {
        listEl.innerHTML = `<p class="text-center py-10 text-slate-500 dark:text-slate-400">Nenhuma conta a pagar cadastrada.</p>`;
        return;
    }

    const sorted = [...state.payables].sort((a, b) => {
        if (a.status !== b.status) {
            return a.status === 'pending' ? -1 : 1;
        }
        const dateA = a.dueDate ? new Date(`${a.dueDate}T00:00:00`) : new Date(8640000000000000);
        const dateB = b.dueDate ? new Date(`${b.dueDate}T00:00:00`) : new Date(8640000000000000);
        return dateA - dateB;
    });

    const rows = sorted.map(payable => {
        const dueDate = payable.dueDate ? new Date(`${payable.dueDate}T00:00:00`) : null;
        const dueLabel = dueDate ? dueDate.toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '--';
        const isOverdue = payable.status === 'pending' && dueDate && dueDate < today;
        const rowClass = isOverdue ? 'bg-red-50 dark:bg-red-900/20' : '';
        const statusBadge = payable.status === 'pending'
            ? '<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300">Pendente</span>'
            : '<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">Pago</span>';
        const installmentBadge = payable.isRecurring
            ? (payable.totalInstallments
                ? `${payable.currentInstallment || 1}/${payable.totalInstallments}`
                : (payable.currentInstallment ? `${payable.currentInstallment}` : ''))
            : '';
        const typeLabel = payable.isRecurring
            ? `<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">Fixa${installmentBadge ? ` (${installmentBadge})` : ''}</span>`
            : '<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300">Simples</span>';
        const categoryName = payable.categoryName || (state.categories.find(c => c.id === payable.categoryId)?.name) || 'Sem categoria';
        const accountName = payable.paidAccountId ? (state.accounts.find(a => a.id === payable.paidAccountId)?.name || '') : '';
        const paidInfo = payable.status === 'paid' && payable.paidAt
            ? `Pago em ${new Date(payable.paidAt).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}${accountName ? ` - ${accountName}` : ''}`
            : '';
        const editButton = `<button data-action="edit" data-id="${payable.id}" class="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100">Editar</button>`;
        const deleteButton = `<button data-action="delete" data-id="${payable.id}" class="text-sm text-red-600 hover:text-red-700">Excluir</button>`;
        const actions = payable.status === 'pending'
            ? `<div class="flex gap-3 flex-wrap">
                    <button data-action="pay" data-id="${payable.id}" class="text-sm font-semibold text-green-600 hover:text-green-700">Pagar</button>
                    ${editButton}
                    ${deleteButton}
                </div>`
            : `<div class="flex gap-3 flex-wrap items-center">
                    ${editButton}
                    ${paidInfo ? `<span class="text-xs text-slate-500 dark:text-slate-400">${paidInfo}</span>` : ''}
                </div>`;

        const notesHtml = payable.notes
            ? `<p class="text-xs text-slate-500 dark:text-slate-400 mt-1">${payable.notes}</p>`
            : '';

        return `
            <tr class="${rowClass}">
                <td class="p-3 text-sm text-slate-500 dark:text-slate-400">${dueLabel}</td>
                <td class="p-3">
                    <div class="flex flex-col">
                        <span class="font-semibold text-slate-700 dark:text-slate-200">${payable.description}</span>
                        ${notesHtml}
                    </div>
                </td>
                <td class="p-3 text-sm text-slate-600 dark:text-slate-300">${categoryName}</td>
                <td class="p-3 text-sm text-slate-600 dark:text-slate-300">${typeLabel}</td>
                <td class="p-3 text-right font-semibold text-slate-800 dark:text-slate-100">${formatCurrency(payable.amount)}</td>
                <td class="p-3 text-sm">${statusBadge}</td>
                <td class="p-3 text-sm text-slate-600 dark:text-slate-300">${actions}</td>
            </tr>
        `;
    }).join('');

    listEl.innerHTML = `
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead class="bg-slate-50 dark:bg-slate-900">
                    <tr>
                        <th class="p-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Vencimento</th>
                        <th class="p-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Descrição</th>
                        <th class="p-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Categoria</th>
                        <th class="p-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Tipo</th>
                        <th class="p-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Valor</th>
                        <th class="p-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Status</th>
                        <th class="p-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Ações</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
                    ${rows}
                </tbody>
            </table>
        </div>
    `;

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/**
 * Get category options HTML for select dropdowns
 */
function getCategoryOptionsHtml(selectedId = null) {
    let html = '<option value="">Selecione...</option>';
    const buildOptions = (parentId = null, prefix = '') => {
        state.categories.filter(c => c.parentId === parentId).sort((a,b) => a.name.localeCompare(b.name)).forEach(cat => {
            html += `<option value="${cat.id}" ${selectedId === cat.id ? 'selected' : ''}>${prefix}${cat.name}</option>`;
            buildOptions(cat.id, prefix + '— ');
        });
    };
    buildOptions();
    return html;
}
