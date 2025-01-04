import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import HandlerDatabase from './Config/db.js';
import router from './Router/route.js';


const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(morgan());
app.use(cors({
    credentials: true,
    origin: ['http://localhost4000', 'http://localhost:3000'] ,// for multiple origins
    options: {
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        exposedHeaders: ['Set-Cookie']
    }
}))
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            imgSrc: ["'self'", "https://example.com"],
            fontSrc: ["'self'", "https://fonts.googleapis.com"],
            scriptSrc: ["'self'", "https://cdnjs.cloudflare.com"],
            styleSrc: ["'self'", "https://cdnjs.cloudflare.com"]
        }
    }
}))

app.get('/',(req, res) => {
    res.send({message: 'Welcome to the API!'});
})
app.use(router)

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    HandlerDatabase();
})