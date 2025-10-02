/**
 * Main Application Logic
 * Event handlers, navigation, and data management
 */

// UI Elements
const mainContent = document.querySelectorAll('.main-content');
const navLinks = document.querySelectorAll('.nav-link');
const themeToggleButton = document.getElementById('theme-toggle');
const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');

/**
 * Navigation
 */
function navigateTo(view) {
    state.currentView = view;
    mainContent.forEach(content => content.classList.remove('active'));
    document.getElementById(view).classList.add('active');
    navLinks.forEach(link => {
        if(link.dataset.view === view) {
            link.classList.add('bg-slate-100', 'dark:bg-slate-800', 'text-slate-800', 'dark:text-white', 'font-semibold');
        } else {
            link.classList.remove('bg-slate-100', 'dark:bg-slate-800', 'text-slate-800', 'dark:text-white', 'font-semibold');
        }
    });
    render();
}

/**
 * Budget Form Handler
 */
async function handleBudgetForm(e) {
    e.preventDefault();
    const id = document.getElementById('budget-id').value;
    const categoryId = document.getElementById('budget-category').value;
    const value = parseFloat(document.getElementById('budget-value').value);
    const type = document.getElementById('budget-type').value;

    try {
        if (id) {
            // Update existing budget item
            await budgetAPI.update(id, { category_id: categoryId, value, type });
            const item = state.budgetPlan.items.find(i => i.id === id);
            if (item) {
                item.categoryId = categoryId;
                item.value = value;
                item.type = type;
            }
        } else {
            if (state.budgetPlan.items.some(i => i.categoryId === categoryId)) {
                showAlert('Esta categoria já está no seu orçamento.', 'Atenção', 'warning');
                return;
            }
            // Create new budget item
            const newId = `b_${Date.now()}`;
            await budgetAPI.create({ id: newId, category_id: categoryId, value, type });
            state.budgetPlan.items.push({ id: newId, categoryId, value, type });
        }
        closeModal('budget-modal');
        render();
        showAlert('Item de orçamento salvo com sucesso!', 'Sucesso', 'success');
    } catch (error) {
        console.error('Error saving budget item:', error);
        showAlert('Erro ao salvar item de orçamento.', 'Erro', 'error');
    }
}

/**
 * Delete Budget Item
 */
async function deleteBudgetItem(id) {
    try {
        await budgetAPI.delete(id);
        state.budgetPlan.items = state.budgetPlan.items.filter(i => i.id !== id);
        render();
        showAlert('Item removido com sucesso!', 'Sucesso', 'success');
    } catch (error) {
        console.error('Error deleting budget item:', error);
        showAlert('Erro ao remover item.', 'Erro', 'error');
    }
}

/**
 * Account Form Handler
 */
async function handleAccountForm(e) {
    e.preventDefault();
    const id = document.getElementById('account-id').value;
    const name = document.getElementById('account-name').value;
    const balance = parseFloat(document.getElementById('account-balance').value);
    const icon = document.getElementById('account-icon').value;
    const color = document.getElementById('account-color').value;
    
    try {
        if(id) {
            // Update existing account
            await accountsAPI.update(id, { name, balance, icon, color });
            const account = state.accounts.find(a => a.id === id);
            if (account) {
                account.name = name;
                account.balance = balance;
                account.icon = icon;
                account.color = color;
            }
        } else {
            // Create new account
            const newId = `acc_${Date.now()}`;
            await accountsAPI.create({ id: newId, name, balance, icon, color });
            state.accounts.push({ id: newId, name, balance, icon, color });
        }
        closeModal('account-modal');
        render();
        showAlert('Conta salva com sucesso!', 'Sucesso', 'success');
    } catch (error) {
        console.error('Error saving account:', error);
        showAlert('Erro ao salvar conta. Tente novamente.', 'Erro', 'error');
    }
}

/**
 * Delete Account
 */
function deleteAccount(id) {
    showConfirm(
        'Tem certeza que deseja excluir esta conta? Todos os lançamentos associados também serão excluídos.',
        'Excluir Conta',
        async () => {
            try {
                await accountsAPI.delete(id);
                state.accounts = state.accounts.filter(a => a.id !== id);
                state.transactions = state.transactions.filter(t => t.accountId !== id);
                render();
                showAlert('Conta excluída com sucesso!', 'Sucesso', 'success');
            } catch (error) {
                console.error('Error deleting account:', error);
                showAlert('Erro ao excluir conta.', 'Erro', 'error');
            }
        },
        'danger'
    );
}

