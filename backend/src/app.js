// backend/src/app.js
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.routes.js';
import productsRoutes from './routes/products.routes.js';
import ordersRoutes from './routes/orders.routes.js';
import usersRoutes from './routes/users.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app = express();

// Log simple
app.use((req,res,next)=>{ console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`); next(); });

// CORS
app.use(cors({
  origin: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

app.use(express.json());

// ---- Static: /public e /images ----
const PUBLIC_DIR = path.join(__dirname, 'public');
const IMAGES_DIR = path.join(PUBLIC_DIR, 'images');

console.log('[STATIC] PUBLIC_DIR =', PUBLIC_DIR, 'exists:', fs.existsSync(PUBLIC_DIR));
console.log('[STATIC] IMAGES_DIR =', IMAGES_DIR, 'exists:', fs.existsSync(IMAGES_DIR));

app.use(express.static(PUBLIC_DIR));            // sirve /images/* también
app.use('/images', express.static(IMAGES_DIR)); // explícito

// Debug opcional: listar imágenes
app.get('/images/_ls', (_req,res)=>{
  try { res.json({ dir: IMAGES_DIR, files: fs.readdirSync(IMAGES_DIR) }); }
  catch(e){ res.status(500).json({ error: e.message, dir: IMAGES_DIR }); }
});
// -----------------------------------

// Health
app.get('/health', (_req,res)=>res.json({ ok:true }));

// Rutas API
app.use('/auth', authRoutes);
app.use('/products', productsRoutes);
app.use('/orders', ordersRoutes);
app.use('/users', usersRoutes); 

export default app;