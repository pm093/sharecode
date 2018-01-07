import axios from 'axios'
const numberOfMsgs = 10;

export const onNewMessage = ({docId, user,content}) => ({
  type:'NEW_MSG',
  docId,
  content,
  user
})
export const sendOwnMessage = ({docId,content,socket}) => (
  (dispatch) => {
    socket.emit('new message',{docId,content})
  }
)
export const onOwnMsg = ({docId,content,username}) => ({
  type:'OWN_MSG',
  docId,
  content,
  username
})
export const initChat = ({docId,messages}) => ({
  type:'INIT_CHAT',
  docId,
  messages,
})
export const gotMsgs = ({docId,messages,userId}) => ({
  type:'GOT_MSGS',
  docId,
  messages,
  userId
})
export const getMsgs = (data) => {
  console.log('getmsg socket: ',data,data.socket);
  return (dispatch) => {
    data.socket.emit('get messages',{docId:data.docId,lastMsgId:data.lastMessageId || '',number:numberOfMsgs})
  }
}
export const collaboratorsToggle = () => ({
  type:'COLLABORATORS_TOGGLE'
})
export const closeAllHistory = () => ({
    type:'CLOSE_ALL_HISTORY'
})
export const openHistoryDoc = ({docId,versionId}) => ({
  type:'OPEN_HISTORY_DOC',
  docId,
  versionId,
})
export const closeHistoryDoc = (docId) => ({
  type:'CLOSE_HISTORY_DOC',
  docId
})
export const closeTab = (id,current) => ({
    type:'CLOSE_TAB',
    id,
    current
})

export const toggleSidebar = () => ({
  type:'TOGGLE_SIDEBAR'
})

export const zeroDocInfo = () => ({
    type:'ZERO_DOC_INFO'
})

const getDocsReq = () => ({
    type:'GET_DOCS_REQ'
})
const getDocsSuc = (ownDocs,foreignDocs) => ({
    type:'GET_DOCS_SUC',
    ownDocs,
    foreignDocs,
    suc:false,
})
const getDocsErr = () => ({
    type:'GET_DOCS_ERR',
    err:'could not load your documents'
})
export const getDocs=() => {
  return (dispatch) => {
    dispatch(getDocsReq());
    axios({
      method:'get',
      url:'api/docs',
    })
    .then((res) => {
      console.log(res);
      dispatch(getDocsSuc(res.data.ownDocs,res.data.foreignDocs));
    })
    .catch((err) => {
      console.log(err);
      dispatch(getDocsErr())
    })
  }
}
const getForeignDocsSuc = (foreignDocs) => ({
  type:'GET_FOREIGN_DOCS_SUC',
  foreignDocs
})
const getForeignDocsErr = (err) => ({
  type:'GET_FOREIGN_DOCS_ERR',
  err
})
export const getForeignDocs = (socket=false,socketData) => {
  return (dispatch) => {
    if (socket && socketData) {
      return dispatch(getForeignDocsSuc(socketData))
    }
    axios({
      method:'get',
      url:'/api/docs?filter=foreign'
    })
    .then((res) => {
      dispatch(getForeignDocsSuc(res.data.docs));
    })
    .catch((err) => {
      dispatch(getForeignDocsErr());
    })
  }
}

const postDocReq = () => ({
    type:'POST_DOC_REQ'
})
export const postDocSuc = (doc) => ({
    type:'POST_DOC_SUC',
    doc,
    suc:'document was added'
})
const postDocErr = () => ({
    type:'POST_DOC_ERR',
    err:'document was not added'
})
export const postDoc=(title,content) => {
  return (dispatch) => {
    dispatch(postDocReq());
    axios({
      method:'post',
      url:'api/docs',
      data:{
        title,
        content
      }
    })
    .then((res) => {
      dispatch(postDocSuc(res.data.doc));
      dispatch(openDoc(res.data.doc._id))
    })
    .catch(() => {
      dispatch(postDocErr())
    })
  }
}

export const changeSyntax = (syntax) => ({
  type:'CHANGE_SYNTAX',
  syntax,
})
const getHistory = (id,history) => ({
  type:'GET_HISTORY',
  id,
  history
})
export const openDoc = (id,getHis) => {
  return (dispatch) => {
    dispatch({
      type:'OPEN_DOC',
      id
    });
    console.log('ii',getHis);
    if (getHis) {
      console.log('warunek open doc ptrue');
      axios({
        method:'get',
        url:'/api/history/'+id,
      })
      .then((res) => {
        dispatch(getHistory(id,res.data.versions))
      })
      .catch((err) => {
        console.log('error form getHistory ',err);
      })

    }
  }
}

