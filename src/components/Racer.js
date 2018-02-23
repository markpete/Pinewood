import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Table, Icon } from 'semantic-ui-react';
import './Racer.css';

import gql from 'graphql-tag';
import { graphql, withApollo } from 'react-apollo';

import { ALL_RACERS_QUERY } from './RacerList';

const DELETE_RACER_MUTATION = gql `
mutation DeleteRacerMutation($id: ID!) {
  deleteRacer(id: $id) {
      id
  }
}`;

class Racer extends Component {
    editPath = '/add/' + this.props.racer.id;
    deleteEntry = async () => {
        let id = this.props.racer.id;
        await this.props.deleteRacerMutation({
            variables: {
                id
            },
            update: (store, { data: { deleteRacer } }) => {
              
              const data = store.readQuery({ query: ALL_RACERS_QUERY });              
              // Add our todo from the mutation to the end.
              let i=data.allRacers.length-1;
              while(data.allRacers[i].id !== deleteRacer.id && i>=0) {
                  i--;
              }
              if(i>=0) {
                  data.allRacers.splice(i, 1);
              }
              // Write our data back to the cache.
              store.writeQuery({ query: ALL_RACERS_QUERY, data });
            }
        });
    }

    render() {
        return (
            <Table.Row>
                <Table.Cell>
                    {this.props.racer.name}
                    <div className='iconSet'>
                        <Link to={this.editPath}>
                        <Icon name='pencil' className='cursorPointer'/>
                        </Link>
                        <Icon name='delete' className='cursorPointer' color='blue' onClick={this.deleteEntry} />
                    </div>
                </Table.Cell>
                <Table.Cell>{this.props.racer.den}</Table.Cell>
                <Table.Cell>{this.props.racer.carID}</Table.Cell>
                <Table.Cell>{this.props.racer.weight} oz</Table.Cell>
            </Table.Row>
        );
    }
}

Racer.propTypes = {
    racer: PropTypes.shape({
        id: PropTypes.id,
        name: PropTypes.string,
        den: PropTypes.string,
        carID: PropTypes.number,
        weight: PropTypes.number
    }),
};

export default graphql(DELETE_RACER_MUTATION, {
    name: 'deleteRacerMutation',
})(withApollo(Racer));