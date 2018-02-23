import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

import { ApolloProvider } from 'react-apollo';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';

import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import { split } from 'apollo-link';

import 'semantic-ui-css/semantic.min.css';

// Set up subscription
const wsLink = new WebSocketLink({
    uri: ` wss://subscriptions.us-west-2.graph.cool/v1/cjdvt3w5r2ybv0187nw90wtuo`,
    options: {
      reconnect: true
    }
});
const httpLink = new HttpLink({uri: 'https://api.graph.cool/simple/v1/cjdvt3w5r2ybv0187nw90wtuo'});
// Splits the requests based on the query type - 
// E.g. subscriptions go to wsLink and everything else to httpLink
const link = split(
    ({ query }) => {
        const { kind, operation } = getMainDefinition(query);
        return kind === 'OperationDefinition' && 
                operation === 'subscription';
    },
    wsLink,
    httpLink,
);

const client = new ApolloClient({
    link: link,
    cache: new InMemoryCache(),
});

const withApolloProvider = Comp => (
    <ApolloProvider client={client}>{Comp}</ApolloProvider>
  );

ReactDOM.render(
    withApolloProvider(<App />),
    document.getElementById('root')
);
registerServiceWorker();
