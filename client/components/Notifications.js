import React from 'react'


const Notifications = ({messages}) => {
    console.log(messages)
    return (
        <div className='notifications'>
            <ul>
                {messages.map((message) => {
                   return <li key={message.versionId} className = {message.read ? '' : 'new'}><div className="bar"></div> {message.message}</li>        
                })}
                {messages.length===0 ? <li>You do not have any notifications</li> : '' }
            </ul>
        </div>
    )
}

export default Notifications;