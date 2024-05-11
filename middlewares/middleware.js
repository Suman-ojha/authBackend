

const User = require('../Models/user');
const jwt = require('jsonwebtoken');
const blackLsistTokenSchema = require('../Models/blackListToken')

module.exports={
    checkAuth:async function (req, resp, next) {
        var token = req.headers['x-access-token'];
        const data = await blackLsistTokenSchema.findOne({token})
        // console.log(data,"data")
        if (!token) return resp.status(401).send({ status: 'error', message: 'No token provided.' });
        const decodedData = await decryptToken(token);
        console.log(decodedData ,"decoded data");
        if (decodedData.status == 'false' || data) return resp.status(401).send({ status: 'error', message: 'Failed to authenticate token.' });
        req.authData=decodedData;
        req.authId=decodedData.id;
        next();
    },
}

const decryptToken = async function (token) {
    try {
        const decodedToken = Buffer.from(token, 'base64').toString('utf-8');
        // console.log(decodedToken,"dadta")
        // Verify and decode the JWT token
        const jwt_data = jwt.verify(decodedToken, JWTSECRET);
        return jwt_data;
    }
    catch (e) {
      return { status: 'false', message: e.message || 'Failed to authenticate token.' };
    }
  }