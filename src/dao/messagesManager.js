const {Message} = require('./models/messageModel')


const saveMessage = async (message) => {
    const newMessage = new Message({
        user: message.user,
        message: message.message
    });
    
    await newMessage.save();
}


const getAllMessages = async () =>{
    const messages = await Message.find({})
    return messages.map(({ user, message }) => ({ user, message }))
}


module.exports = {saveMessage, getAllMessages}