import React from 'react'
import {connect} from 'react-redux'
import * as fromActions from '../actions'
import Button from 'material-ui/Button';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from 'material-ui/Dialog';
import Slide from 'material-ui/transitions/Slide';
import Input, { InputLabel} from 'material-ui/Input';
import { FormControl, FormHelperText } from 'material-ui/Form';
import { SnackbarContent } from 'material-ui/Snackbar'
import Snackbar from 'material-ui/Snackbar';
import Menu,{ MenuItem } from 'material-ui/Menu';
import Select from 'material-ui/Select';
import ForeignDocs from '../components/ForeignDocs'
import io from "socket.io-client";
import Badge from 'material-ui/Badge';
import {colActiveV,getActiveDoc} from '../reducers/docsReducer'
import dateFormat from 'dateformat'
import {getActiveVersion} from '../reducers/historyReducer'
import {countNew} from '../reducers/notificationsReducer'
import axios from 'axios'
import fileDownload from 'js-file-download'
import Notifications from '../components/Notifications'


function Transition(props) {
  return <Slide direction="up" {...props} />;
}

class Navbar extends React.Component {
  constructor(props){
    super(props);
    this.state={
      dialogOpen:false,
      chooseDocErr:false,
      foreignDocsOpen:false,
      historyOpen:false,
      historyAnchorEl:null,
      file:null,
      fileDialog:false,
      extensionErr:false,
    }
    this.extensions = [
      'js','html','scss','css','java','rb'
    ];
    this.props.socket.on('searchForeignDocsResult',({docs}) => {
      this.props.getForeignDocs(this.props.socket,docs)
    })
  }
  openHistory = (e) => {
    this.setState({
      historyOpen:true,
      historyAnchorEl:e.currentTarget,
    })
  }
  closeHistory = () => {
    console.log('close history',this.state.historyOpen);
    this.setState({
      historyOpen:false,
    })
      console.log('close history',this.state.historyOpen);
  }
  toggleForeignDocs = () => {
    if (!this.state.foreignDocsOpen) {
      this.props.socket.emit('searchForeignDocs', {id:this.props.id,query:''})
    }
    this.setState({foreignDocsOpen:!this.state.foreignDocsOpen})
    console.log(this.state)
  }
  handleClickOpen = () => {
    this.setState({ dialogOpen: true });
  };

  handleRequestClose = () => {
    this.setState({ dialogOpen: false,extensionErr:false, });
  };
  handleDocSend = () => {
    console.log(this.state.newDocTitle.split('.').slice(-1)[0])
    if(this.extensions.indexOf(this.state.newDocTitle.split('.').slice(-1)[0])===-1){
      return this.setState({
        extensionErr:true,
      })
    }
    this.props.addNewDoc(this.state.newDocTitle,'')
    this.setState({dialogOpen:false,newDocTitle:'',extensionErr:false,})
  };
  handleTitleChange=(e) => {
    this.setState({newDocTitle:e.target.value})
  }
  handleSnackbarExit=() => {
    this.props.zeroDocInfo();
  }
  handleSyntaxChange=(e) => {
    this.props.changeSyntax(e.target.value)
  }
  removeChooseDocErr = () => {
    this.setState({
      chooseDocErr:false,
    })
  }
  deleteDoc=() => {
    if (this.props.currentDoc) {
      this.props.deleteDoc(this.props.currentDoc._id);
    } else{
        this.setState({
          chooseDocErr:true
        })
    }
  }

