import mongoose,{Schema} from 'mongoose';

const versionSchema = new Schema({
      docId:String,
      content:String,
      date:{type:Date, default: Date.now},
      author:{
        _id:false,
        username:String,
        id:String,
      }
})
const Version = mongoose.model('version',versionSchema);
export default Version;
