const mongosse = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const adminmodel = require('../Models/Admin.model')
const productmodel = require('../Models/product.model')
const cloudinary = require('../utilities/cloudinary')
const soldItemsModel = require('../Models/Solditems.model')
const usermodel = require('../Models/user.model')
const ordersmodel = require('../Models/orders.model')

sandround = 10



const createAdmin = async (req, res) => {
    try {
        const {companyid, password, profilepic, token} = req.body;
        const existinguser = await adminmodel.findOne({ companyid })
        if (existinguser) {
            return res.status(403).json({message: "User with this company ID already exists.", status: false})
        }
        const hashedPassword = await bcrypt.hash(password, sandround);
        const adminData = { companyid, password: hashedPassword, profilepic, token };
        const newAdmin = await adminmodel.create(adminData);
        if (!newAdmin) {
         return res.status(401).json({message:"admin was not sucessfully created", status: false})
        } 
        return res.status(203).json({message: "admin created successfully", status: true})
    } catch (error) {
        return res.status(507).json({message: error.message, status: false})
    }
  
};



const signinAdmin = async (req, res) => {
    try {
        const {companyid, password } = req.body;
        
        if (!companyid || !password) {
            return res.status(401).json({message: "Invalid company ID or password.", status: false});
        }
        const registeredAdmin = await adminmodel.findOne({ companyid })
        
        const isPasswordValid = await bcrypt.compare(password, registeredAdmin.password);
        if (!isPasswordValid) {
            return res.status(401).json({message: "Invalid company ID or password.", status: false});
        }

        const adminToken = await jwt.sign({ id: companyid }, process.env.ADMINJWT, { expiresIn: "1h" })
        if (!adminToken) {
            console.log("no token");
            
            return res.status(401).json({message: "Cannot generate token", status: false});
        }
        registeredAdmin.token = adminToken
        await registeredAdmin.save()
        
        return res.status(200).json({message: "Signin successful", status: true, adminToken});
    } catch (error) {
        return res.status(500).json({message: error.message, status: false});
    }
}


const dashboard = async(req, res) => {
    const token = req.headers.authorization.split(" ")[1]
    try {
        if (!token){
            return res.status(403).json({message: "Token does not exist", status: false})
        }
        const tokenValid = await jwt.verify(token, process.env.ADMINJWT)
        if (!tokenValid) {
            return res.status(403).json({message: "Token is not valid", status: false})
        }
        const admin = await adminmodel.findOne({companyid: tokenValid.id})
        if (!admin) {
            return res.status(403).json({message: "No admin with given companyid", status: false})
        }
        return res.status(200).json({message: "Admin verified successfully", status: true, companyid: admin.companyid})
    } catch (error) {
        return res.status(500).json({message: "Admin could not be verified", status: false})
    }
}

const uploadProduct = async(req, res) => {

    const {category: {name, image}, gender, title, stock, price, images, sleeve} = req.body
   try {
        if (!name || !image || !gender || !title || !stock || !price || !images || !sleeve) {
            return res.status(405).json({message: "All fields are required", status: false})
        }

        const categoryUrl = await cloudinary.uploader.upload(image)
        const categoryImage = categoryUrl.secure_url

        if (!categoryImage) {
            return res.status(405).json({message: "Category image could not be uploaded", status: false})
        }
    
        const productUrl = await Promise.all(images.map(async(image) => {
            const url = await cloudinary.uploader.upload(image)
            return url.secure_url
        }))
        if (!productUrl) {
            return res.status(405).json({message: "Product image could not be uploaded", status: false})
        }
    
        const product = new productmodel({
            category: {
                name: name,
                image: categoryImage
            },
            gender: gender.toLowerCase(),
            images: productUrl,
            price,
            sleeve: sleeve ? sleeve.toLowerCase() : null,
            stock: Number(stock),
            title,
          });
         const newProduct =  await product.save();
         if (!newProduct) {
            return res.status(405).json({message: "Product could not be uploaded", status: false})
         }
         
         return res.status(200).json({message: "Product uploaded successfully", status: true})
    } catch (error) {
    console.log(error);
        return res.status(500).json({message: error.message, status: false})
    }
    
}


