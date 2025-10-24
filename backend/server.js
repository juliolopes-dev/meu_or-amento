const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Custom CORS middleware (must be FIRST)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/auth');
const accountRoutes = require('./routes/accounts');
const categoryRoutes = require('./routes/categories');
const transactionRoutes = require('./routes/transactions');
const budgetRoutes = require('./routes/budget');
const transferRoutes = require('./routes/transfers');
const aiRoutes = require('./routes/ai');
const payableRoutes = require('./routes/payables');

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes (require authentication)
app.use('/api/accounts', accountRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/payables', payableRoutes);
app.use('/api/ai', aiRoutes);

// Health check (simples e rápido)
app.get('/api/health', (req, res) => {
    res.status(200).send('OK');
});

// Health check detalhado
app.get('/api/status', (req, res) => {
    res.json({ status: 'OK', message: 'Backend está funcionando!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Rota não encontrada' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Erro interno do servidor' });
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📍 http://localhost:${PORT}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/health\n`);
});
