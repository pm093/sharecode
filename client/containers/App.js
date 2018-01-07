import React from 'react'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import Workspace from './Workspace'
import Chat from '../components/Chat'
import io from "socket.io-client";
import * as fromActions from '../actions'
import {connect} from 'react-redux'
import {getActiveDoc} from '../reducers/docsReducer'

import '../../server/public/app.scss';
import { getNotifications } from '../actions';

let socket;
let HOST = location.origin.replace(/^http/, 'ws')

class App extends React.Component{
  constructor(props){
    super(props)
     socket = io.connect(HOST);
  }
  componentDidMount() {
    this.props.getNotifications()
    socket.on('user joined',({docId,user,docTitle}) => {
      this.props.onUserJoined(docId,user,docTitle);
      console.log('on user joined from App.js ',docId,user);
    })
    socket.on('user unjoined',({docId,user,docTitle}) => {
      this.props.onUserUnjoined(docId,user,docTitle);
      console.log('on user unjoined from App.js ',docId,user);
    })
    socket.on('new message',({docId, user,content}) => {
      this.props.onNewMessage({docId,user,content})
      console.log('on new message', content);
    })
    socket.on('got messages',({docId, messages}) => {
      this.props.gotMessages({docId,messages})
      console.log('on got messages');
    })
    socket.on('own message',({docId, content,username}) => {
      this.props.onOwnMessage({docId,content,username})
      console.log('onget messages');
    })
    socket.on('update own doc suc',({doc,version}) => {
      console.log('ws updateOwnDocSuc, doc , version: ',doc, version);
      this.props.updateOwnDocSuc(doc._id,version);
    })
    socket.on('new version',({version,username,title}) => {
      console.log('new version WS');
      this.props.newVersion(version,username,title);
    })
    
  }

  render(){
    return(
      <div>
        <Navbar socket={socket}/>
        <Workspace socket={socket}/>
        <Sidebar/>
        {this.props.currentDoc ? (<Chat socket={socket} />) : <span></span>}
      </div>
    )
  }
}
const mstp = (state) => ({
  chat: state.chat,
  currentDoc:getActiveDoc(state.docs.elements),
})
const mdtp = (dispatch) => ({
  onUserJoined: (docId,user,docTitle) => dispatch(fromActions.onUserJoined(docId,user,docTitle)),
  onUserUnjoined: (docId,user,docTitle) => dispatch(fromActions.onUserUnjoined(docId,user,docTitle)),
  onNewMessage: (data) => dispatch(fromActions.onNewMessage(data)),
  gotMessages: (data) => dispatch(fromActions.gotMsgs(data)),
  onOwnMessage:(data) => dispatch(fromActions.onOwnMsg(data)),
  updateOwnDocSuc:(id,version) => dispatch(fromActions.updateDocSuc(id,version)),
  newVersion:(version,username,title) => dispatch(fromActions.addVersion(version,username,title)),
  getNotifications:() => {dispatch(fromActions.getNotifications())}
})
export default connect(mstp,mdtp)(App);