  updateDoc=() => {
    if(this.props.currentDoc) {
      this.props.updateDoc({docId:this.props.currentDoc._id,content:this.props.currentDoc.content,socket:this.props.socket})
    } else {
        this.setState({
          chooseDocErr:true
        })
    }
  }
  searchForeignDocs = (e) => {
    console.log('search dos', e.target.value);
    this.props.socket.emit('searchForeignDocs', {id:this.props.id,query:e.target.value})
  }
  handleVersionClick=(id) => {
    this.closeHistory();
    this.props.openHistoryDoc({docId:this.props.currentDoc._id,versionId:id});
  }
  setFile = (e) => {
    if (e.target.files[0]) {
      this.setState({
        file:e.target.files[0],
        fileDialog:true,
      })
    } else{
      this.setState({
        file:null,
        fileDialog:false,
      })
    }
  }
  closeFileDialog = () => {
    this.setState({
      fileDialog:false,
    })
  }
  unNew = () => {
    this.props.unNew();
  }
  sendFile = () => {
    let formData = new FormData();
    formData.append('file',this.state.file);
    axios({
      method:'post',
      url:'api/upload',
      data:formData,
      contentType:false,
      processData:false,
    }).then((res) => {
      console.log(res.data)
      this.props.postDocSuc(res.data.doc);
      this.setState({
        file:null,
        fileDialog:false,
      })
    })
  }
  downloadFile = () => {
    let fileName = this.props.currentDoc.title;
    let type,id;
    if(this.props.workspaceMode==='internal'){
      type = 'doc';
      id = this.props.currentDoc._id
    }
    else if(this.props.workspaceMode==='history') {
      type = 'version'
      id = getActiveVersion(this.props.currentDoc._id,this.props.history)._id;
    }
    else{
      return false;
    }
    axios({
      method:'get',
      url:'api/download/'+id,
      params:{
        type,
      },
    })
    .then((res) => {
      console.log('sciagnieto',res);
      fileDownload(res.data,fileName)   
    })
  }
  render(){
    console.log('nav colavtivev',this.props.colActiveV);
    let buttons;
    if (!this.props.currentDoc) {
      buttons=null;
    }
    else if (this.props.workspaceMode==='internal') {
      buttons=(
        <div>
          <li><button className='purple' onClick={this.downloadFile} ><a><i className="fa fa-arrow-circle-o-down" aria-hidden="true"></i> download</a></button></li>
          <li><button className='success' onClick={this.updateDoc} ><a><i className="fa fa-floppy-o" aria-hidden="true"></i> save</a></button></li>
          <li><button className='danger' onClick={this.deleteDoc} ><a><i className="fa fa-trash" aria-hidden="true"></i> delete</a></button></li>
        </div>
    )}
    else if (this.props.workspaceMode === 'external') {
      buttons = (
      <div>
        
        <li><button className='success' onClick={() => this.props.clone(this.props.currentDoc._id,this.props.colActiveV.content)}  ><a><i className="fa fa-files-o" aria-hidden="true"></i> clone</a></button></li>
        <li><button className='orange' onClick={this.props.setInWorkspaceMode} ><a><i className="fa fa-backward" aria-hidden="true"></i> back</a></button></li>
      </div>
    )}
    else if (this.props.workspaceMode === 'history') {
      buttons = (
      <div>
        <li><button className='purple' onClick={this.downloadFile} ><a><i className="fa fa-arrow-circle-o-down" aria-hidden="true"></i> download</a></button></li>
        <li><button className='success' onClick={() => this.props.clone(this.props.currentDoc._id,getActiveVersion(this.props.currentDoc._id ,this.props.history).content)}   ><a><i className="fa fa-files-o" aria-hidden="true"></i> clone</a></button></li>
        <li><button className='orange' onClick = {() => this.props.closeHistoryDoc(this.props.currentDoc._id)} ><a><i className="fa fa-backward" aria-hidden="true"></i> back</a></button></li>
      </div>
    )}


    return(
      <div id='mainNavbar'>
        <div className='hamburger'><a onClick={this.props.toggleSidebarClick}><i className="fa fa-bars" aria-hidden="true"></i></a>{this.props.externallyChanged ? <Badge className="badge" badgeContent={this.props.externallyChanged} color="accent"></Badge> : <span></span>}</div>
        <div className='header'>ShareCode</div>
        <ul>
          <li>
            <FormControl>
              <Select
                value={this.props.syntax}
                onChange={this.handleSyntaxChange}
                input={<Input/>}
                classes={{root:'select'}}
              >
              <MenuItem key={'js'} value={'javascript'}> JavaScript</MenuItem>
              <MenuItem key={'html'} value={'html'}> HTML</MenuItem>
              <MenuItem key={'css'} value={'css'}> CSS</MenuItem>
              <MenuItem key={'sass'} value={'sass'}> SA</MenuItem>
              <MenuItem key={'ruby'} value={'ruby'}> Ruby </MenuItem>
              <MenuItem key={'java'} value={'java'}> Java</MenuItem>
              </Select>
            </FormControl>
          </li>
          <li onClick={this.toggleForeignDocs}><i className="fa fa-link" aria-hidden="true"></i></li>
          <li>
            <input onChange={this.setFile} type="file" name='file' id='upDocInput' style={{visibility:'hidden',width:0,position:'absolute',}}/>
            <label htmlFor='upDocInput'><a><i className="fa fa-upload" aria-hidden="true"></i></a></label>
          </li>
          <li><button onClick={this.handleClickOpen}><a><i className="fa fa-plus" aria-hidden="true"></i><span> new document</span></a></button></li>
          <li className='bellIcon' onMouseLeave={this.unNew}><i className="fa fa-bell-o" aria-hidden="true"><div className="notifBadge" style={{display:this.props.newNotificationsCounter>0 ? 'block' : 'none',}}>{this.props.newNotificationsCounter}</div></i>
            <Notifications messages={this.props.notifications}/>
          </li>
          {this.props.currentDoc ? (<li className='usersIcon' onClick={this.props.onCollaboratorsToggle}><i className="fa fa-users" aria-hidden="true"></i></li>) : <span></span>}
          {this.props.currentDoc ? (<li className='usersIcon' onClick={this.openHistory}><i className="fa fa-calendar-check-o" aria-hidden="true"></i></li>) : <span></span>}
          {this.props.currentDoc && this.props.history.hasOwnProperty(this.props.currentDoc._id) ? (
            <Menu
            anchorEl={this.state.historyAnchorEl}
            open={this.state.historyOpen}
            onRequestClose={this.closeHistory}
            >
            {this.props.history[this.props.currentDoc._id].length===0 ? (<MenuItem key='empty' className='empty'><h3>No history...</h3></MenuItem>) : <span></span>}
            {this.props.history[this.props.currentDoc._id].map((element) => {
              return <MenuItem key={element._id} classes={{root:'historyElement'}} onClick={() => this.handleVersionClick(element._id)}><h1>{element.author.username}</h1> <h6>{dateFormat(element.date,"d/m/yyyy H:MM" )}</h6></MenuItem>
            })}
          </Menu>
          ) : <span></span>}

        </ul>
        <ul>
          {buttons}
          <li> <a href='./auth/logout'><i className="fa fa-power-off" aria-hidden="true"></i></a></li>
        </ul>
        <Dialog
            open={this.state.dialogOpen}
            transition={Transition}
            keepMounted
            onRequestClose={this.handleRequestClose}
        >
        <DialogTitle>{"Add new document"}</DialogTitle>
          <DialogContent>
            <FormControl fullWidth error={this.state.extensionErr} >
              <InputLabel htmlFor="title">Title (with extension)</InputLabel>
                <Input
                  id="title"
                  value={this.state.newDocTitle}
                  onChange={this.handleTitleChange}
                  
                />
                {this.state.extensionErr ? <FormHelperText>add proper extension (.html,.js,.css,.scss,.rb,.java)</FormHelperText> : ''}

              </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleRequestClose} color="primary">
              Cancel
            </Button>
            <Button onClick={this.handleDocSend} color="primary">
              Add
            </Button>
          </DialogActions>
        </Dialog>
{/* FILE UPLOAD DIALOG */}
        <Dialog
            open={this.state.fileDialog}
            transition={Transition}
            onRequestClose={this.closeFileDialog}
        >
        <DialogTitle>Want to upload this file?</DialogTitle>
          <DialogContent>
            <h3>{this.state.file ? this.state.file.name : ''}</h3>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.closeFileDialog} color="primary">
              Cancel
            </Button>
            <Button onClick={this.sendFile} color="primary">
              Yes
            </Button>
          </DialogActions>
        </Dialog>
{/* END */}
        <Dialog
            open={this.state.foreignDocsOpen}
            transition={Transition}
            keepMounted
            onRequestClose={this.toggleForeignDocs}
        >
        <DialogTitle>{"Subscribe to document"}</DialogTitle>
          <DialogContent>
            <ForeignDocs docs={this.props.foreignDocs} handleChange={this.searchForeignDocs} handleClick={this.props.joinDoc}></ForeignDocs>
          </DialogContent>
        </Dialog>
        <Snackbar open={this.props.docInfoSuc} autoHideDuration={2000} message={this.props.docInfoSuc} onRequestClose={this.handleSnackbarExit}/>
        <Snackbar open={this.props.docInfoErr} autoHideDuration={2000} message={this.props.docInfoErr} onRequestClose={this.handleSnackbarExit}/>
        <Snackbar open={this.state.chooseDocErr} autoHideDuration={2000} message='choose document first' onRequestClose={this.removeChooseDocErr}/>
      </div>
    )
  }
}

