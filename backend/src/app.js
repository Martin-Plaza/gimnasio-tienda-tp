import express from 'express';
import cors from 'cors';
import productsRoutes from './routes/products.routes.js';
import authRoutes from './routes/auth.routes.js';
import ordersRoutes from './routes/orders.routes.js';

const app = express();
app.use(cors({ origin:true, methods:['GET','POST','PUT','DELETE','OPTIONS'], allowedHeaders:['Content-Type','Authorization'] }));
app.use(express.json());

app.get('/health', (_req,res)=>res.json({ok:true}));

app.use('/auth', authRoutes);
app.use('/products', productsRoutes);
app.use('/orders', ordersRoutes);   

export default app;