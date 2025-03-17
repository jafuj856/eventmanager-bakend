const express = require('express')
const app = express();
port = 3010
const path = require('path')
const cors = require("cors");
const connectDb = require('./connection/mongoConnection')
connectDb()
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
app.use(bodyParser.json({ limit: "1000mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "1000mb", extended: true }));
app.use(cors({ origin: true, credentials: true }));

// routesSetting
const user = require('./routes/user')

app.use('/user',user)
dotenv.config();
app.listen(port, () => {
    console.log('server is conntected===',port);
    
})