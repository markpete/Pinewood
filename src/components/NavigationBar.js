import React, { Component } from 'react';
import { Menu, Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

class NavigationBar extends Component {

  render() {
    return (
      <div>
          <Menu inverted>
            <Link to='/'>
              <Menu.Item name='home'>
                <Icon name='home' />
                Home
              </Menu.Item>
            </Link>
            <Link to='/add'>
              <Menu.Item name='add-racer'>
                <Icon name='add user' />
                Add Racer
              </Menu.Item>
            </Link>
          </Menu>
      </div>
    );
  }
}

export default NavigationBar;