import React from 'react';
import ReactDOM from 'react-dom';
import 'semantic-ui-css/semantic.min.css';

import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Login from "./Login";
import Users from "./Users";


ReactDOM.render(
    <BrowserRouter>
    <Switch>
        <Route path="/login" component={Login}/>
        <Route path="/exam/:username" component={Users} />
    </Switch>
        </BrowserRouter>,
    document.getElementById("root")
);
