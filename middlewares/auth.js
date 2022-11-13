const { User } = require('../models/User');

const auth = (req, res, next) => {
 let token = req.body.token;
 
 User.findByToken(token, (err, user) => {
 
  if (err) throw err;
  if (!user) return res.json({ isAuth: false, error: true })
  
    req.user = user;
    next();
    
  });
  
}
module.exports = { auth }