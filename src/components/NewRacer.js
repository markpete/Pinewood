import React, { Component } from 'react';
import { Segment, Form, Grid, Input, Label, Message } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

import gql from 'graphql-tag';
import { graphql, withApollo, compose } from 'react-apollo';
import { ALL_RACERS_QUERY } from './RacerList';

const CREATE_RACER_MUTATION = gql`
    mutation CreateRacerMutation($name: String!, $den: String, $carID: Int, $weight: Float) {
        createRacer(name: $name, den: $den, carID: $carID, weight: $weight) {
            id
            name
            den
            carID
            weight
        }
    }
`;

const UPDATE_RACER_MUTATION = gql`
    mutation UpdateRacerMutation($id: ID!, $name: String!, $den: String, $carID: Int, $weight: Float) {
        updateRacer(id:$id, name: $name, den: $den, carID: $carID, weight: $weight) {
            id
            name
            den
            carID
            weight
        }
    }
`;

const GET_RACER = gql`
  query SingleRacer($id: ID) {
    Racer (id: $id) {
     id
      name
      den
      carID
      weight
    }
  }
`;

class NewRacerForm extends Component {
  state = {
    errors: {
      name: false,
      den: false,
      carID: false,
      weight: false
    }
  }

  async componentWillMount() {
    if(this.props.match.params.record) {
      // Get Record
      let id = this.props.match.params.record;
      const racerQuery = await this.props.client.query({
        query: GET_RACER,
        variables: {
          id: id
        }
      });
      if(!racerQuery.data.Racer) {
        return;
      }
      this.setState(racerQuery.data.Racer);
      // Set initial values
      document.getElementsByName('name')[0].value = racerQuery.data.Racer.name;
      document.getElementsByName('carID')[0].value = racerQuery.data.Racer.carID;
      document.getElementsByName('weight')[0].value = racerQuery.data.Racer.weight;
      this.setState({edit: true});
    }
  }

  handleChange = (e, { name, value }) => this.setState({ [name]: value });

  isErrorData = (name, den, carID, weight) => {
    let errors = {};
    errors.name = !name;
    errors.den = !den;
    errors.carID = isNaN(carID) || (carID < 0);
    errors.weight = isNaN(weight) || (weight <= 0);
    this.setState({errors: errors});
    return (errors.name || errors.den || errors.carID || errors.weight);
  }

  handleClick = async () =>  {
    let { id, name, den, carID, weight } = this.state;
    if(typeof carID !== "number") {
      carID = parseInt(carID, 10);
    }
    if(typeof weight !== "number") {
      weight = parseFloat(weight);
    }
    if(this.isErrorData(name, den, carID, weight)) return;
    if(!!this.state.edit) {
      await this.props.updateRacerMutation({
        variables: {
          id,
          name,
          den,
          carID,
          weight
        },
        update: (store, { data: { updateRacer } }) => {
          const data = store.readQuery({ query: ALL_RACERS_QUERY });
          if(!data.allRacers) {
            console.error("No Racers");
          } else {
            let i=data.allRacers.length-1;
            while(data.allRacers[i].id !== updateRacer.id && i>=0) {
                i--;
            }
            if(i>=0) {
                data.allRacers.splice(i, 1, updateRacer);
            }
            // Write our data back to the cache.
            store.writeQuery({ query: ALL_RACERS_QUERY, data });
          }
        }
      })
    } else {
      await this.props.createRacerMutation({
          variables: {
              name,
              den,
              carID,
              weight
          },
          update: (store, { data: { createRacer } }) => {
            const data = store.readQuery({ query: ALL_RACERS_QUERY });          
            // Add our todo from the mutation to the end.
            data.allRacers.push( createRacer );
            // Write our data back to the cache.
            store.writeQuery({ query: ALL_RACERS_QUERY, data });
      } 
      });
    }
   this.props.history.push('/');
  }


  render() {
    const { den } = this.state;
    const btnText = (this.state.edit ? "Update" : "Submit");
    return (
      <Segment padded>
        <Form error={this.state.errors.den} >
          <Label color='blue' className='margin2'>Name:</Label>
          <Form.Input focus size='massive' name='name' placeholder="Racer's Full Name"
            onChange={this.handleChange} error={this.state.errors.name} />
          <Grid columns={2} padded>
          <Grid.Column className='two wide'>
          <Form.Group className='denList'>
            <Label color='blue' className='margin2'>Den:</Label>
            <Form.Radio label='Tiger' value='Tiger' name='den' checked={den === 'Tiger'} onChange={this.handleChange} />
            <Form.Radio label='Wolf' value='Wolf' name='den' checked={den === 'Wolf'} onChange={this.handleChange} />
            <Form.Radio label='Bear' value='Bear' name='den' checked={den === 'Bear'} onChange={this.handleChange} />
            <Form.Radio label='Webelos' value='Webelos' name='den' checked={den === 'Webelos'} onChange={this.handleChange} />
            <Form.Radio label='Sibling' value='Sibling' name='den' checked={den === 'Sibling'} onChange={this.handleChange} />
          </Form.Group>
          <Message error header='Den Required' content='Please select a den from the list and resubmit' />
          </Grid.Column>
          <Grid.Column className='three wide'>
          <Label color='blue' className='margin2'>Car #:</Label>
          <Form.Input placeholder='Enter the number on the car...'  type='number' min='0' name='carID'
            onChange={this.handleChange} error={this.state.errors.carID} />
          <Label color='blue' className='margin2'>Weight:</Label>
          <Input label={{ basic: true, content: 'oz' }} type='number' min='0' step='0.01'
            labelPosition='right'
            placeholder='What does the car weigh?' 
            name='weight'
            onChange={this.handleChange}
            error={this.state.errors.weight}
            />
          </Grid.Column>
          </Grid> 
          <div style={{display: 'flex'}}>          
          <Form.Button
            color='black'
            onClick={this.handleClick}
            >{btnText}
          </Form.Button>

          {!!this.state.edit && 
          <Link to='/'>
          <Form.Button basic color='red'>Cancel</Form.Button>
          </Link>
          } 
          </div>
        </Form>
      </Segment>   
    );
  }
}

export default compose (
  graphql(CREATE_RACER_MUTATION, { name: 'createRacerMutation' }), 
  graphql(UPDATE_RACER_MUTATION, { name: 'updateRacerMutation' }),
  graphql(ALL_RACERS_QUERY, { name: 'allRacersQuery' })
) (withApollo(NewRacerForm));
