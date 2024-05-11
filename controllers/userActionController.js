const UserModel = require('../Models/user')
const bcrypt = require('bcryptjs');


module.exports={
    //for user view purpose
    get_users:async function(req, resp, next){
        try {
            // here i handel data from authData to validate the users
            //Here acc to document , admin can view all , public user can view public users
            //private users can view private users(**N.B- It is not mentioned in documentaion)
            let search_option = {};
            if (req.authData.isAdmin) {
                // If user is admin, show all profiles
                search_option = { };
            } else if(!req.authData.isAdmin && req.authData.profileVisibility==='public' ){
                // If user is not admin, show only public profiles or user's own profile
                search_option = { $or: [{ profileVisibility: 'public' },
                 
                ], isAdmin:false }; 
            }
            else{
                //private users
                search_option = { $or: [{ profileVisibility: 'private' }] };
            }
            let aggregateData = await UserModel.aggregate([
              
                { $match: search_option },
                
            ])
            return resp.status(200).send({
                status:"success",
                message:"user profile data fetched successfully.",
                data :aggregateData
            })
        } catch (e) {
            return resp.status(200).send({
                status:"error",
                message:e?.message ?? "something went wrong."
            })
        }
    },
    //update users(admin, normal users) -->> all the mentioned(documention) field can be updated
    update_user_details : async function(req, resp, next){
        try {
            // console.log(req.authId);
            const userDetails = await UserModel.findOne({
                _id:req.authId
            })
            if(!userDetails){
                return resp.status(200).send({
                    status:"error",
                    message:"user not found."
                })
            }
            if(req.body.phone){
                let phone = req.body.phone;
                if(phone.length<10 ){
                    return resp.status(200).send({
                        status:"val_error",
                        messgae:"phone should be atleast 10 digit"
                    })
                }
            }
            console.log(req.body,"0")
            let hash_password = userDetails.password
            if(req.body.password){
               hash_password =await bcrypt.hash(req.body.password ,10);
            }
            let doc ={
                name: req.body.name ? req.body.email : userDetails.email,
                email: req.body.email ? req.body.email : userDetails.email,
                password: hash_password,
                bio: req.body.bio ? req.body.bio: userDetails.bio,
                phone: req.body.phone ? req.body.phone :userDetails.phone,
                photo: req.body.photo ? req.body.photo :userDetails.photo,
                profileVisibility : req.body.profileVisibility ? req.body.profileVisibility :userDetails.profileVisibility,
        
            }

            const result = await UserModel.findByIdAndUpdate(
                { _id:req.authId },
                doc,{new:true}
              )

            return resp.status(200).send({
                status :"success",
                message :'user details has been updated successfully!',
                data:result
            })
        } catch (e) {
            return resp.status(200).send({
                status :"error",
                message :e?.message ?? 'something went wrong.!'
            })
        }
    },
   
}