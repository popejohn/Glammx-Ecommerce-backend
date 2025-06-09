const mongoose = require('mongoose')



const adminschema = new mongoose.Schema({
      companyid: {type: String, required:true,},
      password: {type: String, required: true,},
      profilepic: {type: String},
      token: {type: String},
}
)

const adminmodel = mongoose.model("admins", adminschema)


module.exports = adminmodel