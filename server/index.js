import express from 'express'
import path from 'path'
import webpack from 'webpack'
import webpackMiddleware from 'webpack-dev-middleware'
import webpackConfig from '../webpack.config'
import keys from './config/keys.js'
import cookieSession from 'cookie-session'
import passport from 'passport'
import mongoose from 'mongoose'
import authRoutes from './routes/auth-routes'
import passportSetup from './config/passport-setup'
import apiRoutes from './routes/api-routes'
import authMiddleware from './middlewares/auth'
import bodyParser from 'body-parser'
import http from 'http'
const socketServer = require('socket.io');
import Doc from './models/doc-model'
import User from './models/user-model'
import Chat from './models/chat-model'
import Version from './models/version-model'
import passportSocketIo from 'passport.socketio'
import cookieParser from 'cookie-parser';
import cookie from 'cookie'
import expressSession from 'express-session'
import sharedSession from 'express-socket.io-session'
import busboyBodyParser from 'busboy-body-parser'
import notificationsBox from './models/notificationsBox-model'
import _ from 'lodash'
import __ from './helperMethods'
const MongoStore = require('connect-mongo')(expressSession)


const app = express();


app.use(express.static(__dirname + '/public'))
app.use(webpackMiddleware(webpack(webpackConfig)));


app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(keys.mongodb.dbURI,{useMongoClient:true}, () => {
  console.log('podlaczoono do mongobd');
})
mongoose.Promise = global.Promise;
const sessionStore =  new MongoStore({mongooseConnection:mongoose.connection})
const session = expressSession({
  store:sessionStore,
  secret:'test',
  resave:false,
  saveUninitialized:true,
  cookie:{secure:false},
  key:'express.sid'
});
app.use(session)
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(busboyBodyParser());
app.use('/auth', authRoutes);
app.use('/api',authMiddleware,apiRoutes);


app.get('/welcome',(req,res) => {
  res.sendFile(path.join(__dirname,'/public/welcome.html'))
})
app.get('/',authMiddleware,(req,res)=>{
  console.log(req.user);
  res.sendFile(path.join(__dirname,'index.html'))
})

const server = http.createServer(app);
const io = socketServer(server);
io.use(passportSocketIo.authorize({
  key:'express.sid',
  secret:'test',
  store:sessionStore,
}))
// io.use(sharedSession(session,{autoSave:true}))
// io.use((socket,next) => {
//   console.log('socket middleware wlaczony',socket.handshake);
//   // if (socket.handshake.session.passport.user) {
//   //   console.log('jest user w naglowkach');
//   //   next();
//   // }
//
//   next();
// })
// io.use((socket,next) => {
//   console.log('middleware socket',socket.handshake);
// var x =   cookieParser.signedCookies(cookie.parse(socket.handshake.headers.cookie),'test');
// console.log('dane',x);
// })

