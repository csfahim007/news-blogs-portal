"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const blog_routes_1 = __importDefault(require("./routes/blog.routes"));
const news_routes_1 = __importDefault(require("./routes/news.routes"));
const category_routes_1 = __importDefault(require("./routes/category.routes"));
const comment_routes_1 = __importDefault(require("./routes/comment.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const contact_routes_1 = __importDefault(require("./routes/contact.routes"));
const feedback_routes_1 = __importDefault(require("./routes/feedback.routes"));
const settings_routes_1 = __importDefault(require("./routes/settings.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
if (NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
        console.log('[HEADERS]', req.headers);
        if (req.body && Object.keys(req.body).length > 0) {
            console.log('[BODY]', req.body);
        }
        next();
    });
}
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Content-Security-Policy', "default-src 'self'");
    next();
});
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'https://blog.pinesaas.com',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200,
}));
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
app.use('/api/auth', auth_routes_1.default);
app.use('/api/blogs', blog_routes_1.default);
app.use('/api/news', news_routes_1.default);
app.use('/api/categories', category_routes_1.default);
app.use('/api/comments', comment_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/contact', contact_routes_1.default);
app.use('/api/feedback', feedback_routes_1.default);
app.use('/api/settings', settings_routes_1.default);
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Internal Server Error',
        },
    });
});
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
exports.default = app;
