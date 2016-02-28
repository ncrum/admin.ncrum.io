import React from 'react'
import {connect} from 'react-redux'

class FlashAlert extends React.Component {
  render() {
    const {messages} = this.props
    return (
      <div style={{
        display: (messages.length > 0 ? 'inline' : 'none'),
        position: 'fixed',
        width: '100%',
        height: '20px',
        top: 0,
        left: 0,
        textAlign: 'center',
        backgroundColor: '#2faf2f',
        color: '#fff'
      }}>
        { messages.length > 0 ?
          <span className={'flash' + messages[0].style}>{messages[0].message}</span>
          : ''
        }
      </div>
    )
  }
}

// now we connect the component to the Redux store:
var mapStateToProps = function(state){
  const {alerts} = state;

  return alerts || {
    messages: []
  }
}

export default connect(mapStateToProps)(FlashAlert)
