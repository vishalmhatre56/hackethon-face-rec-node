require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
 

const port = process.env.PORT;

const mongoDB = `mongodb://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${process.env.MONGODB_NAME}`;

mongoose.connect(mongoDB, {
  useNewUrlParser: true,

});

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
   // res.setHeader('Content-Type', 'application/json');
res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
});


app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
  parameterLimit: 100000,
  limit: '50mb',
  extended: true
  
}));
// app.use(async function (req, res, next) {
//   console.log("middleware");
//   console.log(req.body);
  
//   next()
// })

const users = require('./routes/userRoute');

app.use('/api/users',users);
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
