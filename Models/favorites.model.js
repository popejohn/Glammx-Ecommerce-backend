const mongoose = require('mongoose')


const productSchema = new mongoose.Schema({
      category: {
        name: {type: String, required: true,},
        image: {type: String,},
      },
      gender: {type: String, enum: ["men", "women", "male", "female", "unisex"]},
      images: {type: [String], validate: [val => val.length >= 2, "Exactly 3 images are required"], required: true,},
      price: {type: String, required: true,},
      sleeve: {type: String, enum: ["short", "long", "sleeveless"]},
      stock: {type: Number, default: 0, required: true,},
      title: {type: String,},
    }, {timestamps: true}
)
const favoriteschema = new mongoose.Schema({
      user: {type: String, required: true},
      products: [productSchema]
    }, {timestamps: true}
)

const favoritemodel = mongoose.model("user_favorites", favoriteschema)


module.exports = favoritemodel