/**
 * Category Form Handler
 */
async function handleCategoryForm(e) {
    e.preventDefault();
    const id = document.getElementById('category-id').value;
    const name = document.getElementById('category-name').value;
    const parentId = document.getElementById('category-parent-id-hidden').value || null;

    try {
        if(id) {
            // Update existing category
            await categoriesAPI.update(id, { name });
            const category = state.categories.find(c => c.id === id);
            if (category) category.name = name;
        } else {
            // Create new category
            const newId = `cat_${Date.now()}`;
            await categoriesAPI.create({ id: newId, name, parent_id: parentId });
            state.categories.push({ id: newId, name, parentId });
        }
        closeModal('category-modal');
        render();
        showAlert('Categoria salva com sucesso!', 'Sucesso', 'success');
    } catch (error) {
        console.error('Error saving category:', error);
        showAlert('Erro ao salvar categoria.', 'Erro', 'error');
    }
}

/**
 * Delete Category
 */
function deleteCategory(id) {
    showConfirm(
        'Tem certeza? Todas as subcategorias também serão excluídas.',
        'Excluir Categoria',
        async () => {
            try {
                let idsToDelete = [id];
                const getDescendants = (parentId) => {
                    const children = state.categories.filter(c => c.parentId === parentId);
                    children.forEach(child => {
                        idsToDelete.push(child.id);
                        getDescendants(child.id);
                    });
                };
                getDescendants(id);

                // Delete from backend
                await categoriesAPI.delete(id);
                
                // Update local state
                state.categories = state.categories.filter(c => !idsToDelete.includes(c.id));
                state.transactions.forEach(t => { if(idsToDelete.includes(t.categoryId)) t.categoryId = null; });
                state.budgetPlan.items = state.budgetPlan.items.filter(i => !idsToDelete.includes(i.categoryId));
                render();
                showAlert('Categoria excluída com sucesso!', 'Sucesso', 'success');
            } catch (error) {
                console.error('Error deleting category:', error);
                showAlert('Erro ao excluir categoria.', 'Erro', 'error');
            }
        },
        'danger'
    );
}

/**
 * Transaction Form Handler
 */
async function handleTransactionForm(e) {
    e.preventDefault();
    const id = document.getElementById('transaction-id').value;
    const description = document.getElementById('transaction-description').value;
    const amount = parseFloat(document.getElementById('transaction-amount').value);
    const type = document.getElementById('transaction-type').value;
    const accountId = document.getElementById('transaction-account').value;
    const categoryId = document.getElementById('transaction-category').value;
    const date = document.getElementById('transaction-date').value;

    const account = state.accounts.find(a => a.id === accountId);
    if (!account) { 
        showAlert('Conta não encontrada!', 'Erro', 'error');
        return;
    }

    // Garantir que balance é número
    account.balance = parseFloat(account.balance) || 0;

    try {
        if (id) {
            // Update existing transaction
            const oldTransaction = state.transactions.find(t => t.id === id);
            if (!oldTransaction) return;
            const oldAccount = state.accounts.find(a => a.id === oldTransaction.accountId);
            
            // Revert old balance
            if(oldAccount){
                oldAccount.balance = parseFloat(oldAccount.balance) || 0;
                if(oldTransaction.type === 'income') oldAccount.balance -= oldTransaction.amount;
                else oldAccount.balance += oldTransaction.amount;
                await accountsAPI.update(oldAccount.id, { 
                    name: oldAccount.name, 
                    balance: oldAccount.balance, 
                    icon: oldAccount.icon || 'wallet', 
                    color: oldAccount.color || 'purple' 
                });
            }

            // Apply new balance
            if(type === 'income') account.balance += amount; 
            else account.balance -= amount;
            
            await transactionsAPI.update(id, { description, amount, type, account_id: accountId, category_id: categoryId, date });
            await accountsAPI.update(account.id, { 
                name: account.name, 
                balance: account.balance, 
                icon: account.icon || 'wallet', 
                color: account.color || 'purple' 
            });
            
            Object.assign(oldTransaction, { description, amount, type, accountId, categoryId, date });
        } else {
            // Create new transaction
            if(type === 'income') account.balance += amount; 
            else account.balance -= amount;
            
            const newId = `trans_${Date.now()}`;
            await transactionsAPI.create({ id: newId, description, amount, type, account_id: accountId, category_id: categoryId, date });
            await accountsAPI.update(account.id, { 
                name: account.name, 
                balance: account.balance, 
                icon: account.icon || 'wallet', 
                color: account.color || 'purple' 
            });
            
            state.transactions.push({ id: newId, description, amount, type, accountId, categoryId, date });
        }
        closeModal('transaction-modal');
        render();
        showAlert('Transação salva com sucesso!', 'Sucesso', 'success');
    } catch (error) {
        console.error('Error saving transaction:', error);
        showAlert(error.message || 'Erro ao salvar transação.', 'Erro', 'error');
    }
}

