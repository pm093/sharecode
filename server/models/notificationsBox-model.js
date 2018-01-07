import mongoose from 'mongoose'
const Schema = mongoose.Schema;



const notificationsBoxSchema = new Schema ({
  userId:String,
  messages:[
      {
          _id:false,
          message:String,
          date:{type:Date, default: Date.now},
          read:{type:String, default: false}
      }
  ]
});

const notificationsBox = mongoose.model('notificationsBox',notificationsBoxSchema);

export default notificationsBox;