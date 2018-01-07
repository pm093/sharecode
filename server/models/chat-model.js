import mongoose,{Schema} from 'mongoose'

const chatSchema = new Schema({
  docId:{type:String,unique:true},
  messages:[{
    userId:String,
    content:String,
    date:Date
  }]
})

const chat = mongoose.model('chat',chatSchema);
export default chat;