let connections = {};
let connectionsReversed = {};
io.on('connection',(socket) => {

  connections = {...connections, [socket.request.user._id]:socket.id,};
  connectionsReversed = {...connectionsReversed, [socket.id]:socket.request.user._id};
  console.log('polaczenia dodanie ',connections);
  socket.on('disconnect',() => {
    connections = _.omit(connections,socket.request.user._id);
    console.log('polaczenia odjecie',connections);
  })
  socket.on('changeDoc',({id,content,users}) => {
    console.log('got changed doc message by websocket from: ',socket.request.user._id);
     for(const userID in connections){
       if (__.contains(users,userID)) {

         console.log('change doc event fired',socket.request.user._id,id,content);
         socket.broadcast.to(connections[userID]).emit('changeDoc',{docId:id,content,userId:socket.request.user._id})
       }
     }
  })
  socket.on('searchForeignDocs',({query}) => {
    Doc.find({"title":{$regex : '.*'+query+'.*',$options:'i'},usersIds:{$ne:socket.request.user._id}})
       .then((docs) => {
         docs=docs.map((doc) => {
           return{
             title:doc.title,
             id:doc._id
           }
         })
         console.log('emit searchForeignDocsResult');
         return socket.emit('searchForeignDocsResult',{docs})
       })
       .catch(() => {
         console.log('blad search foreign docs socket',err);
       })
  })
  socket.on('test',() => {
    console.log('SCOKET DZIALA');
    socket.emit('got test message')
  })
  socket.on('user joined',({doc})=>{
    for(const userID in connections){
      if (__.contains(doc.usersIds,userID)) {
        console.log('socket user joined: ', doc._id, socket.request.user );
        socket.broadcast.to(connections[userID]).emit('user joined',{docId:doc._id,user:socket.request.user,docTitle:doc.title})
      }
    }
  })
  socket.on('user unjoined',({id})=>{
    Doc.findById(id,(err,doc) => {
      if (!err && doc!=null) {
        for(const userID in connections){
          if (__.contains(doc.usersIds,userID)) {
            socket.broadcast.to(connections[userID]).emit('user unjoined',{docId:id,user:socket.request.user,docTitle:doc.title})
          }
        }
      }
    })
  })
  socket.on('new message',({content,docId})=>{
    Chat.find({docId:docId})
        .then((chat) => {
          console.log('czat rowny', chat);
          if (chat.length===0 || chat==null) {
            chat = new Chat({
              docId,
              messages:[
                {
                  userId:socket.request.user._id,
                  content,
                  date:Date.now(),
                }
              ]
            })
          }
          else {
            console.log('chat2',chat);
            chat = chat[0];
            chat.messages.unshift({
            userId:socket.request.user._id,
            content,
            date:Date.now()
          })}
          chat.save()
              .then(() => {
                Doc.findById(docId,(err,doc) => {
                  if (err) {
                    console.log('new message WS error ',err);
                  }
                  socket.emit('own message',{docId,content,username:socket.request.user.username})
                  for (const userID in connections){
                    if (__.contains(doc.usersIds,userID)) {
                      socket.broadcast.to(connections[userID]).emit('new message',{docId, user:socket.request.user,content})
                    }
                  }
                })
              })
        })
  })

  socket.on('get messages',({lastMsgId,docId,number}) => {
    let msgs=[];
    let msgsToSend;
    Chat.find({docId:docId})
        .then((chat) => {

          if (chat.length===0) {
            return socket.emit('get messages',{docId,messages:[]})
          }
          let index;
          if (lastMsgId!=='') {

            index = chat[0].messages.findIndex((message) => {
              return message._id==lastMsgId;
            })+1
          }
          else{
            index = 0;
          }
          console.log('INDEX: ',index);
          msgsToSend = chat[0].messages.slice(index,number+index);
        })
        .then(() => {
          new Promise((resolve,reject) => {
            let licznik = 0;
            msgsToSend.forEach((message) => {
              let msg = JSON.parse(JSON.stringify(message));
              msg.own = message.userId==socket.request.user._id ? true : false;
              User.findById(message.userId).exec().then((message2) => {
                msg.username = message2.username;
                msgs.push(msg);
                licznik++;
                if (licznik==msgsToSend.length) {
                  resolve()
                }
              })
            })
          })
          .then(() => {
            console.log('msgs before emit : ',msgs);
            socket.emit('got messages',{docId,messages:msgs.sort((message1,message2) => {
                                                                          let date1 = new Date(message1.date);
                                                                          let date2 = new Date(message2.date);
                                                                          return date1-date2;
                                                                        })})
          })
        })
  })
  socket.on('update doc',({docId,content}) => {
    Doc.findById(docId,(err,doc) => {
      if (!err && doc) {
        if (doc.usersIds.indexOf(socket.request.user._id)!==-1) {
          doc.content = content;
          Promise.all([
            doc.save(),
            new Version({
              docId,
              content,
              author:{
                id:socket.request.user._id,
                username:socket.request.user.username
              }
            }).save()
          ]).then((data) => {
            console.log('updateowndoc doc:', data[0]);
            socket.emit('update own doc suc', {doc:data[0],version:data[1]});
            console.log('update doc users',doc.usersIds);
            notificationsBox.find({userId:{$in:data[0].usersIds}})
                            .then((boxes) => {
                              console.log('boxes', boxes)
                              console.log('users ids', data[0].usersIds)
                              boxes.forEach((box) => {
                                console.log('box',box)
                                if(box.userId!=socket.request.user._id)
                                  {
                                   box.messages.push({message:`${socket.request.user.username} updated ${data[0].title}`})
                                    box.save().then((newBox) => {
                                      console.log('new box', newBox)
                                    })
                                  }
                              })   
                            })
            for (const userID in connections){
              if (__.contains(doc.usersIds,userID)) {
                socket.broadcast.to(connections[userID]).emit('new version',{version:data[1],username:socket.request.user.username,title:data[0].title})
              }
            }
          })
        }
      }
    })
  })
  // socket.on('unsubscribe',({docId}) => {
  //   Doc.findById(docId,(err,doc) => {
  //     if (!err && doc.usersIds.indexOf(socket.request.user._id) !== -1) {
  //       if (doc.usersIds.length>1) {
  //         doc.users = doc.users.filter((user) => {
  //           return user.id!=socket.request.user._id;
  //         })
  //         doc.usersIds = doc.usersIds.filter((id) => {
  //           return id!=socket.request.user._id;
  //         })
  //         doc.save().then(() => {
  //           socket.emit('you unsubscribed',{id:docId,removed:false});
  //           for (const userID in connections){
  //             if (__.contains(doc.usersIds,userID)) {
  //               socket.broadcast.to(connections[userID]).emit('member unsubscribed',{username:socket.request.user,docId})
  //             }
  //           }
  //         })
  //       }
  //       else if (doc.userIds.length===1) {
  //         doc.remove().then(() => {
  //           socket.emit('deleted doc',{id:docId,removed:true})
  //         })
  //       }
  //     }
  //   })
  // })
})
server.listen(process.env.PORT || 3000);