const editProduct = async(req, res) => {
    const {id} = req.params

    const {category: {name, image}, gender, title, stock, price, images, sleeve, _id} = req.body
    
    try {
        if (!id) {
            return res.status(400).json({message: "Product id is required", status: false})
        }
        if (!name || !title || !stock || !price) {
            console.log("fields are required");
            
            return res.status(401).json({message: "All fields are required", status: false})
        }
        const categoryUrl = await cloudinary.uploader.upload(image)
        const categoryImage = categoryUrl.secure_url

        if (!categoryImage) {
            return res.status(402).json({message: "Category image could not be uploaded", status: false})
        }
    
        const productUrl = await Promise.all(images.map(async(image) => {
            const url = await cloudinary.uploader.upload(image)
            return url.secure_url
        }))
        if (!productUrl) {
            return res.status(403).json({message: "Product image could not be uploaded", status: false})
        }
        const product = {category: {
                name: name,
                image: categoryImage
            },
            gender: gender ?gender.toLowerCase() :null,
            images: productUrl,
            price,
            sleeve,
            stock: Number(stock),
            title,
            _id
          };

   const updatedProduct = await productmodel.findOneAndUpdate({_id:id}, product, {new: true})
   if (!updatedProduct) {
    return res.status(405).json({message: "Product could not be updated", status: false})
   }
   return res.status(200).json({message: "Product updated successfully", status: true})
}catch (error){
    console.log(error.message);
    return res.status(500).json({message: "Product could not be updated", status: false})
}
}

const deleteProduct = async(req, res) => {
    const {id} = req.params
    console.log(id);
    
    try {
        if (!id) {
            return res.status(400).json({message: "Product id is required", status: false})
        }
        const deletedProduct = await productmodel.findOneAndDelete({_id: id})
        if (!deletedProduct) {
            return res.status(404).json({message: "Product not found", status: false})
        }
        return res.status(200).json({message: "Product deleted successfully", status: true})
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({message: "Product could not be deleted", status: false})
    }
}


const getSalesData = async (req, res) => {
    
  try {
    const salesData = await soldItemsModel.aggregate([
      {
        $project: {
          year: { $year: "$datesold" },
          month: { $month: "$datesold" },
          total: { $multiply: ["$itemprice", "$itemquantity"] }
        }
      },
      {
        $group: {
          _id: { year: "$year", month: "$month" },
          monthlySales: { $sum: "$total" }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);
    
    return res.status(200).json(salesData);
  } catch (error) {
    console.log(error.message);
    
    return res.status(500).json({ message: error.message });
  }
};


const getUsersData = async (req, res) => {
    
  try {
    const usersData = await usermodel.aggregate([
      {
        $project: {
          year: { $year: "$datejoined" },
          month: { $month: "$datejoined" },
        }
      },
      {
        $group: {
          _id: { year: "$year", month: "$month" },
          newusers: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);
    
    return res.status(200).json(usersData);
  } catch (error) {
    console.log(error.message);
    
    return res.status(500).json({ message: error.message });
  }
};

const getCategoryStock = async (req, res) => {
  try {
    const stockData = await productmodel.aggregate([
      {
        $group: {
          _id: "$category.name", // group by category name
          totalStock: { $sum: "$stock" } // sum all stock in that category
        }
      },
      {
        $sort: { totalStock: -1 } // optional: sort descending by stock
      }
    ]);
    console.log(stockData);
    return res.status(200).json(stockData);
  } catch (error) {
    console.error("Category stock aggregation error:", error);
    return res.status(500).json({ message: error.message });
  }
};

const dashboardData = async (req, res) => {

  try {
    // Total sold
    const allSoldProducts = await soldItemsModel.find()
    const productsSold = allSoldProducts.length
    const totalSold = allSoldProducts.reduce((acc, item) =>{
      return acc + item.itemprice * item.itemquantity
    }
    , 0);
    
    const totalUsers = (await usermodel.find()).length;
    const pendingOrders = (await ordersmodel.find({ status: "pending" })).length;
    const totalStock = await productmodel.aggregate([
      {
        $group: {
          _id: null,
          totalStock: { $sum: "$stock" }
          }
          }
      ]);
      const allStock = totalStock[0].totalStock;
      
    return res.status(200).json({message: 'successfully gotten display data', productsSold, totalSold, totalUsers, pendingOrders, allStock});
  } catch (error) {
    console.log(error.message);
  }

}




module.exports = { createAdmin, signinAdmin, dashboard, uploadProduct, editProduct, deleteProduct, getSalesData, getUsersData, getCategoryStock, dashboardData }