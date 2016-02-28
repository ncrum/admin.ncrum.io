import React from 'react'
import {Route} from 'react-router'
import App from './components/App'
import Editor from './components/Editor'

export default function getRoutes() {
  return (
    <Route path="/list"  component={App}>
      <Route path="/edit/:title" component={Editor}/>
    </Route>
  )
}