const mstp = (state) => ({
    isProcessing:state.docs.info.isProcessing,
    docInfoErr:state.docs.info.err,
    docInfoSuc:state.docs.info.suc,
    syntax:state.workspace.syntax,
    currentDoc:getActiveDoc(state.docs.elements),
    foreignDocs:state.docs.foreign,
    externallyChanged:countExternallyChanged(state.docs.elements),
    workspaceMode:state.workspace.mode,
    colActiveV:colActiveV(state.docs.elements),
    currentDoc:getActiveDoc(state.docs.elements),
    history: state.history,
    notifications:state.notifications,
    newNotificationsCounter:countNew(state.notifications),
})
const mdtp =(dispatch,ownProps) => ({
    toggleSidebarClick: () => dispatch(fromActions.toggleSidebar()),
    addNewDoc:(title,content) =>dispatch(fromActions.postDoc(title,content)),
    zeroDocInfo:() => dispatch(fromActions.zeroDocInfo()),
    changeSyntax:(syntax) => dispatch(fromActions.changeSyntax(syntax)),
    deleteDoc:(id,socket=ownProps.socket)=> dispatch(fromActions.deleteDoc(id,socket)),
    updateDoc:(data)=>dispatch(fromActions.updateDoc(data)),
    getForeignDocs:(socket,docs)=>dispatch(fromActions.getForeignDocs(socket,docs)),
    joinDoc:(id,socket = ownProps.socket) => dispatch(fromActions.joinDoc(id,socket)),
    onCollaboratorsToggle: () => dispatch(fromActions.collaboratorsToggle()),
    setInWorkspaceMode:() => dispatch(fromActions.setInWorkspaceMode()),
    clone:(docId,content)=>dispatch(fromActions.cloneDoc(docId,content)),
    openHistoryDoc:({docId, versionId}) =>dispatch(fromActions.openHistoryDoc({docId,versionId})),
    closeHistoryDoc: (docId) => dispatch(fromActions.closeHistoryDoc(docId)),
    postDocSuc: (doc) => dispatch(fromActions.postDocSuc(doc)) ,
    unNew: () => dispatch(fromActions.unNew())

})
const countExternallyChanged = (docs) => {
  return docs.filter((doc) => {
    return doc.external;
  }).length;
}
export default connect(mstp,mdtp)(Navbar);
