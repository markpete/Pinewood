import React, { Component } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import './App.css';
import NavigationBar from './components/NavigationBar.js';
import RacerList from './components/RacerList.js';
import NewRacer from './components/NewRacer.js';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <div>
          <NavigationBar />
          <Switch>
            <Route exact path='/' component={RacerList}/>
            <Route exact path='/add' component={NewRacer}/>
            <Route path='/add/:record' component={NewRacer}/>
          </Switch>
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
