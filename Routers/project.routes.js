const express = require('express')
const projectroutes = express.Router()




const { saveFirebaseData, getdata, viewProduct } = require('../Controllers/product.controllers')
const { getAllUsers, registerNewUser, signinUser, verifyUser, confirmEmail, resetPassword, uploadImage, editUser, logoutUser } = require('../Controllers/user.controllers')
const { createAdmin, signinAdmin, dashboard, uploadProduct, editProduct, deleteProduct, getSalesData, getUsersData, getCategoryStock , dashboardData} = require('../Controllers/Admin.controllers')
const { getFavorites, addFavorite, displayFavorites, getCart, saveToCart, displayCart, deleteCart } = require('../Controllers/favorites.controllers')



projectroutes.get('/landingpage', saveFirebaseData)
projectroutes.get('/allproducts', getdata)
projectroutes.get('/users', getAllUsers)
projectroutes.post('/user/signup', registerNewUser)
projectroutes.post('/user/login', signinUser)
projectroutes.get('/user/verify', verifyUser)
projectroutes.post('/user/confirmemail', confirmEmail)
projectroutes.post('/user/resetpassword', resetPassword)
projectroutes.post('/admin/signup', createAdmin)
projectroutes.post('/admin/signin', signinAdmin)
projectroutes.get('/admin/dashboard', dashboard)
projectroutes.post('/admin/productupload', uploadProduct)
projectroutes.post('/admin/editproduct/:id', editProduct)
projectroutes.post('/admin/deleteproduct/:id', deleteProduct)
projectroutes.get('/viewproduct/:id', viewProduct)
projectroutes.post('/user/uploadimage', uploadImage)
projectroutes.post('/user/edit', editUser)
projectroutes.get('/getfavorites', getFavorites)
projectroutes.post('/addfavorites', addFavorite)
projectroutes.get('/user/favorites', displayFavorites)
projectroutes.get('/getcart', getCart)
projectroutes.post('/savecart', saveToCart)
projectroutes.get('/cart', displayCart)
projectroutes.post('/checkout', deleteCart)
projectroutes.post('/logout', logoutUser)
projectroutes.get('/saleschart', getSalesData)
projectroutes.get('/userschart', getUsersData)
projectroutes.get('/categorychart', getCategoryStock)
projectroutes.get('/displays', dashboardData)









module.exports = projectroutes