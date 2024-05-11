const express = require('express');
const app = express();
require('dotenv').config();
require('./DB/connection')
const passport = require('passport');
const session = require('express-session');
const bcrypt = require('bcryptjs')
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));


global.JWTSECRET=process.env.JWTSECRET;
global.basepath = process.env.BASEPATH;
/*
****N.B=== Here i maintained 200 as status code for all kind of response..it can easily handel in frontend.
structured the code..
*/


app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'SECRET' 
}));


const siteHelper =require('./helpers/site_helpers')
const UserModel = require('./Models/user')
//registed the routes
app.use(basepath+'/api/user',  require('./Routes/auth'));
app.use(basepath+'/api/user',  require('./Routes/userAction'));
/*  PASSPORT SETUP  */
app.use(passport.initialize());
app.use(passport.session());
var userProfile;
app.get('/success',async (req, resp) => {

    // console.log(userProfile._json)
    const user_details = await UserModel.findOne({
      email:userProfile._json.email
    })
    
    try {
      if(user_details){
        //here I am seeing that,,, if user present in our DB , return the token,, 
        let payload ={
          id: user_details._id, 
          isAdmin: user_details.isAdmin,
          name :user_details.name,
          profileVisibility:user_details.profileVisibility,
          email :user_details.email
      }
       
      const token = await siteHelper.generateToken(payload);
      return resp.status(200).send({
        status :"success",
        messgage :"loggedin successfully.",
        data : userProfile._json,
        token :token
      })
        // const { password, ...rest } = user._doc;
      }else{
        //if user not regosted ....stored a new entry in DB, profileVisibility by default is public
        //isAdmin is bydefault false...only admin can possible for manual registration
        const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
        const hashedPassword = bcrypt.hashSync(generatedPassword, 10);
       
        let payload ={
          name : userProfile._json.name,
          isAdmin :false,
          email : userProfile._json.email,
          profileVisibility:'public',
          picture : userProfile._json.picture,
       }
        let payload_data ={
          name : userProfile._json.name,
          isAdmin :false,
          email : userProfile._json.email,
          profileVisibility:'public',
          picture : userProfile._json.picture,
          password:hashedPassword
       }
   
        const token = await siteHelper.generateToken(payload);
        //stored into DB
        await UserModel.create(payload_data);
        return resp.status(200).send({
          status :"success",
          messgage :"loggedin successfully.",
          data : userProfile._json,
          token :token
        })
      }
      
      
    } catch (e) {
      return resp.status(200).send({
        status :"error",
        message : e?.message ?? 'something went wrong!'
      })
    }
});
//if any error occurs 
app.get('/error', (req, res) => res.send("error logging in"));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});
/*  Google AUTH  */
//I have used here passport-google-auth
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK
  },
  function(accessToken, refreshToken, profile, done) {
      userProfile=profile;
      return done(null, userProfile);
  }
));
 
//when use this routes in the browser.. it will redirect to the redircted url
app.get('/auth/google', 
  passport.authenticate('google', { scope : ['profile', 'email'] }));
 


app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/error' }),
  function(req, res) {
    // Successful authentication, redirect success.
    res.redirect('/success');
  });



app.listen(process.env.PORT , ()=>{
    console.log(`server runnig at ${process.env.PORT}..`);
})