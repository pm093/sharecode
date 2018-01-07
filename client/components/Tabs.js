import React from 'react'
import classNames from 'classnames';
import DragSortableList from 'react-drag-sortable'

const Tabs = ({docs,onTabClick,onCloseClick}) => {
  let list =[];
  docs.forEach((doc) => {
    let classes =  classNames({
              active:doc.open,
              external:doc.eUpdate,
              internal:doc.iUpdate,
              tab:true,
    })
    let element = {
      content:(<div className={classes} onClick={() => onTabClick(doc._id)}><div className="tab-box"><div className='text'><p>{doc.title}</p><i onClick={(e) => {e.stopPropagation(); onCloseClick(doc._id,doc.open)}} className="fa fa-times" aria-hidden="true"></i></div></div></div>)
    }
    list.push(element);
  })
  return (
    <div className='tabs'>
      <DragSortableList items={list} moveTransitionDuration={0.5} dropBackTransitionDuration={0.5} type="horizontal"/>
    </div>
  )
  // return(
  //   <div className="tabs">
  //     {docs.map((doc) => {
  //       let classes=  classNames({
  //           active:doc.open,
  //           external:doc.eUpdate,
  //           internal:doc.iUpdate,
  //           tab:true,
  //        })
  //       return <div className={classes} onClick={() => onTabClick(doc._id)}><div className="tab-box"><div className='text'>{doc.title}<i onClick={(e) => {e.stopPropagation(); onCloseClick(doc._id)}} className="fa fa-times" aria-hidden="true"></i></div></div></div>
  //     })}
  //
  //
  //   </div>
  // )
}

export default Tabs;
