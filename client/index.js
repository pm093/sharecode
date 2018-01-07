import ReactDOM from 'react-dom';
import React from 'react'
import App from './containers/App'
import store from './configureStore'
import {Provider} from 'react-redux'

ReactDOM.render(
  <Provider store={store}>
    <App/>
  </Provider>
  ,document.getElementById('app'));
