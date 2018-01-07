const notifications = (state=[],action) => {
    switch(action.type){
        case 'ADD_VERSION': 
            return [
                {
                    message:`${action.username} added new version of file ${action.title}`,
                    versionId:action.version._id,
                    read:false,
                },
                ...state,
            ]
        case 'UNNEW':
            return state.map((not) => {
                return {
                    ...not,
                    read:true,
                }
            })
        case 'ON_USER_UNJOINED':
            return [
                {
                    read:false,
                    docId:action.docId,
                    message:`${action.user.username} unsubscribed ${action.docTitle}`
                },
                ...state,
            ]
        case 'GET_NOTIFICATIONS_SUC':
            return[
                ...state,
                ...action.notifications
            ]
        default:
            return state;
    }
}

export const countNew = (state) => {
    let counter = 0;
    state.forEach((notification) => {
        if(!notification.read){
            counter++;
        }
    })
    return counter;
}
export default notifications;