/**
 * Delete Transaction
 */
function deleteTransaction(id) {
    showConfirm(
        'Tem certeza que deseja excluir este lançamento?',
        'Excluir Lançamento',
        async () => {
            try {
                const transaction = state.transactions.find(t => t.id === id);
                if(!transaction) return;

                const account = state.accounts.find(a => a.id === transaction.accountId);
                if(account) {
                    // Revert balance
                    account.balance = parseFloat(account.balance) || 0;
                    if(transaction.type === 'income') account.balance -= transaction.amount;
                    else account.balance += transaction.amount;
                    
                    await accountsAPI.update(account.id, { 
                        name: account.name, 
                        balance: account.balance, 
                        icon: account.icon || 'wallet', 
                        color: account.color || 'purple' 
                    });
                }
                
                await transactionsAPI.delete(id);
                state.transactions = state.transactions.filter(t => t.id !== id);
                render();
                showAlert('Transação excluída com sucesso!', 'Sucesso', 'success');
            } catch (error) {
                console.error('Error deleting transaction:', error);
                showAlert('Erro ao excluir transação.', 'Erro', 'error');
            }
        },
        'danger'
    );
}

/**
 * Modal Management
 */
function openModal(modalId, options = {}) {
    const { id = null, parentId = null } = options;
    const modal = document.getElementById(modalId);
    const form = modal.querySelector('form');
    if (form) form.reset();
    
    switch(modalId) {
        case 'gemini-analysis-modal': break;
        case 'budget-modal':
             document.getElementById('budget-modal-title').textContent = id ? 'Editar Item do Orçamento' : 'Adicionar ao Orçamento';
             document.getElementById('budget-id').value = id || '';
             const budgetCategorySelect = document.getElementById('budget-category');
             let selectedBudgetId = id ? state.budgetPlan.items.find(i => i.id === id).categoryId : null;
             budgetCategorySelect.innerHTML = getCategoryOptionsHtml(selectedBudgetId);
            
             if (id) {
                 const item = state.budgetPlan.items.find(i => i.id === id);
                 if (item) {
                    document.getElementById('budget-value').value = item.value;
                    document.getElementById('budget-type').value = item.type;
                 }
             }
             break;
        case 'transaction-modal':
             document.getElementById('transaction-modal-title').textContent = id ? 'Editar Lançamento' : 'Adicionar Lançamento';
             document.getElementById('transaction-id').value = id || '';
             document.getElementById('transaction-date').valueAsDate = new Date();
             const accountSelect = document.getElementById('transaction-account');
             accountSelect.innerHTML = state.accounts.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
             const categorySelect = document.getElementById('transaction-category');
             let selectedCatId = id ? state.transactions.find(t => t.id === id).categoryId : null;
             categorySelect.innerHTML = getCategoryOptionsHtml(selectedCatId);
            
             if(id) {
                 const t = state.transactions.find(t => t.id === id);
                 if(t) {
                     document.getElementById('transaction-description').value = t.description;
                     document.getElementById('transaction-amount').value = t.amount;
                     document.getElementById('transaction-type').value = t.type;
                     accountSelect.value = t.accountId;
                     document.getElementById('transaction-date').value = t.date;
                 }
             }
             break;
        case 'transfer-modal':
             document.getElementById('transfer-date').valueAsDate = new Date();
             const fromAccountSelect = document.getElementById('transfer-from-account');
             const toAccountSelect = document.getElementById('transfer-to-account');
             const accountOptions = state.accounts.map(a => 
                 `<option value="${a.id}">${a.name} (${formatCurrency(a.balance)})</option>`
             ).join('');
             fromAccountSelect.innerHTML = accountOptions;
             toAccountSelect.innerHTML = accountOptions;
             break;
        case 'account-modal':
             document.getElementById('account-modal-title').textContent = id ? 'Editar Conta' : 'Adicionar Conta';
             document.getElementById('account-id').value = id || '';
             document.getElementById('account-balance').disabled = !!id;
             if(id) {
                 const acc = state.accounts.find(a => a.id === id);
                 if(acc) {
                     document.getElementById('account-name').value = acc.name;
                     document.getElementById('account-balance').value = acc.balance;
                 }
             }
             break;
        case 'category-modal':
             const parentCategoryDisplayWrapper = document.getElementById('parent-category-display-wrapper');
             document.getElementById('category-id').value = id || '';
             document.getElementById('category-parent-id-hidden').value = parentId || '';
             
             if (id) {
                const cat = state.categories.find(c => c.id === id);
                document.getElementById('category-modal-title').textContent = 'Editar Categoria';
                document.getElementById('category-name').value = cat.name;
                const parent = state.categories.find(p => p.id === cat.parentId);
                document.getElementById('parent-category-display').textContent = parent ? parent.name : 'Nenhuma (Categoria Principal)';
                parentCategoryDisplayWrapper.style.display = 'block';
             } else if (parentId) {
                const parent = state.categories.find(c => c.id === parentId);
                document.getElementById('category-modal-title').textContent = `Adicionar Subcategoria para "${parent.name}"`;
                document.getElementById('parent-category-display').textContent = parent.name;
                parentCategoryDisplayWrapper.style.display = 'block';
             } else {
                document.getElementById('category-modal-title').textContent = 'Adicionar Categoria Principal';
                parentCategoryDisplayWrapper.style.display = 'none';
             }
            break;
    }
    modal.classList.add('active');
}

