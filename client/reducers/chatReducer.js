const chat = (state = {},action) => {
  switch (action.type) {
    // case 'INIT_CHAT':
    //   return {
    //     ...state,
    //     [action.docId]:[
    //       ...action.messages,
    //     ]
    //   }
    case 'GOT_MSGS':
      if (!state.hasOwnProperty(action.docId)) {
        return {
          ...state,
          [action.docId]:[
            ...action.messages,
          ]
        }
      }
      return {
        ...state,
        [action.docId]:[
          ...action.messages,
          ...state[action.docId],
        ]
      }
    case 'NEW_MSG':
      if(!state.hasOwnProperty(action.docId)){
        return {
          ...state,
          [action.docId]:[
            {
              userId:action.user._id,
              content:action.content,
              username:action.user.username,
              own:false,
            }
          ]
        }
      }
      return {
        ...state,
        [action.docId]:[
          ...state[action.docId],
          {
            userId:action.user._id,
            content:action.content,
            username:action.user.username,
            own:false,
          }
        ]
      }
    case 'OWN_MSG':
    console.log('new own msg reducer');
      if (!state.hasOwnProperty(action.docId)) {
        return{
          ...state,
          [action.docId]:[
            {
              username:action.username,
              content:action.content,
              own:true
            }
          ]
        }
      }
      return {
        ...state,
        [action.docId]:[
           ...state[action.docId],
          {
            username:action.username,
            content:action.content,
            own:true
          }
        ]
      }
    default:
      return state;
  }
}


export default chat;
