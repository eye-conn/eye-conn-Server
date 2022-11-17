const mongoose =  require('mongoose');
  const { Schema } = mongoose;

  const jwt = require('jsonwebtoken');
  

  const userSchema = new Schema({
    name:  {
      type: String,
      required: true
    },
    
    image: String,
    username:  {
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
      default: false
    },

    token: {
      type: String,
    },
    telegramId: {
      type: String,
      default: null
    }
  }, {
    timestamps: true
}

    );

userSchema.methods.generateToken = function() {
  const token = jwt.sign({ _id: this._id, username: this.username, name: this.name }, process.env.JWT_SECRET_KEY);
  this.token = token;
  return token;
}
  
const model = mongoose.model("user", userSchema);

module.exports = model;