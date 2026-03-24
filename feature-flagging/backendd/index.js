require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const http = require("http");

const { connectDB } = require('./src/config/db');
const { initRedis } = require('./src/services/redisClient');
const { initRealtime } = require("./src/realtime");
const evaluateRoutes = require('./src/routes/evaluate');

const flagsRouter = require('./src/routes/flags');
// const authRouter = require('./routes/auth');
// const evalRouter = require('./routes/evaluate');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use('/api/evaluate', evaluateRoutes);
app.get('/api/health', (req, res) => res.json({ ok: true }));

// app.use('/api/auth', authRouter);
app.use('/api/flags', flagsRouter);
// app.use('/api/evaluate', evalRouter);

const PORT = process.env.PORT || 4000;
async function start(){
  await connectDB();
  await initRedis();
  const server = http.createServer(app);
initRealtime(server);

  server.listen(PORT, ()=> console.log(`Server running on ${PORT}`));
}

start();