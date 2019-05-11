const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

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
            	success:true,
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
console.log("body",req.body);

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
    profile(req, res) {
        res.json({
            info: req.decoded
        })
    }
}