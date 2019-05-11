const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const request = require('request');
const subscriptionKey = '7607cb4d93da44f3bb2668dbe28f6254';
const uriBase = 'https://westcentralus.api.cognitive.microsoft.com/face/v1.0/detect';

module.exports = {
    async register(req, res) {

        const firstName = req.body.first_name ? req.body.first_name : '';
        const lastName = req.body.last_name ? req.body.last_name : '';
        const email = req.body.email ? req.body.email : '';
        const password = req.body.password ? req.body.password : '';

        const user = new userModel({
            first_name: firstName,
            last_name: lastName,
            email: email,
            password,
            password
        });
        try {
            const resultUser = await user.save();

            return res.json({
                success: true,
                message: 'saved',
                result: {
                    _id: resultUser._id,
                },
            });
        } catch (err) {
            return res.status(500).json({
                message: 'Error saving user',
                error: err
            });

        }


    },
    async login(req, res) {
        try {
            console.log("body", req.body);

            const email = req.body.email ? req.body.email : '';
            const password = req.body.password ? req.body.password : '';
            if (email && password) {
                const user = await userModel.findOne({
                    email: email
                }, 'email password')
                if (user) {
                    //console.log("user",user);


                    const isValidPassword = user.comparePassword(password);

                    if (isValidPassword) {
                        const token = jwt.sign({
                            user_id: user._id,
                        }, process.env.JWT_SECRET, {
                                expiresIn: '2h'
                            });
                        res.json({
                            success: true,
                            token: `Bearer ${token}`
                        });
                    } else {
                        res.status(500).json({
                            success: false,
                            message: 'email or password is Incorrect'
                        });
                    }
                } else {
                    res.status(500).json({
                        success: false,
                        message: 'email or password is Incorrect'
                    });
                }
            } else {
                return res.status(500).json({
                    message: 'email and password are required',
                });
            }
        } catch (err) {
            // console.log("err", err);
            return res.status(500).json({
                message: 'Error in login',
                error: err
            });
        }
    },
   async getImageResp(req, res) {
  
      

        const imageUrl =
            'https://upload.wikimedia.org/wikipedia/commons/3/37/Dagestani_man_and_woman.jpg';

        const params = {
            'returnFaceId': 'true',
            'returnFaceLandmarks': 'false',
            'returnFaceAttributes': 'age,gender,headPose,smile,facialHair,glasses,' +
                'emotion,hair,makeup,occlusion,accessories,blur,exposure,noise'
        };

        const options = {
            uri: uriBase,
            qs: params,
            body: '{"url": ' + '"' + imageUrl + '"}',
            headers: {
                'Content-Type': 'application/json',
                'Ocp-Apim-Subscription-Key': subscriptionKey
            }
        };
       
         request.post(options, (error, response, body) => {
            if (error) {
                console.log('Error: ', error);
                return;
            }
            let jsonResponse = JSON.stringify(JSON.parse(body), null, '  ');
            console.log('JSON Response\n');
            // console.log(jsonResponse);
            res.json({
                info: jsonResponse
            })
        });
       
    }
}