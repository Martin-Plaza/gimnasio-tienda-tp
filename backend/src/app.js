// backend/src/app.js

//express es una libreria de node para crear el servidor, definir rutas y midlewares
import express from 'express';
//cors es un midleware para permitir/limitar solicitudes al servidor desde otros origenes (frontend), da seguridad
import cors from 'cors';
//para contruir rutas
import path from 'path';
//fs es un modulo de sistema de archivos: lee y escribe archivos, verifica existencia, lista directorios (carpetas)
import fs from 'fs';
//me dice exactamente donde estoy parado
import { fileURLToPath } from 'url';

//importamos todas las rutas que usaremos
import authRoutes from './routes/auth.routes.js';
import productsRoutes from './routes/products.routes.js';
import ordersRoutes from './routes/orders.routes.js';
import usersRoutes from './routes/users.routes.js';

//filename es la ruta actual de app.js
const __filename = fileURLToPath(import.meta.url);
//dirname es la carpeta de app.js 
const __dirname  = path.dirname(__filename);

//express() crea una instancia de la aplicacion express, esta instancia es el objeto "app"
//app tiene metodos (app.get, app.post), registra midlewares(app.use()), etc.
//finalmente inicia el servidor con app.listen en server.js
const app = express();

// CORS
app.use(cors({
  origin: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

//app.use es un metodo y express.json es un midleware. este midleware convierte a objeto JS los json que llegan en las peticiones
//detecta si Content-type es aplication/json y parsea las peticiones que vienen en json, luego lo guarda en req.body
app.use(express.json());

//rutas absolutas a las carpetas images y public
//path.join simplemente concatena rutas, dirname con public, tambien con images
const PUBLIC_DIR = path.join(__dirname, 'public');
const IMAGES_DIR = path.join(PUBLIC_DIR, 'images');

//el midleware express.static sirve desde el disco duro las rutas
app.use(express.static(PUBLIC_DIR));            
app.use('/images', express.static(IMAGES_DIR));


// Rutas API que llamaremos despues
app.use('/auth', authRoutes);
app.use('/products', productsRoutes);
app.use('/orders', ordersRoutes);
app.use('/users', usersRoutes); 

export default app;