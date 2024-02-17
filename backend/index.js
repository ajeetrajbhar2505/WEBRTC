const express = require('express')
const app = express()
const routes = require('./routes/index.js')
const dotenv = require('dotenv');
dotenv.config();
app.use(express.json())
app.use('/api', routes)

const httpServer = require('http').createServer(app)
let PORT;
process.env.STATUS === 'production'
? (PORT = process.env.PROD_PORT)
: (PORT = process.env.DEV_PORT);

httpServer.listen(PORT,()=>{
    console.log(`Server in ${process.env.STATUS} mode, listening on *:${PORT}`);
})
