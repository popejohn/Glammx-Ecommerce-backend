const mongoose = require('mongoose')



const userschema = new mongoose.Schema({
      firstname: {type: String, required:true,},
      lastname: {type: String, required: true,},
      email: {type: String, required: true,},
      password: {type: String, required: true,},
      loggedin: {type: Boolean,},
      profilepic: {type: String},
      datejoined: {type: Date, default: Date.now},
}
)

const usermodel = mongoose.model("allusers", userschema)


module.exports = usermodel