/**
 * State Management
 * Manages global application state and mock data
 */

// Global State
const currentDate = new Date();

let state = {
    accounts: [],
    categories: [],
    transactions: [],
    transfers: [],
    payables: [],
    budgetPlan: {
        items: []
    },
    currentView: 'dashboard',
    selectedMonth: {
        year: currentDate.getFullYear(),
        month: currentDate.getMonth() + 1
    }
};

let charts = {}; // To hold chart instances

/**
 * Load mock data for demonstration
 */
function loadMockData() {
    const now = new Date();
    
    state.accounts = [
        { id: 'acc_1', name: 'Carteira', balance: 150.75, icon: 'wallet', color: 'purple' },
        { id: 'acc_2', name: 'Banco Principal', balance: 2249.50, icon: 'landmark', color: 'blue' }
    ];
    
    state.categories = [
        { id: 'cat_root_1', name: 'Custo de Vida', parentId: null },
        { id: 'cat_1', name: 'Moradia', parentId: 'cat_root_1' },
        { id: 'cat_5', name: 'Mercado', parentId: 'cat_root_1' },
        { id: 'cat_2', name: 'Alimentação', parentId: null },
        { id: 'cat_3', name: 'Transporte', parentId: null },
        { id: 'cat_4', name: 'Salário', parentId: null },
        { id: 'cat_6', name: 'Lazer', parentId: null }
    ];
    
    state.transactions = [
        // Current Month
        { id: 'trans_1', description: 'Aluguel', amount: 1200.00, type: 'expense', accountId: 'acc_2', categoryId: 'cat_1', date: new Date(now.getFullYear(), now.getMonth(), 5).toISOString().split('T')[0] },
        { id: 'trans_2', description: 'Salário', amount: 5000.00, type: 'income', accountId: 'acc_2', categoryId: 'cat_4', date: new Date(now.getFullYear(), now.getMonth(), 5).toISOString().split('T')[0] },
        { id: 'trans_3', description: 'Compras do mês', amount: 350.50, type: 'expense', accountId: 'acc_2', categoryId: 'cat_5', date: new Date(now.getFullYear(), now.getMonth(), 7).toISOString().split('T')[0] },
        { id: 'trans_4', description: 'Restaurante', amount: 120.00, type: 'expense', accountId: 'acc_1', categoryId: 'cat_2', date: new Date(now.getFullYear(), now.getMonth(), 10).toISOString().split('T')[0] },
        { id: 'trans_5', description: 'Cinema', amount: 60.00, type: 'expense', accountId: 'acc_1', categoryId: 'cat_6', date: new Date(now.getFullYear(), now.getMonth(), 12).toISOString().split('T')[0] },
        
        // Last 5 months for the chart
        { id: 'trans_10', description: 'Salário', amount: 4800.00, type: 'income', accountId: 'acc_2', categoryId: 'cat_4', date: new Date(now.getFullYear(), now.getMonth() - 1, 5).toISOString().split('T')[0]},
        { id: 'trans_11', description: 'Gastos Gerais', amount: 3200.00, type: 'expense', accountId: 'acc_2', categoryId: 'cat_root_1', date: new Date(now.getFullYear(), now.getMonth() - 1, 15).toISOString().split('T')[0]},
        { id: 'trans_12', description: 'Salário', amount: 4800.00, type: 'income', accountId: 'acc_2', categoryId: 'cat_4', date: new Date(now.getFullYear(), now.getMonth() - 2, 5).toISOString().split('T')[0]},
        { id: 'trans_13', description: 'Gastos Gerais', amount: 3500.00, type: 'expense', accountId: 'acc_2', categoryId: 'cat_root_1', date: new Date(now.getFullYear(), now.getMonth() - 2, 15).toISOString().split('T')[0]},
        { id: 'trans_14', description: 'Salário', amount: 4700.00, type: 'income', accountId: 'acc_2', categoryId: 'cat_4', date: new Date(now.getFullYear(), now.getMonth() - 3, 5).toISOString().split('T')[0]},
        { id: 'trans_15', description: 'Gastos Gerais', amount: 3100.00, type: 'expense', accountId: 'acc_2', categoryId: 'cat_root_1', date: new Date(now.getFullYear(), now.getMonth() - 3, 15).toISOString().split('T')[0]},
        { id: 'trans_16', description: 'Salário', amount: 4700.00, type: 'income', accountId: 'acc_2', categoryId: 'cat_4', date: new Date(now.getFullYear(), now.getMonth() - 4, 5).toISOString().split('T')[0]},
        { id: 'trans_17', description: 'Gastos Gerais', amount: 3300.00, type: 'expense', accountId: 'acc_2', categoryId: 'cat_root_1', date: new Date(now.getFullYear(), now.getMonth() - 4, 15).toISOString().split('T')[0]},
        { id: 'trans_18', description: 'Salário', amount: 4600.00, type: 'income', accountId: 'acc_2', categoryId: 'cat_4', date: new Date(now.getFullYear(), now.getMonth() - 5, 5).toISOString().split('T')[0]},
        { id: 'trans_19', description: 'Gastos Gerais', amount: 3400.00, type: 'expense', accountId: 'acc_2', categoryId: 'cat_root_1', date: new Date(now.getFullYear(), now.getMonth() - 5, 15).toISOString().split('T')[0]},
    ];
    
    state.budgetPlan = {
        items: [
            { id: 'b_1', categoryId: 'cat_root_1', type: 'percentage', value: 70 },
            { id: 'b_2', categoryId: 'cat_2', type: 'fixed', value: 400.00 },
            { id: 'b_3', categoryId: 'cat_3', type: 'percentage', value: 10 }
        ]
    };

    state.payables = [
        {
            id: 'pay_1',
            description: 'Aluguel',
            amount: 1200.00,
            dueDate: new Date(now.getFullYear(), now.getMonth(), 5).toISOString().split('T')[0],
            categoryId: 'cat_1',
            categoryName: 'Moradia',
            status: 'pending',
            isRecurring: true,
            notes: 'Debitar todo dia 05'
        },
        {
            id: 'pay_2',
            description: 'Academia',
            amount: 99.90,
            dueDate: new Date(now.getFullYear(), now.getMonth(), 12).toISOString().split('T')[0],
            categoryId: 'cat_6',
            categoryName: 'Lazer',
            status: 'pending',
            isRecurring: true
        },
        {
            id: 'pay_3',
            description: 'Cartão de Crédito',
            amount: 850.35,
            dueDate: new Date(now.getFullYear(), now.getMonth(), 20).toISOString().split('T')[0],
            categoryId: 'cat_root_1',
            categoryName: 'Custo de Vida',
            status: 'paid',
            isRecurring: true,
            paidAt: new Date(now.getFullYear(), now.getMonth(), 18).toISOString(),
            paidAccountId: 'acc_2'
        }
    ];
}

/**
 * Helper function to get all child category IDs for a given parent ID
 */
function getSubCategoryIds(parentId) {
    let ids = [];
    const children = state.categories.filter(c => c.parentId === parentId);
    children.forEach(child => {
        ids.push(child.id);
        ids = ids.concat(getSubCategoryIds(child.id));
    });
    return ids;
}

/**
 * Format currency helper
 */
const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};
