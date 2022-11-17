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
  User.findOne({ username: req.body.username }, async (err, doc) => {
    if (err) return res.status(500).send(err);
    if(doc) return res.status(400).send({success:false ,error: "User already exists!"});

    if(!doc){

      //console.log(String(req.body.password))
      const hashedPassword = await bcrypt.hash(req.body.password, 10);

      const newUser = new User({
        name: req.body.name,
        username: req.body.username,
        password: hashedPassword
      })

      try {
        await newUser.save();
      } catch (err) {
        console.log(err);
        return res.status(400).send({success:false ,error: "User already exists!"});
      }
      res.send({success: true, message: "User Created"}); 
    }
  })
 
}

 exports.LoginUser = (req, res) => {
    User.findOne({ 'username': req.body.username }, (err, user) => {
      if (!user) {
        return res.status(401).json({ success: false, error: 'User account not found!' });
      } 
      
      else {
        // console.log(user)
          bcrypt.compare(req.body.password, user.password, async (err, isMatch) => {
              console.log(isMatch);
              //isMatch is eaither true or false
              if (!isMatch) {
              return res.status(401).json({ success: false, error: 'Wrong Password!' });
            } 
            else {
              if (!user.enabled){
                return res.status(400).json({ success: false, error: 'User not yet verified!' });
              }
                  const token = await user.generateToken();
                  user.save();
                    if (err) {
                      return res.status(400).send({ err });
                    } 
                    else {
                      const data = {
                      userID: user._id,
                      name: user.name,
                      username: user.username,
                      token: token,
                      }
                      //saving token to cookie
                     return  res.status(200).json(
                      {
                        success: true,
                        message: 'Successfully Logged In!',
                        userData: data
                      })
                    }
                  
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

exports.verifyToken = async (req, res) => {
  User.findOne({ token: req.body?.token || "" }).exec((err, user) => {
    if (err) {
      // console.log(err);
      return res.status(400).send({ err });
    }
    if (!user) {
      // console.log(req.query?.token);    
      return res.status(401).send("Invalid Token");
    }
    return res.status(200).json({token: user.token, username: user.username, name: user.name});
  });
};
exports.currentUser = async (req, res) => {
  User.findOne({ email: req.user.email }).exec((err, user) => {
    if (err) throw new Error(err);
    res.json(user);
  });
};