const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController.js');
const {auth}  = require('../services/auth.js');
 
router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/profile',auth,userController.profile);

  
module.exports = router;