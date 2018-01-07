import express from 'express';
const router = express.Router();
import Doc from '../models/doc-model';
import User from '../models/user-model';
import notifications from '../models/notificationsBox-model';
import Version from '../models/version-model';
import bcrypt from 'bcrypt';
import __ from '../helperMethods.js';
import { CANCELLED } from 'dns';
import fs from 'fs';
import { ifError } from 'assert';
import { log } from 'util';

router.get('/docs',(req, res) => {

  if (req.query.filter==='foreign') {
    Doc.find({users:{$ne:req.user._id}})
       .then((docs) => {
         return res.status(200).json({
           docs
         })
       })
      .catch((err) => {
        return res.status(400).json({
          err
        })
      })
  }
  let ownDocs = Doc.find({usersIds:req.user._id})
  let foreignDocs = Doc.find({usersIds:{$ne:req.user._id}})
  Promise.all([ownDocs,foreignDocs])
  .then((data) => {console.log('data calowsciowa',data);console.log('data pierwszy promis ', data[0]);
    foreignDocs=data[1].map((doc) => {
      return {
        title:doc.title,
        id:doc._id
      }
    })
    console.log('data od 0',data[0]);
    ownDocs = data[0].map((doc) => {
      const users = [];
      doc.users.forEach((user) => {
        if (user.id!=req.user._id) {
          users.push(user);
        }
      })
     return {
       usersIds:doc.usersIds,
       title:doc.title,
       content:doc.content,
       _id:doc._id,
       users:users
     }
   });
    return res.status(200).json({
      ownDocs,
      foreignDocs,
    })
  })
  .catch((err) => {
    console.log(err);
    return res.status(400).json({
      err,
    })
  })
})

router.post('/docs',(req,res) => {
  console.log('zadanie: ', req);
  new Doc({
    title:req.body.title,
    users:[{id:req.user.id,name:req.user.username,thumbnail:req.user.thumbnail}],
    usersIds:[req.user.id],
  }).save()
    .then((newDoc) => {
      console.log('dodano nowy doc',newDoc);
      newDoc.users = newDoc.users.filter((user) => {
        if (user.id!==req.user.id) {
          return true;
        }
        return false;
      })
      return res.status(200).json({
        doc:newDoc
      });
    })
    .catch((err) => {
      console.log(err);
      return res.status(400).json({
        err,
      });
    })
})

router.put('/docs/adduser:id',(req,res) => {
  Doc.findById(req.params.id,(err,doc) => {
    if (err) {
      console.log('blad ',err)
      return res.status(400).json({
        err
      });
    }
    console.log('talbica autorwo: ',doc.users);
    console.log('id zmieniacjacego', req.user._id);
    let docToSend = JSON.parse(JSON.stringify(doc))
    doc.users=[
      ...doc.users,
      {
        id:req.user.id,
        name:req.user.username,
        thumbnail:req.user.thumbnail
      }
    ]
    doc.usersIds = [
      ...doc.usersIds,
      req.user.id
    ]
    doc.save()
       .then((updatedDoc) => {
         console.log('updated doc: ',updatedDoc);
         return res.status(200).json({
           doc:docToSend,

         })
       })
       .catch((err) => {
         console.log('blad', err);
         return res.status(400).json({
           err
         })
      })
  })
})

router.put('/docs/:id',(req,res) => {
  console.log(req.params.id);
  console.log(req.body.content);
  Doc.findById(req.params.id,(err,doc) => {
    if (err) {
      console.log('blad ',err)
      return res.status(400).json({
        err
      });
    }
    console.log('talbica autorwo: ',doc.users);
    console.log('id zmieniacjacego', req.user._id);
    if(doc.usersIds.indexOf(req.user._id) === -1){
      console.log('index of usersi',doc.users,req.user._id);
      return res.status(401).end();
    }
    doc.content = req.body.content;
    Promise.all([
      doc.save(),
      new Version({
        docId:req.params.id,
        content: req.body.content,
        author:{
          id:req.user.id,
          username:req.user.username
        }
      }).save()
    ])
       .then((data) => {
         let updatedDoc= data[0];
         console.log('updated doc: ',updatedDoc);
         return res.status(200).json({
           doc:updatedDoc
         })
       })
       .catch((err) => {
         console.log('blad', err);
         return res.status(400).json({
           err
         })
      })
  })
})

