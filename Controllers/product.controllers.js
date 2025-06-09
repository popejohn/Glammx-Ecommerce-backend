const mongoose = require('mongoose')
const productmodel = require('../Models/product.model')
const db = require('../Firebase/firebase')



const saveFirebaseData = async(req, res) => {
    try {
        const productsRef = db.collection("Products");  // Firestore collection
        const snapshot = await productsRef.get();
    
        snapshot.forEach(async (doc) => {
          const data = doc.data();
          const product = new productmodel({
            category: data.category,
            gender: data.gender,
            images: data.images,
            price: Number(data.price),
            sleeve: data.sleeve,
            stock: data.stock,
            title: data.title,
          });
    
          try {
            await product.save();
            console.log(`Saved product: ${product.title}`);
          } catch (error) {
            console.error(`Error saving product ${product.title}:`, error);
          }
        })
        res.status(200).json({message: "data saved successfully", status: true})
      } catch (err) {
        res.status(500).json({ error: "Error importing data from Firebase" });
      }
}



const getdata = async(req, res) => {
  try {
    const allproducts = await productmodel.find()
    if (allproducts){
      res.status(200).json(allproducts);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({message: "error accessing data from database", status:false})
  }
}


const viewProduct = async(req, res) => {
    const {id} = req.params
    try {
        if (!id) {
            return res.status(400).json({message: "Product id is required", status: false})
        }
        const product = await productmodel.findOne({_id: id})
        if (!product) {
            return res.status(404).json({message: "Product not found", status: false})
        }
        return res.status(200).json({message: "Product found", status: true, product})
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({message: "Product could not be found", status: false})
    }

}



module.exports = {saveFirebaseData, getdata, viewProduct }