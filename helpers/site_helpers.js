const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports ={
    generateToken : async function (payload) {
        //here jwt token in encrypted into base64
        const options = { expiresIn: '365d' };
        const tokendata = payload;
        const token = jwt.sign(tokendata, JWTSECRET, options);
        const encodedToken = Buffer.from(token).toString('base64');
        return encodedToken;
    }
}