import React from 'react'
import classNames from 'classnames'
import {connect} from 'react-redux'
import {getActiveDoc} from '../reducers/docsReducer'
import * as fromActions from '../actions'
import _ from 'lodash';

class Chat extends React.Component{
  constructor (props){
    super(props);
    this.state={
      open:false,
    }
    if (!props.chat.hasOwnProperty(props.currentDoc._id)) {
      this.props.getFirstMessages({docId:props.currentDoc._id,socket:props.socket})
    }

  }
  componentWillReceiveProps(nextProps){
    console.log('Chat component next props: ',nextProps);
    if (!nextProps.chat.hasOwnProperty(nextProps.currentDoc._id)) {
      this.props.getFirstMessages({docId:nextProps.currentDoc._id,socket:nextProps.socket})
    }

  }
  componentDidUpdate(){
    console.log('updatead at all');
    if (this.prevHeight && this.prevDocId==this.props.currentDoc._id) {
      this.messagesEl.scrollTop = this.messagesEl.scrollHeight - this.prevHeight;
      console.log('chat upate the same doc');
    }
    else if (this.prevDocId!=this.props.currentDoc._id) {
      console.log('chat upate dif doc', this.messagesEl.scrollHeight,'current doc: ',this.props.currentDoc._id);
      this.messagesEl.scrollTop = this.messagesEl.scrollHeight
    }
    else{
      console.log('nothing catched',this.prevDocId,this.props.currentDoc._id);
    }
  }
  onMsgSubmit = (e,data) => {
    console.log('keydown');
    let keyCode = e.which || e.keyCode;
    if (keyCode===13 ) {
      e.preventDefault();
      this.textarea.value='';
      this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
      this.props.onMsgSubmit(data);
    }
  }

  toggle = () => {
    if (!this.state.open) {
      this.messagesEl.scrollTop=this.messagesEl.scrollHeight;
    }
    this.setState({
      open:!this.state.open,
    })
  }
  handleScroll = () => {

    if (this.messagesEl.scrollTop<15 && this.props.chat[this.props.currentDoc._id]) {
       this.props.getMessages({docId:this.props.currentDoc._id,socket:this.props.socket,lastMessageId:this.props.chat[this.props.currentDoc._id][0]._id})
       this.prevHeight = this.messagesEl.scrollHeight;
       this.prevDocId = this.props.currentDoc._id
    }
  }
  render(){
    let messages = [];
    if (this.props.chat.hasOwnProperty(this.props.currentDoc._id)) {
      console.log('messages warunek true');
      messages = this.props.chat[this.props.currentDoc._id];
    }
    return (
      <div id='chat'  className={!this.state.open ? 'closed' : ''}>
        <div onClick = {this.toggle} className='header'><h3>Chat</h3></div>
          <div className='messages' ref={(input) => {this.messagesEl = input}} onScroll = {_.throttle(this.handleScroll,500)}>
            <ul>
              {messages.map((message) => {
                let classes = classNames({
                  own:message.own,
                })
                return <div key={message._id} className='messagesContainer'>{!message.own ? <p className='username'>{message.username}</p> : <span></span>}<li  className={classes}><p>{message.content}</p></li></div>
              })}
            </ul>
          </div>
          <div className='line'></div>
          <div className='textBox'>
            <textarea placeholder = 'have something to say...' ref={(input) => {this.textarea = input}} onKeyDown={(e) => this.onMsgSubmit(e,{docId:this.props.currentDoc._id,content:e.target.value,socket:this.props.socket})}/>
          </div>
      </div>
    )
  }
}

const mstp = (state,ownProps) => ({
  chat: state.chat,
  currentDoc:getActiveDoc(state.docs.elements),
  socket:ownProps.socket,
})
const mdtp = (dispatch) => ({
  onMsgSubmit: (data) => dispatch(fromActions.sendOwnMessage(data)),
  getFirstMessages:(data) => dispatch(fromActions.getMsgs(data)),
  getMessages:(data)=>dispatch(fromActions.getMsgs(data)),
})
export default connect(mstp,mdtp)(Chat);
