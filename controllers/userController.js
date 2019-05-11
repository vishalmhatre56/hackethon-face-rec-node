// const request = require('request');
var fs = require("fs");
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const request = require('request');
const subscriptionKey = '7607cb4d93da44f3bb2668dbe28f6254';
const uriBase = 'https://westcentralus.api.cognitive.microsoft.com/face/v1.0/detect';

function verifyFace(faceId, res) {
    console.log('VERIFYING FACE ID...');
    
    const findsimilars = 'https://westcentralus.api.cognitive.microsoft.com/face/v1.0/findsimilars';

    const jsonBody = {
        faceId: faceId,
        faceListId: 'iconnecthackathon'
    }
    const bodyDetect = JSON.stringify(jsonBody);
    const options = {
        uri: findsimilars,
        // qs: detectparams,
        body: bodyDetect,
        headers: {
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key' : '7607cb4d93da44f3bb2668dbe28f6254'
        }
    };
    request.post(options, (error, response, body) => {
        if (error) {
          console.log('Error: ', error, jsonBody);
          res.status(200).json({error: true});
          return;
        }
        console.log('API RETURNED SUCCESS!');
        
        if (body.length > 0) {
          let jsonResponse = JSON.stringify(JSON.parse(body), null, '  ');
          const jsonBody = JSON.parse(body);
          if (jsonBody.length && jsonBody[0].confidence) {
            const confidence = jsonBody[0].confidence;
            if (confidence > 0.8) {
                console.log('IDENTIFICATION SUCCESSFULL WITH CONFIDENCE: ', confidence);
                res.status(200).json({error: false, message: 'Success'});
            } else {
                console.log('IDENTIFICATION NOT SUCCESSFULL WITH CONFIDENCE: ', confidence);
                res.status(200).json({error: true, message: 'Failed'});
            }
          } else {
              console.log('IDENTIFICATION NOT SUCCESSFULL');
              res.status(200).json({error: true, message: 'Failed'});
          }
          //SEND RESPONSE TO FRONTEND
        }
      });
};
module.exports = {
    async register(req, res) {
        console.log("hello");
        
console.log(req.body);

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
            return res.status(200).json({
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
                        res.status(200).json({
                            success: false,
                            message: 'email or password is Incorrect'
                        });
                    }
                } else {
                    res.status(200).json({
                        success: false,
                        message: 'email or password is Incorrect'
                    });
                }
            } else {
                return res.status(200).json({
                    message: 'email and password are required',
                });
            }
        } catch (err) {
            // console.log("err", err);
            return res.status(200).json({
                message: 'Error in login',
                error: err
            });
        }
    },
    faceAPILogin(req, res) {
        const imageData = req.body.imageData;
        const detect = 'https://westcentralus.api.cognitive.microsoft.com/face/v1.0/detect';
    const imageUrl =
        'https://upload.wikimedia.org/wikipedia/commons/3/37/Dagestani_man_and_woman.jpg';
    var base64Data = imageData.replace(/^data:image\/jpeg;base64,/, "");

    fs.writeFile("/home/nitin/Pictures/Webcam/loginApi.jpg", base64Data, 'base64', function(err) {
        console.log(err);
        fs.readFile('/home/nitin/Pictures/Webcam/loginApi.jpg', function(err, data) {
            if (err) throw err;
            var binaryImage = new Buffer(data, 'binary');
            const detectparams = {
                'returnFaceId': 'true'
            };
            // const bodyDetect = '{"url": ' + '"' + imageUrl + '"}';
            const bodyDetect = binaryImage;
            const options = {
                uri: detect,
                qs: detectparams,
                body: bodyDetect,
                headers: {
                    'Content-Type': 'application/octet-stream',
                    'Ocp-Apim-Subscription-Key' : '7607cb4d93da44f3bb2668dbe28f6254'
                }
            };
            console.log('VERIFYING FACE ID');
            request.post(options, (error, response, body) => {
                if (error) {
                  console.log('Error: ', error, jsonBody);
                  return;
                }
                const jsondata = JSON.parse(body)
                
                if (body.length > 0) {
                    let jsonResponse = JSON.stringify(JSON.parse(body), null, '  ');
                    // return jsondata[0].faceId;
                    if(jsondata && jsondata[0] && jsondata[0].faceId)
                        verifyFace(jsondata[0].faceId, res);
                    else {
                        console.log('FACE NOT FOUND');
                        res.status(200).json({message: 'Face Not Found', error: true});
                    }
                }
              });
        });
    });
    },
   faceAPIRegister(req, res) {
        const firstName = req.body.first_name ? req.body.first_name : '';
        const lastName = req.body.last_name ? req.body.last_name : '';
        const email = req.body.email ? req.body.email : '';
        const password = req.body.password ? req.body.password : '';
        const imageData = req.body.imageData ? req.body.imageData : '';
        const addFaceList = 'https://westcentralus.api.cognitive.microsoft.com/face/v1.0/facelists/hackathon/persistedFaces?';
        const faceListParams = {
            'faceListId': 'iconnecthackathon'
        }
        const image1 =
            'https://i.pinimg.com/originals/72/e0/2f/72e02fb059b99c6295b2f9bee2e0890e.jpg';
        const image2 = 'https://www.infringe.com/wp-content/uploads/2016/06/Dewey_Hagborg.jpg';
        // const bodyDetect = '{"url": ' + '"' + image2 + '"}';
        var base64Data = imageData.replace(/^data:image\/jpeg;base64,/, "");
    
        fs.writeFile("/home/nitin/Pictures/Webcam/faceImage.jpg", base64Data, 'base64', function(err) {
            err? console.log(err) : '';
            fs.readFile('/home/nitin/Pictures/Webcam/faceImage.jpg', function(err, data) {
                if (err) throw err;
                var binaryImage = new Buffer(data, 'binary');
                const detectparams = {
                    'returnFaceId': 'true'
                };
                // const jsonbody = {
                //     url: imageUrl
                // }
                // const bodyDetect = JSON.stringify(jsonbody); // '{"url": ' + '"' + imageUrl + '"}';
                const bodyDetect = binaryImage;
                const options = {
                    uri: addFaceList,
                    qs: faceListParams,
                    body: bodyDetect,
                    headers: {
                        'Content-Type': 'application/octet-stream',
                        'Ocp-Apim-Subscription-Key' : '7607cb4d93da44f3bb2668dbe28f6254'
                    }
                };
                console.log('SENDING REQUEST TO REGISTER FACE');
                request.post(options, (error, response, body) => {
                    if (error) {
                      console.log('Error: ', error);
                      res.send({message: 'error', error: true})
                    }
                    console.log('API RETURNED SUCCESS!');
                    
                    if (body && body.length > 0) {
                      let jsonResponse = JSON.stringify(JSON.parse(body), null, '  ');
                      console.log(jsonResponse);
                      //SEND RESPONSE TO FRONTEND
                      res.status(200).json({message: 'success', error:false})
                    } else {
                        res.status(200).json({message: 'More than one Found', error:true})
                    }
                  });
    
            })
        });
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