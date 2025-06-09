const favoritemodel = require('../Models/favorites.model')
const orderModel = require('../Models/orders.model')
const productModel = require('../Models/product.model')
const soldItemsModel = require('../Models/Solditems.model')
const jwt = require('jsonwebtoken')




const getFavorites = async (req, res) => {
    const token = req.headers.authorization.split(" ")[1]
        try {
            const decoded = await jwt.verify(token, process.env.JWTSECRET)
            const user = decoded.email
            
            if (!user) {
                return res.status(400).json({ message: "token not found" })
            }

            const userfavorites = await favoritemodel.findOne({ user })
            if (!userfavorites) {
                return res.status(400).json({ message: "User has no favorites" })
                }
                
                return res.status(200).json(userfavorites.products)
            
        } catch (error) {
            console.log(error.message);
            return res.status(500).json({ message: "Internal Server Error" })
        }
        
    }   

const addFavorite = async (req, res) => {
    const token = req.headers.authorization.split(" ")[1]
    const { products } = req.body
    
    try {
        const decoded = await jwt.verify(token, process.env.JWTSECRET)
        const user = decoded.email
        const existingFav = await favoritemodel.findOne({ user })
        if (!existingFav) {
            const newuser = await favoritemodel.create({ user, products })
            return res.status(201).json({ message: "User added to favorites" })
            }
        if (existingFav.products.length && !products.length) {
            return res.status(205).json({ message: "No products to add" })
        }
        const updatedFav = {
            user,
            products
        }
        const userfav = await favoritemodel.findOneAndUpdate({user}, updatedFav, {new: true})
            
            return res.status(201).json({ message: "Product added to favorites" })
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: "Internal Server Error" })
    } 

}


const displayFavorites = async (req, res) => {
    const token = req.headers.authorization.split(" ")[1]
    
    try {
        const decoded =await jwt.verify(token, process.env.JWTSECRET)
        if (!decoded) {
            return res.status(401).json({ message: "Invalid token" })
            }
        const user = decoded.email
        const userObject = await favoritemodel.findOne({ user })
        if (!userObject) {
            return res.status(400).json({ message: "User has no favorites" })
        }
        return res.status(200).json(userObject.products)
        
        }catch (error) {
                console.log(error.message)
        }
}


const getCart = async (req, res) => {
    const token = req.headers.authorization.split(" ")[1]
        try {
            const decoded = await jwt.verify(token, process.env.JWTSECRET)
            const user = decoded.email
    
            if (!user) {
                return res.status(400).json({ message: "User not found" })
            }
            const usercart = await orderModel.findOne({ user: user })
            console.log(usercart.orderItems);
            if (!usercart) {
                return res.status(400).json({ message: "User has no favorites" })
                }
                return res.status(200).json(usercart.orderItems)
                
                
            
        } catch (error) {
            console.log(error.message);
            return res.status(500).json({ message: "Internal Server Error" })
        }
        
    }   


const saveToCart = async(req, res) => {
    const token = req.headers.authorization.split(" ")[1]
    
    try {
       const decodeduser = await jwt.verify(token, process.env.JWTSECRET)
       const user = decodeduser.email

       
       if (!user) {
        return res.status(400).json({ message: "User not found" })
        }
        const product = req.body
        
        const savedusercart = await orderModel.findOne({ user: user })
        
        if (!savedusercart) {
            const createCart = await orderModel.create({ user: user, orderItems: product, orderStatus: "pending", orderTotal: product.reduce((acc, item) => {
                return acc + (Number(item.price) * Number(item.quantity))
            }, 0)
        })

            return res.status(202).json({message: "Cart created successfully", status: true})
        }

        if (!product.length && savedusercart.cartItems.length) {
            return res.status(204).json({ message: "No product to update" })
        }        
        const newCart = {
            user,
            orderItems: product,
            orderStatus: savedusercart.orderStatus,
            orderTotal: product.reduce((acc, item) => {
                return acc + (Number(item.price) * Number(item.quantity))
            }, 0)
        }
        const usercart = await orderModel.findOneAndUpdate({ user: user}, newCart, {new: true})
        return res.status(201).json({message: "Cart updated successfully", status:true})
        
    } catch (error) {
        console.log(error.message);
        
    }
    
    
}


const displayCart = async(req, res) =>{
    const token = req.headers.authorization.split(" ")[1]

    try {
        const decoded =await jwt.verify(token, process.env.JWTSECRET)
        if (!decoded) {
            return res.status(401).json({ message: "Invalid token" })
            }
        const user = decoded.email
        const userObject = await orderModel.findOne({ user })
        if (!userObject) {
            return res.status(400).json({ message: "User has no cart" })
        }
        return res.status(200).json(userObject)
        
        }catch (error) {
                console.log(error.message)
        }

}


const deleteCart = async(req, res) =>{
    const token = req.headers.authorization.split(" ")[1]
    const {cartItems} = req.body
    
    try {
        const decoded =await jwt.verify(token, process.env.JWTSECRET)
        if (!decoded) {
            return res.status(401).json({ message: "Invalid token" })
            }
            cartItems.forEach(async(element) => {
                const product = await productModel.findOne({_id: element._id})
                if (element.quantity > product.stock) {
                    return res.status(400).json({ message: "Quantity exceeds stock" })
                }
                product.stock -= element.quantity
                if (product.stock === 0){
                    await productModel.findOneAndDelete({ _id: product._id })
                }
                await product.save()
                const itemsSold = {
                    itemname: element.title,
                    itemprice: element.price,
                    itemquantity: element.quantity,
                    itemimage: element.images[0],
                    vendor: 'Bobtail'
                }
                const solditem = await soldItemsModel.create(itemsSold)
            });
            const user = decoded.email
            const userObject = await orderModel.findOneAndDelete({ user })
            return res.status(200).json({message: "Cart deleted successfully", status:true})
        }
    catch (error){
        console.log(error.message)
    }    

}



module.exports = { getFavorites, addFavorite, displayFavorites, getCart, saveToCart, displayCart, deleteCart }