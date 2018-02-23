import React, { Component } from 'react';
import { Segment, Dimmer, Loader, Table } from 'semantic-ui-react';
import Racer from './Racer';

import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

export const ALL_RACERS_QUERY = gql`
    query AllRacersQuery {
        allRacers {
            id
            name
            den
            carID
            weight
        }
    }
`;

const RACERS_SUBSCRIPTION = gql`
    subscription NewLinkCreatedSubscription {
        Racer(filter: { mutation_in: [CREATED] }) {
            node {
                id
                name
                den
                carID
                weight
            }
        }
    }
`;

class RacerList extends Component {
    componentDidMount() {
        if(this.props.allRacersQuery) {
            this.props.allRacersQuery.subscribeToMore({
                document: RACERS_SUBSCRIPTION,
                updateQuery: (prev, { subscriptionData }) => {
                    const newRacers = [
                        ...prev.allRacers,
                        subscriptionData.data.Racer.node,
                    ];
                    const result = {
                        ...prev,
                        allRacers: newRacers,
                    };
                    return result;
                },
            });
        }
    }
    render() {
        if (this.props.allRacersQuery && this.props.allRacersQuery.loading) {
            return (
                <div>
                  <Dimmer active>
                    <Loader>Loading</Loader>
                  </Dimmer>
                </div>
            );
        }

        if (this.props.allRacersQuery && this.props.allRacersQuery.error) {
            return <div>Error occurred</div>;
        }

        const allRacers = this.props.allRacersQuery.allRacers;
        if (!allRacers || allRacers.length === 0) {
            return <Segment basic>No Racers...</Segment>;
        }

        return (
            <Table celled>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell className='two wide' >Racer</Table.HeaderCell>
                        <Table.HeaderCell width={1} >Den</Table.HeaderCell>
                        <Table.HeaderCell width={1} >Car #</Table.HeaderCell>
                        <Table.HeaderCell width={1} >Weight</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {allRacers.map(racer => <Racer key={racer.id} racer={racer} />)}
                </Table.Body>
            </Table>
        );
    }
}

export default graphql(ALL_RACERS_QUERY, { name: 'allRacersQuery'})(RacerList);