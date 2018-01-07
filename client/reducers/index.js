import {combineReducers} from 'redux'
import sidebar from './sidebarReducer'
import docs from './docsReducer'
import workspace from './workspaceReducer'
import history from './historyReducer'
import chat from './chatReducer'
import notifications from './notificationsReducer'

const collaborators = (state={open:false},action) => {
  switch (action.type) {
    case 'COLLABORATORS_TOGGLE':
      return ({
        ...state,
        open:!state.open
      })

    default:
      return state;
  }
}

const mainReducer = combineReducers({
collaborators,
sidebar,
docs,
history,
workspace,
chat,
notifications
})

export default mainReducer;
