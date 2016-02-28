import fetch from 'isomorphic-fetch'
import {push} from 'react-router-redux'

function doFetch(url, options) {
  const finalUrl = 'http://api.ncrum.io' + url
  return fetch(finalUrl, options)
}

export const ALERT_MESSAGE = 'ALERT_MESSAGE'

export function alertMessage(message, style, time) {
  return {
    type: ALERT_MESSAGE,
    message,
    style,
    time
  }
}

export const POLL_ALERT = 'POLL_ALERT'

export function pollAlert() {
  return {
    type: POLL_ALERT
  }
}



export function flashAlert(message, style) {
  return (dispatch, getState) =>  {
    const time = Date.now()
    dispatch(alertMessage(message, style, time))
    let promise = new Promise(function(resolve, reject) {
      function alertLoop() {
        const {alerts} = getState()
        if (alerts.messages[0].time === time) {
          resolve()
        } else {
          setTimeout(alertLoop, 1000)
        }
      }

      setTimeout(alertLoop, 1000)
    }).then(function() {
      setTimeout(() => dispatch(pollAlert()), 1000)
    })
  }
}

export const REQUEST_POSTS = 'REQUEST_POSTS'

export function requestPosts() {
  return {
    type: REQUEST_POSTS
  }
}

export const RECEIVE_POSTS = 'RECEIVE_POSTS'

export function receivePosts(json) {
  return {
    type: RECEIVE_POSTS,
    posts: json,
    receivedAt: Date.now()
  }
}

function fetchPosts() {
  return dispatch => {
    dispatch(requestPosts())
    return doFetch(`/blog?fl=title`)
      .then(response => response.json())
      .then(json => {
        dispatch(receivePosts(json))
      })
  }
}

function shouldFetchPosts(state) {
  if (!state.blog.posts) {
    return true
  } else if (state.blog.isFetching) {
    return false
  } else {
    return true;
  }
}

export function fetchPostsIfNeeded() {

  // Note that the function also receives getState()
  // which lets you choose what to dispatch next.

  // This is useful for avoiding a network request if
  // a cached value is already available.

  return (dispatch, getState) => {
    if (shouldFetchPosts(getState())) {
      // Dispatch a thunk from thunk!
      return dispatch(fetchPosts())
    } else {
      // Let the calling code know there's nothing to wait for.
      return Promise.resolve()
    }
  }
}

export const REQUEST_POST = 'REQUEST_POST'

export function requestPost(title) {
  return {
    type: REQUEST_POST,
    title: title
  }
}

export const RECEIVE_POST = 'RECEIVE_POST'

export function receivePost(title, json) {
  return {
    type: RECEIVE_POST,
    title: title,
    post: json,
    receivedAt: Date.now()
  }
}

function fetchPost(title) {
  return dispatch => {
    dispatch(requestPost(title))
    return doFetch(`/blog?conditions={"title":"${title}"}`)
      .then(response => response.json())
      .then(json => {
        if (Array.isArray(json)) {
          json = json[0]
        }

        dispatch(receivePost(title, json))
      })
  }
}

function shouldFetchPost(title, state) {
  if (!state.blog[title]) {
    return true
  } else if (state.blog[title].isFetching) {
    return false
  } else {
    return true;
  }
}

export function fetchPostIfNeeded(title) {

  // Note that the function also receives getState()
  // which lets you choose what to dispatch next.

  // This is useful for avoiding a network request if
  // a cached value is already available.

  return (dispatch, getState) => {
    if (shouldFetchPost(title, getState())) {
      // Dispatch a thunk from thunk!
      return dispatch(fetchPost(title))
    } else {
      // Let the calling code know there's nothing to wait for.
      return Promise.resolve()
    }
  }
}
export function updatePost(_id, title, body) {
  return dispatch => {
    dispatch(requestPost(title))
    return doFetch(`/blog/${_id}`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({title, body: encodeURIComponent(body)})
    }).then(response => response.json())
      .then(json => {
        if (Array.isArray(json)) {
          json = json[0]
        }

        dispatch(push(`/edit/${title.addDashes()}`))
        dispatch(receivePost(title, json))
      })
  }
}
