import mongoose from 'mongoose'
const Schema = mongoose.Schema;

const docSchema = new Schema({
  title:String,
  content:String,
  usersIds:[String],
  extension:String,
  users:[{
    id:String,
    name:String,
    thumbnail:String, 
    _id:false,
  }],
})

const Doc = mongoose.model('doc',docSchema);

export default Doc;
