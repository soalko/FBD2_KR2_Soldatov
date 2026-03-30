const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const authMiddleware = require('./middleware/authMiddleware');
const roleMiddleware = require('./middleware/roleMiddleware');

const app = express();
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3001',
    credentials: true
}));

const PORT = 3000;

// Секреты подписи
const ACCESS_SECRET = 'access_secret_key_2025';
const REFRESH_SECRET = 'refresh_secret_key_2025';

// Время жизни токенов
const ACCESS_EXPIRES_IN = '15m';
const REFRESH_EXPIRES_IN = '7d';

// Хранилища (имитация базы данных)
const users = [];
const refreshTokens = new Set();
let products = [];
let nextProductId = 1;
let nextUserId = 1;

// Swagger configuration
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'E-commerce API',
            version: '1.0.0',
            description: 'API for product management with RBAC'
        },
        servers: [{ url: `http://localhost:${PORT}` }],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        security: [{ bearerAuth: [] }]
    },
    apis: ['./server.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Вспомогательные функции
function generateAccessToken(user) {
    return jwt.sign(
        {
            sub: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        },
        ACCESS_SECRET,
        { expiresIn: ACCESS_EXPIRES_IN }
    );
}

function generateRefreshToken(user) {
    return jwt.sign(
        {
            sub: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        },
        REFRESH_SECRET,
        { expiresIn: REFRESH_EXPIRES_IN }
    );
}

async function hashPassword(password) {
    const rounds = 10;
    return bcrypt.hash(password, rounds);
}

async function verifyPassword(password, passwordHash) {
    return bcrypt.compare(password, passwordHash);
}

// Инициализация тестовых данных
// backend/server.js - замените тестовые товары
async function initTestData() {
    // Создание администратора
    const adminPasswordHash = await hashPassword('admin');
    users.push({
        id: String(nextUserId++),
        username: 'admin',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        passwordHash: adminPasswordHash,
        role: 'admin',
        isActive: true
    });

    // Создание продавца
    const sellerPasswordHash = await hashPassword('seller');
    users.push({
        id: String(nextUserId++),
        username: 'seller',
        email: 'seller@example.com',
        firstName: 'Seller',
        lastName: 'User',
        passwordHash: sellerPasswordHash,
        role: 'seller',
        isActive: true
    });

    // Создание обычного пользователя
    const userPasswordHash = await hashPassword('user');
    users.push({
        id: String(nextUserId++),
        username: 'user',
        email: 'user@example.com',
        firstName: 'Regular',
        lastName: 'User',
        passwordHash: userPasswordHash,
        role: 'user',
        isActive: true
    });


    products = [
        {
            id: String(nextProductId++),
            title: 'Toyota Camry',
            category: 'Седан',
            description: 'Надежный седан бизнес-класса. 2.5 л, АКПП, передний привод. Год выпуска: 2023.',
            price: 35000,
            image: 'https://via.placeholder.com/200x200?text=Toyota+Camry',
            inStock: true
        },
        {
            id: String(nextProductId++),
            title: 'Hyundai Solaris',
            category: 'Седан',
            description: 'Компактный городской автомобиль. 1.6 л, 6-ступенчатая механика. Отличное состояние.',
            price: 15000,
            image: 'https://via.placeholder.com/200x200?text=Hyundai+Solaris',
            inStock: true
        },
        {
            id: String(nextProductId++),
            title: 'Kia Sportage',
            category: 'Кроссовер',
            description: 'Популярный городской кроссовер. 2.0 л, полный привод, климат-контроль.',
            price: 28000,
            image: 'https://via.placeholder.com/200x200?text=Kia+Sportage',
            inStock: true
        },
        {
            id: String(nextProductId++),
            title: 'BMW X5',
            category: 'Внедорожник',
            description: 'Премиальный внедорожник. 3.0 л, турбодизель, полный привод, кожаный салон.',
            price: 68000,
            image: 'https://via.placeholder.com/200x200?text=BMW+X5',
            inStock: false
        },
        {
            id: String(nextProductId++),
            title: 'Lada Granta',
            category: 'Седан',
            description: 'Бюджетный отечественный автомобиль. 1.6 л, МКПП, кондиционер.',
            price: 8500,
            image: 'https://via.placeholder.com/200x200?text=Lada+Granta',
            inStock: true
        },
        {
            id: String(nextProductId++),
            title: 'Volkswagen Tiguan',
            category: 'Кроссовер',
            description: 'Немецкий кроссовер с турбированным двигателем. 1.4 л, DSG, полный привод.',
            price: 32000,
            image: 'https://via.placeholder.com/200x200?text=VW+Tiguan',
            inStock: true
        },
        {
            id: String(nextProductId++),
            title: 'Mercedes-Benz E-Class',
            category: 'Бизнес-седан',
            description: 'Престижный автомобиль E-класса. 2.0 л, 9G-Tronic, подогрев всех сидений.',
            price: 55000,
            image: 'https://via.placeholder.com/200x200?text=Mercedes+E-Class',
            inStock: true
        },
        {
            id: String(nextProductId++),
            title: 'Ford Focus',
            category: 'Хэтчбек',
            description: 'Маневренный хэтчбек с богатой комплектацией. 1.6 л, АКПП.',
            price: 12000,
            image: 'https://via.placeholder.com/200x200?text=Ford+Focus',
            inStock: true
        }
    ];
}

// ==================== AUTH ROUTES ====================

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Регистрация пользователя
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Пользователь создан
 *       400:
 *         description: Ошибка валидации
 */
app.post('/api/auth/register', async (req, res) => {
    const { username, email, password, firstName, lastName } = req.body;

    if (!username || !email || !password || !firstName || !lastName) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = users.find(u => u.username === username || u.email === email);
    if (existingUser) {
        return res.status(400).json({ error: 'Username or email already exists' });
    }

    const passwordHash = await hashPassword(password);

    const user = {
        id: String(nextUserId++),
        username,
        email,
        firstName,
        lastName,
        passwordHash,
        role: 'user',
        isActive: true
    };

    users.push(user);

    res.status(201).json({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
    });
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Вход в систему
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Успешный вход
 */
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'username and password are required' });
    }

    const user = users.find(u => u.username === username);
    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
        return res.status(403).json({ error: 'Account is blocked' });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    refreshTokens.add(refreshToken);

    res.json({
        accessToken,
        refreshToken,
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
        }
    });
});

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Обновление токенов
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Новые токены
 */
