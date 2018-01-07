import React from 'react'
import Input, { InputLabel} from 'material-ui/Input';
import { FormControl } from 'material-ui/Form';

const ForeignDocs = ({docs,handleChange,handleClick}) => {

  return(
    <div id='foreignDocs'>
      <FormControl fullWidth >
          <InputLabel>search</InputLabel>
          <Input
            onChange={handleChange}
          />
        </FormControl>

      <ul>
        {docs.map((doc) => {
          return <li key= {doc.id}><h3>{doc.title}</h3><button onClick={() => handleClick(doc.id)}><i className="fa fa-plus" aria-hidden="true"></i></button></li>
        })}
      </ul>
    </div>
  )
}

export default ForeignDocs;
