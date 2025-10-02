/**
 * API Communication Module
 * Handles all backend API calls
 */

// Use environment variable or default to localhost
const API_BASE_URL = window.API_URL || 'http://localhost:3000/api';

// Generic fetch wrapper with error handling
async function apiFetch(endpoint, options = {}) {
    try {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                ...options.headers
            },
            ...options
        });

        if (!response.ok) {
            // If unauthorized, redirect to login
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = 'login.html';
                return;
            }
            
            const error = await response.json();
            throw new Error(error.error || 'Erro na requisição');
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Accounts API
const accountsAPI = {
    getAll: () => apiFetch('/accounts'),
    getById: (id) => apiFetch(`/accounts/${id}`),
    create: (data) => apiFetch('/accounts', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiFetch(`/accounts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiFetch(`/accounts/${id}`, { method: 'DELETE' })
};

// Categories API
const categoriesAPI = {
    getAll: () => apiFetch('/categories'),
    getById: (id) => apiFetch(`/categories/${id}`),
    create: (data) => apiFetch('/categories', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiFetch(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiFetch(`/categories/${id}`, { method: 'DELETE' })
};

// Transactions API
const transactionsAPI = {
    getAll: () => apiFetch('/transactions'),
    getById: (id) => apiFetch(`/transactions/${id}`),
    create: (data) => apiFetch('/transactions', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiFetch(`/transactions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiFetch(`/transactions/${id}`, { method: 'DELETE' })
};

// Budget API
const budgetAPI = {
    getAll: () => apiFetch('/budget'),
    getById: (id) => apiFetch(`/budget/${id}`),
    create: (data) => apiFetch('/budget', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiFetch(`/budget/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiFetch(`/budget/${id}`, { method: 'DELETE' })
};

// Transfers API
const transfersAPI = {
    getAll: () => apiFetch('/transfers'),
    getById: (id) => apiFetch(`/transfers/${id}`),
    create: (data) => apiFetch('/transfers', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id) => apiFetch(`/transfers/${id}`, { method: 'DELETE' })
};

// AI Analysis API
const aiAPI = {
    analyze: (systemPrompt, userQuery) => apiFetch('/ai/analyze', {
        method: 'POST',
        body: JSON.stringify({ systemPrompt, userQuery })
    })
};

// Load all data from backend
async function loadDataFromBackend() {
    try {
        const [accounts, categories, transactions, budgetItems, transfers] = await Promise.all([
            accountsAPI.getAll(),
            categoriesAPI.getAll(),
            transactionsAPI.getAll(),
            budgetAPI.getAll(),
            transfersAPI.getAll()
        ]);

        state.accounts = accounts.map(a => ({
            id: a.id,
            name: a.name,
            balance: parseFloat(a.balance) || 0,
            icon: a.icon || 'wallet',
            color: a.color || 'purple'
        }));
        state.categories = categories.map(c => ({
            id: c.id,
            name: c.name,
            parentId: c.parent_id
        }));
        state.transactions = transactions.map(t => ({
            id: t.id,
            description: t.description,
            amount: parseFloat(t.amount),
            type: t.type,
            accountId: t.account_id,
            categoryId: t.category_id,
            date: t.date
        }));
        state.transfers = transfers.map(t => ({
            id: t.id,
            description: t.description,
            amount: parseFloat(t.amount),
            fromAccountId: t.from_account_id,
            toAccountId: t.to_account_id,
            date: t.date
        }));
        state.budgetPlan.items = budgetItems.map(item => ({
            id: item.id,
            categoryId: item.category_id,
            value: parseFloat(item.value),
            type: item.type
        }));

        console.log('✅ Dados carregados do backend:', state);
    } catch (error) {
        console.error('❌ Erro ao carregar dados do backend:', error);
        if (typeof showAlert === 'function') {
            showAlert('Não foi possível conectar ao backend. Usando dados de exemplo.', 'Aviso', 'warning');
        }
        loadMockData();
    }
}
