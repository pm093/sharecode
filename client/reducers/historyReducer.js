
const history = (state={},action) => {
  switch (action.type) {
    case 'GET_HISTORY':
      return {
        ...state,
        [action.id]:action.history
      }
    case 'OPEN_HISTORY_DOC':
    console.log('action',action.docId);
      return {
        ...state,
        [action.docId]:
          state[action.docId].map((version) => {
            if (version._id===action.versionId) {
              return {
                ...version,
                active:true,
              }
            }
            return{
              ...version,
              active:false,
            }
          })
      }
    case 'CLOSE_HISTORY_DOC':
    return {
      ...state,
      [action.docId]:
        state[action.docId].map((version) => {
          return{
            ...version,
            active:false,
          }
        })
    }
    case 'CLOSE_ALL_HISTORY':
    let newData = {};
        for ( const element in state) {
           newData[element] = state[element].map((element) => {
            return {
              ...element,
              active:false
            }
          })
        }
      return newData;
    case 'UPDATE_DOC_SUC':
      return {
        ...state,
        [action.id]:[
          action.version,
          ...state[action.id]
        ]
      }
      case 'ADD_VERSION':
        if(!state.hasOwnProperty(action.version.docId)){
          return {
            ...state,
            [action.version.docId]:[
              action.version
            ]
          }
        }
        return {
          ...state,
          [action.version.docId]:[
            action.version,
            ...state[action.version.docId]
          ]
        }
    default:
      return state;
  }
}
export const historyExist = (history,docId) => {
  return history.hasOwnProperty(docId)
}
export const getActiveVersion = (docId,history) => {
  return history[docId].find((version) => {
    return version.active;
  })
}
export const checkAnyHistoryActive = (docId,history) => {
  let flag = false;
  if (!history.hasOwnProperty(docId)) {
    console.log('check any history 1st false');
    return false;
  }
  history[docId].forEach((version) => {
    if (version.active) {
      console.log('check any history 1st true');
      flag = true;
    }
  })
  return flag;
}
export default history;
