const http = require('http');
const express = require('express');
const { engine } = require('express-handlebars');
const cors = require('cors');
const { manager } = require('./dao/productsManagerMongo');
const GitHubStrategy = require('passport-github').Strategy;
const WebSocket = require('ws');
const { getAllMessages, saveMessage } = require('./dao/messagesManager');
const pasaporte = require('./config/passport.config')
const authRouter = require('./router/authRouter')
const session = require('express-session');

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

app.use(
    session({
        secret: 'tu_secreto',
        resave: false,
        saveUninitialized: false,
    })
);

app.use(pasaporte.initialize());
app.use(pasaporte.session());

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
    if(req.session.passport){
        const user = await User.findById(req.session.passport.user)
        res.render('products', {user: {first_name: user.first_name, last_name: user.last_name, role: user.role}});
    }
    else{
        res.redirect('/')
    }
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


const productsRouter = require('./router/productRouter');
const registerRouter = require('./router/registerRouter');
const cartRouter = require('./router/cartRouter');
const { cartsManager } = require('./dao/cartsMangerMongo');
const loginRouter = require('./router/loginRouter');

app.use('/api/products', productsRouter);
app.use('/api/cart', cartRouter);
app.use('/api/login', loginRouter);
app.use('/auth', authRouter);
app.use('/api/register', registerRouter);



const passport = require('passport');
const User = require('./dao/models/userModel');


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
