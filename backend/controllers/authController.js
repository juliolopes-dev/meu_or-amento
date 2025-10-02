const db = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register new user and tenant
exports.register = async (req, res) => {
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();

        const { name, lastname, tenantName, email, password } = req.body;

        // Validate required fields
        if (!name || !tenantName || !email || !password) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
        }

        // Validate password length
        if (password.length < 8) {
            return res.status(400).json({ error: 'A senha deve ter no mínimo 8 caracteres' });
        }

        // Create tenant slug
        const tenantSlug = tenantName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const tenantId = `tenant_${Date.now()}`;

        // Check if tenant already exists
        const [existingTenant] = await connection.query(
            'SELECT id FROM tenants WHERE slug = ?', 
            [tenantSlug]
        );

        if (existingTenant.length > 0) {
            await connection.rollback();
            return res.status(400).json({ error: 'Uma organização com este nome já existe' });
        }

        // Create tenant
        await connection.query(
            'INSERT INTO tenants (id, name, slug) VALUES (?, ?, ?)',
            [tenantId, tenantName, tenantSlug]
        );

        // Check if email already exists for this tenant
        const [existingUser] = await connection.query(
            'SELECT id FROM users WHERE tenant_id = ? AND email = ?',
            [tenantId, email]
        );

        if (existingUser.length > 0) {
            await connection.rollback();
            return res.status(400).json({ error: 'Este e-mail já está cadastrado' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user (admin role for first user)
        const userId = `user_${Date.now()}`;
        await connection.query(
            'INSERT INTO users (id, tenant_id, email, password_hash, name, lastname, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId, tenantId, email, passwordHash, name, lastname || '', 'admin']
        );

        await connection.commit();

        res.status(201).json({
            message: 'Conta criada com sucesso',
            user: { id: userId, name, email, tenantId, tenantName }
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error in register:', error);
        res.status(500).json({ error: 'Erro ao criar conta' });
    } finally {
        connection.release();
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
        }

        // Find user by email
        const [users] = await db.query(
            `SELECT u.*, t.name as tenant_name, t.slug as tenant_slug 
             FROM users u 
             JOIN tenants t ON u.tenant_id = t.id 
             WHERE u.email = ?`,
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'E-mail ou senha incorretos' });
        }

        const user = users[0];

        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'E-mail ou senha incorretos' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user.id, 
                tenantId: user.tenant_id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                lastname: user.lastname,
                email: user.email,
                role: user.role,
                tenantId: user.tenant_id,
                tenantName: user.tenant_name,
                tenantSlug: user.tenant_slug
            }
        });

    } catch (error) {
        console.error('Error in login:', error);
        res.status(500).json({ error: 'Erro ao fazer login' });
    }
};

// Get current user
exports.me = async (req, res) => {
    try {
        const [users] = await db.query(
            `SELECT u.id, u.name, u.lastname, u.email, u.role, u.tenant_id, t.name as tenant_name, t.slug as tenant_slug
             FROM users u
             JOIN tenants t ON u.tenant_id = t.id
             WHERE u.id = ?`,
            [req.user.userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        res.json(users[0]);
    } catch (error) {
        console.error('Error in me:', error);
        res.status(500).json({ error: 'Erro ao buscar usuário' });
    }
};
