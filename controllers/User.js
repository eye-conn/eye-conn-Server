const User = require("../models/User");
const bcrypt = require('bcryptjs');


exports.updateUser = async (req, res) => {

  const { name, image, email, password,
            twitterURL, telegramId,
            walletAddress} = req.body.user;

  // const authUser = await User.findOne(email);

  // const hashPassword = 

  // if(authUser.password)

  const user = await User.findOneAndUpdate(
    { email },
    { 
        name: name,
        image: image,
        meta : {
            telegramId: telegramId,
            twitterURL: twitterURL,
            walletAddress: walletAddress
        }
    },
    { new: true }
  );
  if (user) {
    console.log("USER UPDATED", user);
    res.json(user);
  } 
  else {
    const newUser = await new User({ 
        name: name,
        email: email,
        image: image,
        password: password,
        meta : {
            telegramId: telegramId,
            twitterURL: twitterURL,
            walletAddress: walletAddress
        }
    }).save();
    console.log("USER CREATED", newUser);
    res.json(newUser);
  }
};

exports.RegisterUser = async (req, res) => {
  
  //console.log(req.body)
  User.findOne({ email: req.body.email }, async (err, doc) => {
    if (err) throw err;
    if(doc) res.send("User already exists");

    if(!doc){

      //console.log(String(req.body.password))
      const hashedPassword = await bcrypt.hash(req.body.password, 10);

      const newUser = new User({
        name: "TEMP",
        email: req.body.email,
        password: hashedPassword
      })

      await newUser.save();
      res.send("User Created"); 
    }
  })
 
}

 exports.LoginUser = (req, res) => {
    User.findOne({ 'email': req.body.user.email }, (err, user) => {
      if (!user) {
        return res.status(404).json({ success: false, message: 'User email not found!' });
      } 
      
      else {
          user.comparePassword(req.body.user.password, (err, isMatch) => {
              console.log(isMatch);
              //isMatch is eaither true or false
              if (!isMatch) {
              return res.status(400).json({ success: false, message: 'Wrong Password!' });
            } 
            else {
                  user.generateToken((err, user) => {
                    if (err) {
                      return res.status(400).send({ err });
                    } 
                    else {
                      const data = {
                      userID: user._id,
                      name: user.name,
                      email: user.email,
                      token: user.token,
                      }
                      //saving token to cookie
                      res.cookie('authToken', user.token).status(200).json(
                      {
                        success: true,
                        message: 'Successfully Logged In!',
                        userData: data
                      })
                    }
                  });
            }
        });
      }
    });
 }

 exports.LogoutUser = (req, res) => {
  User.findByIdAndUpdate(
  { _id: req.user._id }
  , { token: `` },
  (err) => {
  if (err) return res.json({ success: false, err })
  return res.status(200).send({ success: true, message: `Successfully Logged Out!` });
 })
 }

exports.currentUser = async (req, res) => {
  User.findOne({ email: req.user.email }).exec((err, user) => {
    if (err) throw new Error(err);
    res.json(user);
  });
};