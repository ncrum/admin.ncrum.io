import React from 'react'
import {Route, IndexRedirect} from 'react-router'
import App from './components/App'
import Editor from './components/Editor'
import List from './components/List'

export default function getRoutes() {
  return (
    <Route path="/"  component={App}>
      <IndexRedirect to="list"/>
      <Route path="list" component={List}/>
      <Route path="edit/:title" component={Editor}/>
    </Route>
  )
}
