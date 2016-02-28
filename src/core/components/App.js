import React from 'react'
import FlashAlert from './FlashAlert'

class App extends React.Component {
  render() {
    return (
      <section className="base">
        {/*
          LeftNav 33%
          this.props.children 67%
        */}
        <FlashAlert/>
        {this.props.children}
      </section>
    )
  }
}

export default App
