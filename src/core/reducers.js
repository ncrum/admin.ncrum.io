import {
  REQUEST_POSTS, RECEIVE_POSTS,
  REQUEST_POST, RECEIVE_POST,
  ALERT_MESSAGE, POLL_ALERT
} from './actions'

function alert(state = {
    message: null,
    style: null,
    time: Date.now()
  }, action) {
  switch(action.type) {
    case ALERT_MESSAGE:
      let {message, style, time} = action
      return Object.assign({}, state, {
        message, style, time
      })
    default:
      return state
  }
}

function alerts(state = {
    messages: []
  }, action) {
  switch(action.type) {
    case ALERT_MESSAGE:
      return Object.assign({}, state, {
        messages: state.messages.concat(alert({}, action))
      })
    case POLL_ALERT:
      return Object.assign({}, state, {
        messages: state.messages.slice(1)
      })
    default:
      return state
  }
}

function posts(state = {
    isFetching: false,
    posts: []
  }, action) {
  switch(action.type) {
    case REQUEST_POSTS:
      return Object.assign({}, state, {
        isFetching: true,
      })
    case RECEIVE_POSTS:
      return Object.assign({}, state, {
        isFetching: false,
        posts: action.posts,
        lastUpdated: action.receivedAt
      })
    default:
      return state
  }
}

function post(state = {
  isFetching: false,
  post: {}
}, action) {
  switch(action.type) {
    case REQUEST_POST:
      return Object.assign({}, state, {
        isFetching: true
      })
    case RECEIVE_POST:
      return Object.assign({}, state, {
        isFetching: false,
        post: action.post,
        lastUpdated: action.receivedAt
      })
    default:
      return state
  }
}

function blog(state = {}, action) {
  switch(action.type) {
    case RECEIVE_POSTS:
    case REQUEST_POSTS:
      return Object.assign({}, state, posts(state, action))
    case REQUEST_POST:
    case RECEIVE_POST:
      return Object.assign({}, state, {
        currentPost : action.title,
        [action.title] : post(state[action.title], action)
      })
    default:
      return state
  }
}

export default {
  blog, alerts
}
