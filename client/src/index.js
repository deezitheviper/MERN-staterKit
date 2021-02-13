import React from 'react';
import ReactDOM from 'react-dom';
import "antd/dist/antd.css";
import './assets/css/style.css'
import 'react-toastify/dist/ReactToastify.css';
import AppRoute from './utils/AppRoute'
import { BrowserRouter, Switch } from 'react-router-dom'

import App from './App';
import Register from './views/Register'
import Verify from './views/Verify'
import Login from './views/Login'

ReactDOM.render(
  <BrowserRouter>
    <Switch>
      <AppRoute path='/' exact component={App} />
      <AppRoute path='/Register' exact component={Register} />
      <AppRoute path='/Login' exact component={Login} />
      <AppRoute path='/user/activate/:token' exact component={Verify} />
    </Switch>
  </BrowserRouter>,
  document.getElementById('root')
);
