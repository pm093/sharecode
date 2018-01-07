
const sidebarReducer = (state={visible:false,}, action) => {
  switch (action.type) {
    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        visible:!state.visible
      }
    default:
      return state;

  }
}

export default sidebarReducer;