app.post('/api/auth/refresh', (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ error: 'refreshToken is required' });
    }

    if (!refreshTokens.has(refreshToken)) {
        return res.status(401).json({ error: 'Invalid refresh token' });
    }

    try {
        const payload = jwt.verify(refreshToken, REFRESH_SECRET);
        const user = users.find(u => u.id === payload.sub);

        if (!user || !user.isActive) {
            return res.status(401).json({ error: 'User not found or blocked' });
        }

        refreshTokens.delete(refreshToken);
        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);
        refreshTokens.add(newRefreshToken);

        res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        });
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Получение текущего пользователя
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Информация о пользователе
 */
app.get('/api/auth/me', authMiddleware, (req, res) => {
    const userId = req.user.sub;
    const user = users.find(u => u.id === userId);

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
    });
});

// ==================== USER ROUTES (Admin only) ====================

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Получить список пользователей (только админ)
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Список пользователей
 */
app.get('/api/users', authMiddleware, roleMiddleware(['admin']), (req, res) => {
    const usersList = users.map(u => ({
        id: u.id,
        username: u.username,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
        isActive: u.isActive
    }));
    res.json(usersList);
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Получить пользователя по id (только админ)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Информация о пользователе
 */
app.get('/api/users/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
    const user = users.find(u => u.id === req.params.id);

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive
    });
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Обновить пользователя (только админ)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: Пользователь обновлен
 */
app.put('/api/users/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
    const user = users.find(u => u.id === req.params.id);

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const { firstName, lastName, role } = req.body;

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (role && ['user', 'seller', 'admin'].includes(role)) user.role = role;

    res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive
    });
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Заблокировать пользователя (только админ)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Пользователь заблокирован
 */
app.delete('/api/users/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
    const user = users.find(u => u.id === req.params.id);

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    user.isActive = false;

    // Удаляем все refresh токены пользователя
    for (const token of refreshTokens) {
        try {
            const payload = jwt.verify(token, REFRESH_SECRET);
            if (payload.sub === user.id) {
                refreshTokens.delete(token);
            }
        } catch (err) {
            // Пропускаем невалидные токены
        }
    }

    res.json({ message: 'User blocked successfully' });
});

// ==================== PRODUCT ROUTES ====================

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Получить список товаров (доступно всем аутентифицированным)
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Список товаров
 */
app.get('/api/products', authMiddleware, (req, res) => {
    res.json(products);
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Создать товар (только продавец и админ)
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - category
 *               - description
 *               - price
 *             properties:
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       201:
 *         description: Товар создан
 */
app.post('/api/products', authMiddleware, roleMiddleware(['seller', 'admin']), (req, res) => {
    const { title, category, description, price } = req.body;

    if (!title || !category || !description || price === undefined) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const product = {
        id: String(nextProductId++),
        title,
        category,
        description,
        price: Number(price)
    };

    products.push(product);
    res.status(201).json(product);
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Получить товар по id (доступно всем аутентифицированным)
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Информация о товаре
 */
app.get('/api/products/:id', authMiddleware, (req, res) => {
    const product = products.find(p => p.id === req.params.id);

    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
});

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Обновить товар (только продавец и админ)
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Товар обновлен
 */
app.put('/api/products/:id', authMiddleware, roleMiddleware(['seller', 'admin']), (req, res) => {
    const productIndex = products.findIndex(p => p.id === req.params.id);

    if (productIndex === -1) {
        return res.status(404).json({ error: 'Product not found' });
    }

    const { title, category, description, price } = req.body;

    if (title) products[productIndex].title = title;
    if (category) products[productIndex].category = category;
    if (description) products[productIndex].description = description;
    if (price !== undefined) products[productIndex].price = Number(price);

    res.json(products[productIndex]);
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Удалить товар (только админ)
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Товар удален
 */
app.delete('/api/products/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
    const productIndex = products.findIndex(p => p.id === req.params.id);

    if (productIndex === -1) {
        return res.status(404).json({ error: 'Product not found' });
    }

    products.splice(productIndex, 1);
    res.json({ message: 'Product deleted successfully' });
});

// Запуск сервера
initTestData().then(() => {
    app.listen(PORT, () => {
        console.log(`Сервер запущен на http://localhost:${PORT}`);
        console.log(`Swagger UI доступен на http://localhost:${PORT}/api-docs`);
        console.log('\nТестовые учетные записи:');
        console.log('Админ: admin / admin');
        console.log('Продавец: seller / seller');
        console.log('Пользователь: user / user');
    });
});