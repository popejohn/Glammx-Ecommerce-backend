const mongoose = require('mongoose')



const otpschema = new mongoose.Schema({
      email: {type: String, required: true,},
      otp: {type: String, required: true,},
}
)

const otpmodel = mongoose.model("otp_collection", otpschema)


module.exports = otpmodel