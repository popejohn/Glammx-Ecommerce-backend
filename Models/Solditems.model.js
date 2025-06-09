const mongoose = require('mongoose');




const soldItemsSchema = new mongoose.Schema({
    itemname: {type: String, required: true},
    itemprice: {type: Number, required: true},
    itemquantity: {type: Number, required: true},
    itemimage: {type: String, required: true},
    datesold: {type: Date, default: Date.now},
    vendor: {type: String,},
})



const soldItemsModel = mongoose.model('soldItems', soldItemsSchema);


module.exports = soldItemsModel
