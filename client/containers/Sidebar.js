import React from 'react'
import {connect} from 'react-redux'
import * as fromActions from '../actions'
import classNames from 'classnames';

class Sidebar extends React.Component {
  componentDidMount= () => {
    this.props.getDocs();
  }
  openDoc = (id,getHis) => {
    this.props.openDoc(id,getHis)
  }
  render(){
    return (

      <div id='sidebar' style={{left:this.props.visible ? 0 : '-200px'}}>
        <ul>
          {this.props.docs.map((doc) => {
           let classes=  classNames({
               open : doc.open,
               iUpdate:doc.iUpdate,
               eUpdate:doc.eUpdate
            })
            return <li className={classes} onClick={()=>{this.openDoc(doc._id,!this.props.history.hasOwnProperty(doc._id));this.props.toggleSidebar()}} key={doc._id}><i className="fa fa-file-code-o" aria-hidden="true"></i> {doc.title}</li>;
          })}
        </ul>
      </div>
    )
  }
}
const mstp = (state) => ({
  visible:state.sidebar.visible,
  docs:state.docs.elements,
  history: state.history,
})
const mdtp = (dispatch) => ({
  getDocs:() => {dispatch(fromActions.getDocs())},
  openDoc:(id,getHis) => dispatch(fromActions.openDoc(id,getHis)),
  toggleSidebar:()=> dispatch(fromActions.toggleSidebar()),
})
export default connect(mstp,mdtp)(Sidebar);
