import React from 'react'
import AceEditor from 'react-ace';
import brace from 'brace'
import {connect} from 'react-redux';
import * as fromActions from '../actions'
import 'brace/theme/monokai';
import 'brace/mode/sass';
import 'brace/mode/javascript';
import 'brace/mode/ruby';
import 'brace/mode/java';
import 'brace/mode/html';
import 'brace/mode/css';
import {getActiveDoc,colActiveV,getInTabsDocs} from '../reducers/docsReducer'
import  _ from 'lodash';
import Collaborators from '../components/Collaborators'
import Tabs from '../components/Tabs'
import {getActiveVersion,checkAnyHistoryActive} from '../reducers/historyReducer'

class Workplace extends React.Component{
  constructor(props){
    super(props);
    this.props.socket.on('changeDoc',({userId,docId,content}) => {
      console.log('workspace odebralo websocket content:',content,'userid ',userId,'docid',docId);
      this.props.onChangeDocWs({docId,userId,content});
    })
  }
  onDocChange = (id,content) => {
  this.props.onDocChange({id,content,socket:this.props.socket,users:this.props.currentDoc.usersIds})
  }
  onColClick = (id) => {
    console.log('on col click',id);
    this.setState({mode:external});
    this.props.onColClick(this.props.currentDoc._id,id);
  }
  closeAllHistory = () => {
    this.props.closeAllHistory();
  }
  render(){
    if (!this.props.currentDoc) {
      return (
        <div id='workplace' className='empty'>
          <h1>Wybierz dokument</h1>
        </div>
      )
    }
    let workspaceValue;
    switch (this.props.mode) {
      case 'internal':
        workspaceValue=this.props.currentDoc.content;
        break;
      case 'external':
        if (this.props.colActiveV) {
          workspaceValue=this.props.colActiveV.content || '';
          break;
        } else{
          workspaceValue = ''
          break;
        }
        break;
      case 'history':
        if (!checkAnyHistoryActive(this.props.currentDoc._id,this.props.history)) {
          console.log('close all history');
          this.closeAllHistory()
          break;
        }
        else{
          workspaceValue = getActiveVersion(this.props.currentDoc._id ,this.props.history).content || ''

          break;
        }
        break;
      default:
        workspaceValue = '';
    }
    const debounced = _.debounce(this.onDocChange,3500)
    return(
      <div id='workplace'>
        <Tabs docs={this.props.inTabDocs} onTabClick={this.props.openDoc} onCloseClick= {this.props.closeTab}/>
        {console.log('c',this.props.colActiveV)}
        {console.log('mod',this.props.mode)}
      <AceEditor
        mode={this.props.syntax}
        theme="monokai"
        onChange={(content) => {debounced(this.props.currentDoc._id,content)}}
        value={workspaceValue}
        name="ace"
        editorProps={{$blockScrolling: true}}
        height='100%'
        width='100%'
        readOnly={this.props.mode==='internal' ? false : true}
      />
    <Collaborators users={this.props.currentDoc.users} onColClick={this.onColClick} open={this.props.collaboratorsOpen}/>
      </div>
    )
  }
}

const mstp=(state) => ({
  syntax:state.workspace.syntax,
  currentDoc:getActiveDoc(state.docs.elements),
  mode:state.workspace.mode,
  colActiveV:colActiveV(state.docs.elements),
  inTabDocs: getInTabsDocs(state.docs.elements),
  collaboratorsOpen:state.collaborators.open,
  history:state.history,
})
const mdtp=(dispatch) => ({
  onDocChange:(data) => dispatch(fromActions.changeDoc(data)),
  onChangeDocWs:(data) => {console.log('data ',data); dispatch(fromActions.changedDocWs(data))},
  onColClick: (docId,userId) => dispatch(fromActions.showColV(docId,userId)),
  openDoc:(id) => dispatch(fromActions.openDoc(id)),
  closeTab:(id,current) => dispatch(fromActions.closeTab(id,current)),
  closeAllHistory: () => dispatch(fromActions.closeAllHistory()),

})

export default connect(mstp,mdtp)(Workplace);
