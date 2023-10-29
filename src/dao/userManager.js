const User = require("./models/userModel");



const getUser = async (uid) =>{
    return await User.findById(uid);
}


module.exports = getUser