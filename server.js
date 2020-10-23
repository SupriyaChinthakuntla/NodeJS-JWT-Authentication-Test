const express = require('express');
const app = express();
const path = require('path');

const jwt = require('jsonwebtoken');
const exjwt = require('express-jwt');
const bodyParser = require('body-parser');
const axios = require('axios');
const PORT = 3000;
const secretKey = 'My super secret key';
const jwtMW = exjwt({
    secret: secretKey,
    algorithms: ['HS256']
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded( { extended:true }));

app.use((req,res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Headers', 'Content-type,Authorization');
    next();
});

let users = [
    {
        id: 1,
        username: 'Priya',
        password: '123'
    },

    {
        id: 2,
        username: 'fabio',
        password: '456'
    },
    {
        id: 3,
        username: 'Supriya',
        password: '1234'
    }

];

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    let foundUser = false;

    for(let user of users) {
        if(username == user.username && password == user.password) {
            let token = jwt.sign({ id: user.id, username: user.username}, secretKey, {expiresIn: 60 * 3 });
            res.json({
                success: true,
                err: null,
                token
            });
            break;
        }
    }
    if (!foundUser) {
        res.status(401).json({
            success:false,
            token:null,
            err: 'Username or Password is incorrect'
        });
    } 
      
});

app.get('/api/dashboard', jwtMW, (req, res) => {
    res.json({
        success: true,
        myContent: 'Secret content that only logged in people can see'
    });
});

app.get('/api/settings', jwtMW, (req, res) => {
    res.json({
        success: true,
        myContent: 'Only login person with valid token can see this page'
    });
});

app.get('/', (req, res) => {
   res.sendFile(path.join(__dirname, 'index.html'));
});

app.use(function (err, req, res, next) {

  if(err.name === 'UnauthorizedError') {
    if(err.inner.name == 'TokenExpiredError') {
        console.log(err.inner.name);
        axios.get('http://localhost:3000');
        return;
      }
      res.status(401).json({
              success: false,
              officialError: err,
              err: 'Username or password is incorrect 2'
      });
  } else {
      next(err);
  }
});

app.listen(PORT, () => {
   console.log(`Serving on port ${PORT}`);
});