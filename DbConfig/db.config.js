const mongoose = require('mongoose')




const connection = async() => {
    try {
        const connect = await mongoose.connect(process.env.myURI)
        if (connect) {
            console.log("Connected to database successfully");
        }
    } catch (error) {
        console.log(error.message);
        
    }
}



module.exports = connection