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

// const AuthController = require('./controllers/AuthController')
// app.post(basepath+'/company_signin', AuthController.company_signin);

// app.post(basepath+'/get-tds-act', DeclarationController.get_tds_act_data);


app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'SECRET' 
}));


const siteHelper =require('./helpers/site_helpers')
const UserModel = require('./Models/user')
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
app.get('/error', (req, res) => res.send("error logging in"));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});
/*  Google AUTH  */
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