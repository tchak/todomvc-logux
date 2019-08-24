import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import App from './components/App'
import reducer from './reducers'
import 'todomvc-app-css/index.css'

import createLoguxCreator from '@logux/redux/create-logux-creator'
import badge from '@logux/client/badge'
import badgeStyles from '@logux/client/badge/default'
import badgeMessages from '@logux/client/badge/en'
import log from '@logux/client/log'
import IndexedStore from '@logux/client/indexed-store'

const createStore = createLoguxCreator({
  subprotocol: '1.0.0',
  server: process.env.NODE_ENV === 'development'
    ? 'ws://localhost:31337'
    : 'wss://logux.example.com',
  userId: 'paul',  // TODO: We will fill it in next chapter
  credentials: '', // TODO: We will fill it in next chapter
  store: new IndexedStore()
});
const store = createStore(reducer)
store.client.start()

badge(store.client, { messages: badgeMessages, styles: badgeStyles })
log(store.client);

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
