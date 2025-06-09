const mongoose = require('mongoose');


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
      quantity: {type: Number, required: true,},
    }, {timestamps: true}
)


const orderSchema = new mongoose.Schema({
    user: {type: String, required: true},
    orderItems: [productSchema],
    orderTotal: {type: Number, required: true},
    orderStatus: {type: String, enum: ["pending", "shipped", "delivered"]}
    }, {timestamps: true})



const orderModel = mongoose.model('user_orders', orderSchema)


module.exports = orderModel
