
const workspace=(state={syntax:'javascript',mode:'internal'},action) => {
  switch (action.type) {
    case 'CHANGE_SYNTAX':
      return {
        ...state,
        syntax:action.syntax
      }
    case 'SHOW_COL_V':
      return{
        ...state,
        mode:'external',
      }
    case 'SET_IN_WORKSPACE_MODE':
    return {
      ...state,
      mode:'internal',
    }
    case 'OPEN_HISTORY_DOC':
      return{
        ...state,
        mode:'history',
      }
    case 'CLOSE_HISTORY_DOC':
    case 'CLOSE_ALL_HISTORY':
      return {
        ...state,
        mode:'internal',
      }
    default:
      return state;
  }
}
export default workspace;
