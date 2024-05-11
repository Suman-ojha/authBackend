const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../Models/user');
const { Validator } = require('node-input-validator');
const blackLsistTokenSchema = require('../Models/blackListToken')
const siteHelper = require('../helpers/site_helpers')

module.exports = {
    //this is for user-resgistration(admin, normal users)//by default profile visibility is puclic 
    user_register : async (req , resp)=>{
        try {
            const v = new Validator(req.body, {
                name: 'required',
                phone: 'required|minLength:10',
                email: 'required|email',
                password: 'required|minLength:8',
                cpassword: 'required|same:password'
            });
            const matched = await v.check();
            if (!matched) {
                return resp.status(200).send({ 
                    status: 'val_err', 
                    message: "Validation error", 
                    val_msg: v.errors 
                });
            }
            // if()
            let hash_password =await bcrypt.hash(req.body.password ,10);
            let doc ={
                name: req.body.name,
                email: req.body.email,
                password: hash_password,
                bio: req.body.bio ?? '',
                phone: req.body.phone,
                photo: req.body.photo,
                isAdmin: req.body.isAdmin ,
                profileVisibility: req.body.profileVisibility ,
            }
            // console.log(doc  , "doc")
            const data = await UserModel.create(doc);
            return resp.status(200).send({
                status:"success",
                message:"User has been registered successfully!",
                data :data ?? []
            })

        } catch (e) {
            return resp.status(200).send({
                status :"error",
                message :e?.message ?? 'Something went wrong.'
            })
        }
    },
    //this is for login purpose
    signin: async(req , resp) =>{
        try {
            //validation added used node-input-validator
            const v = new Validator(req.body, {
                email: 'required|email',
                password: 'required|minLength:8',
            });
            const matched = await v.check();
            if (!matched) {
                return resp.status(200).send({ 
                    status: 'val_err', 
                    message: "Validation error", 
                    val_msg: v.errors 
                });
            }
            const user_details = await UserModel.findOne({ 
                email :req.body.email
             });
            if (!user_details) {
              return resp.status(200).send({
                status :"error",
                message :"user not found."
              })
            }
            const validPassword = bcrypt.compareSync(req.body.password, user_details.password);
            if (!validPassword) {
              return resp.status(200).send({
                status:"error",
                message:"wrong credentials."
              });
            }
            let payload ={
                id: user_details._id, 
                isAdmin: user_details.isAdmin,
                name :user_details.name,
                profileVisibility:user_details.profileVisibility,
                email :user_details.email
            }
            // const token = jwt.sign(
            //   { id: user_details._id, isAdmin: user_details.isAdmin },
            //   process.env.JWT_SECRET
            // );
            const token = await siteHelper.generateToken(payload);

            return resp.status(200).send({
                status:"success",
                message:"Loggedin successfully.!",
                token:token,
                user_data: user_details,
            })

        } catch (e) {
            return resp.status(200).send({
                status :"error",
                message : e?.message ?? 'something went wrong.'
            })
        }
    },
    logout :async(req, res) => {
        try{
            const { token } = req.body;
            //here i just stored the token in db to logout the user from backend
            await blackLsistTokenSchema.create({ token });
            // Respond with a success message
            return res.status(200).json({ message: 'Logged out successfully' });
        }catch(err){
            return res.status(500).json(err.message);
        }
    } 
}

// const  generateToken =async function (payload) {
//     const options = { expiresIn: '365d' };
//     const tokendata = payload;
//     const token = jwt.sign(tokendata, JWTSECRET, options);
//     const encodedToken = Buffer.from(token).toString('base64');
//     return encodedToken;
// }