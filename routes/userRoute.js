const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController.js');
const {auth}  = require('../services/auth.js');
 
router.post('/register', userController.faceAPIRegister);
router.post('/login', userController.faceAPILogin);
router.get('/getimage',userController.getImageResp);

  
module.exports = router;