function closeModal(modalId) { 
    document.getElementById(modalId).classList.remove('active'); 
}

/**
 * Theme Management
 */
function updateThemeIcons(isDark) {
    themeToggleDarkIcon.classList.toggle('hidden', !isDark);
    themeToggleLightIcon.classList.toggle('hidden', isDark);
}

/**
 * Setup Event Listeners
 */
function setupEventListeners() {
    navLinks.forEach(link => link.addEventListener('click', (e) => { e.preventDefault(); navigateTo(link.dataset.view); }));
    
    themeToggleButton.addEventListener('click', () => {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        updateThemeIcons(isDark);
        render(); // Re-render to update chart colors
    });

    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    // Generic modal buttons
    document.getElementById('alert-ok-btn').addEventListener('click', () => closeModal('alert-modal'));
    document.getElementById('confirm-cancel-btn').addEventListener('click', () => closeModal('confirm-modal'));

    document.getElementById('gemini-analysis-btn').addEventListener('click', getFinancialAnalysis);
    document.getElementById('cancel-gemini-analysis').addEventListener('click', () => closeModal('gemini-analysis-modal'));
    
    document.getElementById('add-budget-item-btn').addEventListener('click', () => {
        if (state.categories.length === 0) { 
            showAlert('Por favor, crie uma categoria primeiro.', 'Atenção', 'warning');
            return;
        }
        openModal('budget-modal');
    });
    document.getElementById('cancel-budget').addEventListener('click', () => closeModal('budget-modal'));
    document.getElementById('budget-form').addEventListener('submit', handleBudgetForm);
    document.getElementById('budget-list').addEventListener('click', e => {
        if(e.target.classList.contains('edit-budget-item-btn')) openModal('budget-modal', {id: e.target.dataset.id});
        if(e.target.classList.contains('delete-budget-item-btn')) deleteBudgetItem(e.target.dataset.id);
    });
    
    document.getElementById('add-transaction-btn').addEventListener('click', () => {
        if(state.accounts.length === 0 || state.categories.length === 0){ 
            showAlert('Por favor, adicione pelo menos uma conta e uma categoria antes de criar um lançamento.', 'Atenção', 'warning');
            return;
        }
        openModal('transaction-modal');
    });
    document.getElementById('cancel-transaction').addEventListener('click', () => closeModal('transaction-modal'));
    document.getElementById('transaction-form').addEventListener('submit', handleTransactionForm);
    document.getElementById('transactions-list').addEventListener('click', e => {
        if(e.target.classList.contains('edit-transaction-btn')) openModal('transaction-modal', {id: e.target.dataset.id});
        if(e.target.classList.contains('delete-transaction-btn')) deleteTransaction(e.target.dataset.id);
        if(e.target.classList.contains('delete-transfer-btn')) deleteTransfer(e.target.dataset.id);
    });
    
    // Transfer modal listeners
    document.getElementById('add-transfer-btn').addEventListener('click', () => {
        if(state.accounts.length < 2){
            showAlert('Você precisa de pelo menos 2 contas para fazer uma transferência.', 'Atenção', 'warning');
            return;
        }
        document.getElementById('transfer-form').reset();
        document.getElementById('transfer-date').valueAsDate = new Date();
        openModal('transfer-modal');
    });
    document.getElementById('cancel-transfer').addEventListener('click', () => closeModal('transfer-modal'));
    document.getElementById('transfer-form').addEventListener('submit', handleTransferForm);
    
    document.getElementById('add-account-btn').addEventListener('click', () => openModal('account-modal'));
    document.getElementById('cancel-account').addEventListener('click', () => closeModal('account-modal'));
    document.getElementById('account-form').addEventListener('submit', handleAccountForm);
    document.getElementById('accounts-list').addEventListener('click', e => {
        if(e.target.classList.contains('edit-account-btn')) openModal('account-modal', {id: e.target.dataset.id});
        if(e.target.classList.contains('delete-account-btn')) deleteAccount(e.target.dataset.id);
    });

    document.getElementById('add-main-category-btn').addEventListener('click', () => openModal('category-modal'));
    document.getElementById('cancel-category').addEventListener('click', () => closeModal('category-modal'));
    document.getElementById('category-form').addEventListener('submit', handleCategoryForm);
    document.getElementById('categories-list').addEventListener('click', e => {
        if(e.target.classList.contains('edit-category-btn')) openModal('category-modal', {id: e.target.dataset.id});
        if(e.target.classList.contains('delete-category-btn')) deleteCategory(e.target.dataset.id);
        if(e.target.classList.contains('add-subcategory-btn')) openModal('category-modal', {parentId: e.target.dataset.parentId});
    });
}

