const http = require('http');
const express = require('express');
const { engine } = require('express-handlebars');
const cors = require('cors');
const { manager } = require('./dao/productsManagerMongo');
const crypto = require('crypto');
const passport = require('passport');
const GitHubStrategy = require('passport-github').Strategy;
const session = require('express-session');
const WebSocket = require('ws');
const { getAllMessages, saveMessage } = require('./dao/messagesManager');
const User = require('./dao/models/userModel'); // Agregar el modelo de usuario
const LocalStrategy = require('passport-local').Strategy;

const app = express();
const port = 8080;

const server = http.createServer(app);

const corsOptions = {
    origin: 'http://localhost:8080',
    optionsSuccessStatus: 200,
};

const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://miguel:U1v4YDx3uuAua6Zm@cluster1.jqz7ljy.mongodb.net/mensajes', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Verifica la conexión
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB Atlas');
});

app.use(cors(corsOptions));
app.use(express.json());
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

app.get('/realtimeProducts', async (req, res) => {
    res.render('index', { products: (await manager.getProductsFromMongo()).content });
});

app.get('/chat', async (req, res) => {
    res.render('chat', { messages: await getAllMessages() });
});

app.get('/products', async (req, res) => {
    res.render('products');
});

app.get('/cart/:cid', async (req, res) => {
    const { cid } = req.params;
    const response = await cartsManager.getProductsByIdFromMongo(cid);
    console.log('hola', response);
    console.log(cid);
    res.render('cart', { products: response.content.products.map(prod => ({ _id: prod._id, quantity: prod.quantity })) });
});

app.get('/', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});

const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', async (websocket) => {
    websocket.send(JSON.stringify(await manager.getProductsFromMongo()));

    websocket.on('newMessage', async (message) => {
        const newMessage = JSON.parse(message);
        console.log(newMessage, message);
        await saveMessage(newMessage);
        const messagesUpdated = await getAllMessages();
        wss.clients.forEach(async (client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(messagesUpdated));
            }
        });
    });

    websocket.on('message', async (message) => {
        console.log(JSON.parse(message).event);
        const parsedData = JSON.parse(message);
        if (parsedData.event == 'newMessage') {
            const newMessage = { user: parsedData.user, message: parsedData.message };

            await saveMessage(newMessage);
            const messagesUpdated = await getAllMessages();
            wss.clients.forEach(async (client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ event: 'upadateMessages', messages: messagesUpdated }));
                }
            });
        } else {
            const newProduct = JSON.parse(message);
            console.log(newProduct);
            const response = await manager.addProductToMongo(newProduct);
            console.log(response);

            wss.clients.forEach(async (client) => {
                if (client.readyState === WebSocket.OPEN) {
                    const updatedProducts = (await manager.getProductsFromMongo());
                    console.log(updatedProducts);
                    client.send(JSON.stringify(updatedProducts));
                }
            });
        }
    });
});

server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (websocket) => {
        wss.emit('connection', websocket, request);
    });
});

// Configuración de la sesión
app.use(session({
    secret: 'tu_secreto_secreto', // Reemplaza esto con una clave secreta real
    resave: false,
    saveUninitialized: true
}));

// Inicialización de Passport
app.use(passport.initialize());
app.use(passport.session());

app.use(session({
    secret: crypto.randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: true
}));

const productsRouter = require('./router/productRouter');
app.use('/api/products', productsRouter);

const cartRouter = require('./router/cartRouter');
const { cartsManager } = require('./dao/cartsMangerMongo');
app.use('/api/cart', cartRouter);

const loginRouter = require('./router/loginRouter');
app.use('/api/login', loginRouter);

const registerRouter = require('./router/registerRouter');
app.use('/api/register', registerRouter);

passport.use(new GitHubStrategy({
    clientID: 'd622b73918b3bcb79ebf',
    clientSecret: 'd59813fa3f960a9f0f5486d1979aecdeb69203a4',
    callbackURL: 'http://localhost:8080/auth/github/callback'
},
    (accessToken, refreshToken, profile, done) => {
        return done(null, profile);
    }
));

app.get('/auth/github',
    passport.authenticate('github')
);
app.get('/auth/github/callback',
    passport.authenticate('github', {
        successRedirect: '/products',
        failureRedirect: '/login',
        failureFlash: true
    })
);

server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