const changeDocLocally = (id,content,external) => ({
  type:'CHANGE_DOC',
  id,
  content,
  external,
})
export const changeDoc = ({id,content,socket,users}) => {
  console.log(id,content,socket,external,users);
  return (dispatch) => {
    dispatch(changeDocLocally(id,content));
    socket.emit('changeDoc',{id,content,users});
  }
}
export const changedDocWs = ({userId,docId,content}) => ({
  type:'CHANGED_DOC_WS',
  userId,
  docId,
  content
})
const delDocSuc = (id,deleted) => ({
  type:'DEL_DOC_SUC',
  id,
  suc: deleted ? 'document was deleted' : 'unsubscribed document'
})
const delDocErr = () => ({
  type:'DEL_DOC_ERR',
  err:'could not delete this document'
})
export const deleteDoc = (id,socket) => {
  return (dispatch) => {
    axios({
      method:'delete',
      url:'api/docs/'+id,
    })
    .then((res) => {
      socket.emit('user unjoined',{id:res.data.id});
      dispatch(delDocSuc(res.data.id,res.data.removed))
    })
    .catch((err) => {
      dispatch(delDocErr())
    })
  }
}
export const updateDocSuc = (id,version) => ({
  type:'UPDATE_DOC_SUC',
  suc:'document was updated',
  id,
  version
})
export const unNew = () => ({
  type:'UNNEW',
  
})
const updateDocErr = () => ({
  type:'UPDATE_DOC_ERR',
  suc:'document could not be updated',
})
export const addVersion = (version,username,title) => ({
  type:'ADD_VERSION',
  version,
  username,
  title
})
// export const updateDoc = (id,content,socket) => {
//   return (dispatch) => {
//     axios({
//       method:'put',
//       url:'api/docs/'+id,
//       data:{
//         content,
//       }
//     })
//     .then((res) => {
//       dispatch(updateDocSuc(res.data.doc._id));
//       socket.emit('updated doc',{doc:res.data.doc})
//       console.log('dualo sie zaktualizwac doc ',res)
//     })
//     .catch((err) => {
//       dispatch(updateDocErr());
//       console.log('nie udalo sie zaktualizowac ',err);
//     })
//   }
// }
export const updateDoc = ({docId,content,socket}) => {
  return (dispatch) => {
    socket.emit('update doc',{docId,content})
  }
}
const joinDocSuc = (doc) => ({
  type:'JOIN_DOC_SUC',
  doc,
  suc:""
})
const joinDocErr = () =>({
  type:'JOIN_DOC_ERR',
  err:""
})
export const joinDoc = (id,socket) => {
  return (dispatch) => {
    axios({
      method:'put',
      url:'api/docs/adduser'+id,
    })
    .then((res) => {
      dispatch(joinDocSuc(res.data.doc));
      socket.emit('user joined',{doc:res.data.doc});
      console.log('dualo sie zaktualizwac doc ',res)
    })
    .catch((err) => {
      dispatch(joinDocErr());
      console.log('nie udalo sie dolaczyc ',err);
    })
  }
}
export const onUserJoined = (docId,user,docTitle) => ({
  type:'ON_USER_JOINED',
  docId,
  user,
  docTitle
})
export const onUserUnjoined = (docId,user,docTitle) => ({
  type:'ON_USER_UNJOINED',
  docId,
  user,
  docTitle
})
export const showColV = (docId,userId) => ({
  type:'SHOW_COL_V',
  docId,
  userId
})
export const setInWorkspaceMode = () => ({
  type:'SET_IN_WORKSPACE_MODE',
})
export const cloneDoc = (docId,content) => ({
  type:'CLONE_DOC',
  docId,
  content,
})
const getNotificationsSuc = (notifications) => ({
 type:'GET_NOTIFICATIONS_SUC',
 notifications, 
})
export const getNotifications  = () => {
  console.log('getNotifications')
  return (dispatch) => {
    axios({
      method:'get',
      url:'api/notifications',
    })
    .then((res) => {
      console.log('getnotifications res', res)
      dispatch(getNotificationsSuc(res.data.notifications))
    })
    .catch((err) => {
      console.log('getnotifications err', err)
    })
  }
}