/**
 * Check if user is authenticated
 */
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
        // Redirect to login page
        window.location.href = 'login.html';
        return false;
    }
    
    return true;
}

/**
 * Load user info and display in sidebar
 */
function loadUserInfo() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    
    try {
        const user = JSON.parse(userStr);
        
        // Update user name
        const userNameEl = document.getElementById('user-name');
        if (userNameEl) {
            userNameEl.textContent = user.name + (user.lastname ? ' ' + user.lastname : '');
        }
        
        // Update tenant name
        const tenantNameEl = document.getElementById('tenant-name');
        if (tenantNameEl && user.tenantName) {
            tenantNameEl.textContent = user.tenantName;
        }
        
        // Update initials
        const initialsEl = document.getElementById('user-initials');
        if (initialsEl && user.name) {
            const initials = user.name.charAt(0).toUpperCase() + 
                           (user.lastname ? user.lastname.charAt(0).toUpperCase() : '');
            initialsEl.textContent = initials;
        }
    } catch (error) {
        console.error('Error loading user info:', error);
    }
}

/**
 * Transfer Form Handler
 */
async function handleTransferForm(e) {
    e.preventDefault();
    const description = document.getElementById('transfer-description').value;
    const amount = parseFloat(document.getElementById('transfer-amount').value);
    const fromAccountId = document.getElementById('transfer-from-account').value;
    const toAccountId = document.getElementById('transfer-to-account').value;
    const date = document.getElementById('transfer-date').value;

    if (fromAccountId === toAccountId) {
        showAlert('Não é possível transferir para a mesma conta!', 'Erro', 'error');
        return;
    }

    const fromAccount = state.accounts.find(a => a.id === fromAccountId);
    const toAccount = state.accounts.find(a => a.id === toAccountId);
    
    if (!fromAccount || !toAccount) {
        showAlert('Contas não encontradas!', 'Erro', 'error');
        return;
    }

    try {
        const newId = `transfer_${Date.now()}`;
        await transfersAPI.create({ 
            id: newId, 
            description, 
            amount, 
            from_account_id: fromAccountId, 
            to_account_id: toAccountId, 
            date 
        });
        
        // Update local state balances
        fromAccount.balance -= amount;
        toAccount.balance += amount;
        state.transfers.push({ id: newId, description, amount, fromAccountId, toAccountId, date });
        
        closeModal('transfer-modal');
        render();
        showAlert('Transferência realizada com sucesso!', 'Sucesso', 'success');
    } catch (error) {
        console.error('Error creating transfer:', error);
        showAlert(error.message || 'Erro ao realizar transferência.', 'Erro', 'error');
    }
}