router.delete('/docs/:id', (req,res)=>{
  Doc.findById(req.params.id,(err,doc) => {
    if (err) {
      return res.status(400).end()
    }
    if(doc.usersIds.indexOf(req.user._id) === -1){

      return res.status(401).end();
    }
    if(doc.users.length>1){
      console.log('if sie odpalil, liczba subskrybentow: ',doc.users.length);

     doc.users = doc.users.filter((user) => {
       return user.id!=req.user._id;
     })
     doc.usersIds = doc.usersIds.filter((id) => {
       return id!=req.user._id;
     })
     console.log('userzy po filterze- count ',doc.users.length)
     console.log('doc po filttze',doc.usersIds);
     return doc.save()
        .then((doc) => {
          notifications.find({userId:{$in:doc.userIds}}).then((boxes) => {
            boxes.forEach((box) => {
              box.messages.push({message:`${req.user.username} unsubscribed ${doc.title} `}).save()
            })
          })
          return res.status(200).json({
            id:req.params.id,
            removed:false,
          })
        })
        .catch((err) => {
          console.log('nie moge odsubskryowac :(');
          return res.status(200).end();
        })
    }
    return doc.remove()
    .then(() => {
      console.log('usunieto then');
      return res.status(200).json({
        id:req.params.id,
        removed:true,
      });
    })
    .catch((err) => {
        console.log('nie usunieto...',err)
        return res.status(400).end();
    });
  })
})

router.get('/history/:docId',(req,res) => {
  Version.find({docId:req.params.docId})
         .sort({date:'descending'})
         .exec((err,versions) => {
           if (err) {
             console.log('get history/docId ERROR ',err);
             return res.status(400).end();
           }
           console.log('get history/docId OK');
           return res.status(200).json({
             versions,
           })
         })

})

router.post('/history/:docId',(req,res) => {
  new Version({
    docId:req.params.docId,
    content: req.body.content,
    author:{
      id:req.user.id,
      username:req.user.username
    }
  }).save()
    .then((version) => {
      return res.status(200).end()
    })
    .catch((err) => {
      console.log(err);
      return res.status(400).end();
    })
})

router.post('/upload', (req,res) => {
  console.log('upload file request content', req.files.file.data.toString('utf8'))
    new Doc({
    title:req.files.file.name,
    users:[{id:req.user.id,name:req.user.username,thumbnail:req.user.thumbnail}],
    usersIds:[req.user.id],
    content:req.files.file.data.toString('utf8'),
    extension:req.files.file.name.split('.').slice(-1)[0],
    })
    .save()
    .then((doc) => {
      doc.users = doc.users.filter((user) => {
        if (user.id!==req.user.id) {
          return true;
        }
        return false;
      })
      new Version({
        docId:doc._id,
        content:doc.content,
        author:{
          username:req.user.username,
          id:req.user.id,
        }
      })
      .save()
      .then((version)=>{
        res.status(200).json({
          doc,
          version,
        })
      })
    })
})

router.get('/download/:id',(req,res) => {

  let content,fileName;
  if (req.query.type ==='doc')
  {
    Doc.findById(req.params.id,(err,doc) => {
      console.log('document form download', doc,req.params.id)
      if(doc.usersIds.indexOf(req.user._id) === -1){
        return res.status(401).end();
      }
      content = doc.content;
      console.log('content of downloaded file' ,content)
      fileName = doc.title;
      console.log('typeof ',typeof(content) )
      res.setHeader('Content-disposition', `attachment; filename='document.css'`);
      res.setHeader('Content-type', 'text/plain');
      res.end(content);
    })
  }
  else if (req.query.type ==='version') {
    Version.findById(req.params.id,(err,version) => {
      content = version.content;
      Doc.findById(version.docId,(err,doc) => {
        if(doc.usersIds.indexOf(req.user._id) === -1){
          return res.status(401).end();
        }
        console.log('typeof ',typeof(content) )
        res.setHeader('Content-disposition', `attachment; filename='document'`);
        res.setHeader('Content-type', 'text/plain');
        console.log('wysylamy!',content)
        res.end(content);
      })
    })
  }
})

router.get('/notifications',(req,res) => {
  console.log('getnotifications route')
    notifications.findOne({userId:req.user._id}).then((data) => {
      console.log('data notifications', data)
      if(data.length===0) return res.status(204).end()
      return res.status(200).json({
        notifications:data.messages
      })
    })
})

export default router;
