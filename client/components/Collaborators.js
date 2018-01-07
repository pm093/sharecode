import React from 'react'
import Avatar from 'material-ui/Avatar'
import Chip from 'material-ui/Chip';
import classNames from 'classnames';

class Collaborators extends React.Component {
  constructor(){
    super();
    this.state={
      toggle:false,

    }

  }
  toggle = () => {
    this.setState({
      toggle:!this.state.toggle
    })
  }
  countUpdates = (users) => {
    let updates=0;
    users.forEach((user) => {
      if (user.new) {
        updates++;
      }
    })
    return updates;
  }
  render(){
    const {users,onColClick} = this.props;
    let listElements;

    if (users.length===0) {
      listElements = <li key='empty' className='empty'>No collaborators yet</li>
    }
    else{
      listElements = users.map((user) => {

        let classes=  classNames({
            active:user.active,
            new:user.new,
         })
        return (
          <li key={user.id} className={classes}>
            <Chip
              avatar={<Avatar src={user.thumbnail} />}
              label={user.name}
              classes={{root:'chip'}}
              onClick={() => onColClick(user.id)}
            />
          </li>)
      })
    }

    return(
      <div id='collaborators' className={this.props.open ? 'open' : ''}>
        <ul>
          {listElements}
        </ul>
      </div>
    )
  }

}

export default Collaborators;
