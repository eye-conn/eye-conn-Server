const mongoose =  require('mongoose');
  const { Schema } = mongoose;

  const bcrypt = require('bcrypt');
  const jwt = require('jsonwebtoken');
  const SALT = 10;
  

  const userSchema = new Schema({
    name:  {
      type: String,
      required: true
    },
    
    image: String,
    email:  {
      type: String,
      unique: true,
      required: true
    },
    password: {
      type: String,
      required: true,
      minlength: 8
    },

    enabled: {
      type: Boolean,
      default: true
    },

    token: {
      type: String,
      unique: true
    },
    meta: {
      twitterURL: String,
      telegramId: String,
      walletAddress: String
    }
  }, {
    timestamps: true
});


  
const model = mongoose.model("user", userSchema);

module.exports = model;