/**
 * Delete Transfer
 */
function deleteTransfer(id) {
    showConfirm(
        'Tem certeza que deseja excluir esta transferência? Os saldos das contas serão revertidos.',
        'Excluir Transferência',
        async () => {
            try {
                await transfersAPI.delete(id);
                state.transfers = state.transfers.filter(t => t.id !== id);
                
                // Reload accounts to get updated balances
                const accounts = await accountsAPI.getAll();
                state.accounts = accounts;
                
                render();
                showAlert('Transferência excluída com sucesso!', 'Sucesso', 'success');
            } catch (error) {
                console.error('Error deleting transfer:', error);
                showAlert('Erro ao excluir transferência.', 'Erro', 'error');
            }
        },
        'danger'
    );
}

/**
 * Custom Alert Modal
 */
function showAlert(message, title = 'Atenção', type = 'info') {
    const modal = document.getElementById('alert-modal');
    const iconDiv = document.getElementById('alert-icon');
    const titleEl = document.getElementById('alert-title');
    const messageEl = document.getElementById('alert-message');
    
    titleEl.textContent = title;
    messageEl.textContent = message;
    
    // Set icon based on type
    const icons = {
        info: {
            bg: 'bg-blue-100 dark:bg-blue-900/30',
            svg: '<svg class="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
        },
        warning: {
            bg: 'bg-yellow-100 dark:bg-yellow-900/30',
            svg: '<svg class="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>'
        },
        error: {
            bg: 'bg-red-100 dark:bg-red-900/30',
            svg: '<svg class="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>'
        },
        success: {
            bg: 'bg-green-100 dark:bg-green-900/30',
            svg: '<svg class="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>'
        }
    };
    
    const icon = icons[type] || icons.info;
    iconDiv.className = `flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full ${icon.bg}`;
    iconDiv.innerHTML = icon.svg;
    
    openModal('alert-modal');
}

/**
 * Custom Confirm Modal
 */
function showConfirm(message, title = 'Confirmar', onConfirm, type = 'warning') {
    const modal = document.getElementById('confirm-modal');
    const iconDiv = document.getElementById('confirm-icon');
    const titleEl = document.getElementById('confirm-title');
    const messageEl = document.getElementById('confirm-message');
    const confirmBtn = document.getElementById('confirm-ok-btn');
    
    titleEl.textContent = title;
    messageEl.textContent = message;
    
    // Set icon and button color based on type
    const styles = {
        warning: {
            bg: 'bg-yellow-100 dark:bg-yellow-900/30',
            svg: '<svg class="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>',
            btnClass: 'bg-yellow-600 hover:bg-yellow-700'
        },
        danger: {
            bg: 'bg-red-100 dark:bg-red-900/30',
            svg: '<svg class="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>',
            btnClass: 'bg-red-600 hover:bg-red-700'
        },
        info: {
            bg: 'bg-blue-100 dark:bg-blue-900/30',
            svg: '<svg class="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
            btnClass: 'bg-blue-600 hover:bg-blue-700'
        }
    };
    
    const style = styles[type] || styles.warning;
    iconDiv.className = `flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full ${style.bg}`;
    iconDiv.innerHTML = style.svg;
    confirmBtn.className = `flex-1 px-5 py-3 rounded-lg text-white transition-colors font-medium shadow-lg ${style.btnClass}`;
    
    // Remove old event listeners and add new one
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    
    newConfirmBtn.addEventListener('click', () => {
        closeModal('confirm-modal');
        if (onConfirm) onConfirm();
    });
    
    openModal('confirm-modal');
}

/**
 * Logout function
 */
function logout() {
    showConfirm(
        'Tem certeza que deseja sair do sistema?',
        'Confirmar Saída',
        () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        },
        'danger'
    );
}

/**
 * Initialize Application
 */
async function init() {
    // Check authentication
    if (!checkAuth()) {
        return;
    }
    
    // Load user info
    loadUserInfo();
    
    // Theme setup
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        updateThemeIcons(true);
    } else {
        document.documentElement.classList.remove('dark');
        updateThemeIcons(false);
    }
    
    setupEventListeners();
    
    // Try to load from backend, fallback to mock data
    await loadDataFromBackend();
    
    navigateTo('dashboard');
}

document.addEventListener('DOMContentLoaded', init);
