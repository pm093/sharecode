import {combineReducers} from 'redux';

const elements = (state=[],action) => {
  switch (action.type) {
    case 'GET_DOCS_SUC':
      return action.ownDocs.map((doc) => {
          return {
            ...doc,
            eUpdate:false,
            iUpdate:false,
            inTabs:false,
            users:doc.users.map((user) => {
              return {
                ...user,
                content:false,
                new:false,
                active:false,
              }
            }),
          }
        })

      case 'JOIN_DOC_SUC':
        return [
          ...state,
          {...action.doc},
        ]
    case 'UPDATE_DOC_SUC':
      return state.map((doc) => {
          if (doc._id===action.id) {
            return {
              ...doc,
              iUpdate:false,
            }
          }
          return {
              ...doc,
          }
        }
      )
    case 'POST_DOC_SUC':
      return [
        {
          ...action.doc,
          inTabs:true,
        },
        ...state
      ]
    case 'OPEN_DOC':
      return state.map((doc) => {
          if (doc._id===action.id) {
            return {
              ...doc,
              open:true,
              inTabs:true,
              eUpdate:false,
            }
          }
          return {
            ...doc,
            open:false,
          }
        })
    case 'CHANGE_DOC':
      return state.map((doc) => {
        if (doc._id===action.id) {
          return {
            ...doc,
            iUpdate:true,
            eUpdate:false,
            content:action.content,
          }
        }
        return {
          ...doc
        }
      })
    case 'DEL_DOC_SUC':
        let once = true;
        let docs = []
        state.forEach((doc) => {
        if (doc._id!==action.id) {
            if (!doc.inTabs || !once) {
              docs.push(doc)
            }
            else{
              once=false;
              docs.push({...doc,open:true})
            }
          }
       })
       return docs;

    case 'CHANGED_DOC_WS':
      return state.map((doc) => {
        if (doc._id==action.docId) {
          console.log('pierwszy warunek');
          return {
            ...doc,
            eUpdate:true,
            users: doc.users.map((user) => {
              if (user.id==action.userId) {
                console.log('drugi warunek');
                return {
                  ...user,
                  content:action.content,
                  new:true,
                }
              } else{
                return user;
              }
            })
          }
        } else{
          return doc;
        }

      })
    case 'SHOW_COL_V':
      console.log('oncolv reducer');
      return state.map((doc) => {
        if (doc._id===action.docId) {
          return{
            ...doc,
            users: doc.users.map((user) => {
              if (user.id===action.userId) {
                return {
                  ...user,
                  new:false,
                  active:true,
                }
              }
              return {
                ...user,
                active:false,
              }
            })
          }
        }
        return {...doc}
      })
    case 'SET_IN_WORKSPACE_MODE':
      return state.map((doc) => {
        return{
          ...doc,
          users:doc.users.map((user) => {
            return {
              ...user,
              active:false,
            }
          })
        }
      }
    )
    case 'CLONE_DOC':
      return state.map((doc) => {
        if (doc._id===action.docId) {
          return {
            ...doc,
            content:action.content
          }
        }
        return {
          ...doc
        }
      })
    case 'ON_USER_JOINED':
      return state.map((doc) => {
        if (doc._id===action.docId) {
          return {
            ...doc,
            usersIds:[...doc.usersIds,action.user._id],
            users:[...doc.users,{id:action.user._id,name:action.user.username, thumbnail:action.user.thumbnail,content:false, new:false, active:false,}]
          }
        } else{ return doc }
      })
      case 'ON_USER_UNJOINED':
        return state.map((doc) => {
          if (doc._id===action.docId) {
            return {
              ...doc,
              usersIds:doc.usersIds.filter((id) => {
                if (id===action.user._id) return false;
                return true;
              }),
              users:doc.users.filter((user) => {
                if (user.id === action.user._id) return false;
                return true;
              })
            }
          } else{return doc}
        })
    case 'CLOSE_TAB':
      let changeCurrent = action.current;
      return state.map((doc) => {
        if (doc._id!==action.id && doc.inTabs && changeCurrent) {
          changeCurrent = false;
          return {
            ...doc,
            open:true,
          }
        }
        if (doc._id===action.id) {
          return {
            ...doc,
            open:false,
            inTabs:false,
          }
        }
        return doc;
      })
    default:
      return state;
  }
}
const foreign = (state=[],action) => {
  switch (action.type) {
    case 'GET_DOCS_SUC':
    case 'GET_FOREIGN_DOCS_SUC':
      return [
        ...action.foreignDocs
      ]
    case 'JOIN_DOC_SUC':
      return state.filter((doc) => {
          return doc.id!==action.doc._id
        })

    default:
      return state;
  }
}
const info = (state={...falseAll},action) => {
  switch (action.type) {
    case 'GET_DOCS_REQ' :
    case 'POST_DOC_REQ' :
      return{
        ...falseAll,
        isProcessing:true,
      }

    case 'POST_DOC_ERR':
    case 'GET_DOCS_ERR':
    case 'UPDATE_DOC_ERR':
    case 'DEL_DOC_ERR':
      return{
        ...falseAll,
        err:action.err,
      }
    case 'POST_DOC_SUC':
    case 'GET_DOCS_SUC':
    case 'UPDATE_DOC_SUC':
    case 'DEL_DOC_SUC':
      return {
        ...falseAll,
        suc:action.suc,
      }
    case 'ON_USER_UNJOINED':
      return {
        ...state,
        suc:`${action.user.username} unjoined document '${action.docTitle}'`
      }
    case 'ON_USER_JOINED':
      return {
        ...state,
        suc:`${action.user.username} joined document '${action.docTitle}'`
      }
    case 'ZERO_DOC_INFO':
        return{
          ...falseAll
        }

    default:
      return state;

  }
}

// helper constant
 const falseAll = {
   isProcessing:false,err:false,suc:false,
 }

 //helpers
 export const getActiveDoc=(docs) => {
   for (var i = 0; i < docs.length; i++) {
     if (docs[i].open) {
       return docs[i];
     }
   }
 }

export const colActiveV = (docs) => {
  let result;
  docs.forEach((doc) => {
    doc.users.forEach((user) => {
      if(user.active) result = user;
    })
  })
  return result;
}
export const getInTabsDocs  = (docs) => {
  return docs.filter((doc) => {
    return doc.inTabs;
  })
}


export default combineReducers({
  elements,
  foreign,
  info,
})
