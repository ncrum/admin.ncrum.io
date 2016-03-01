'use strict'

import React, {Component} from 'react'
import {connect} from 'react-redux'
import {fetchPostIfNeeded, updatePost, flashAlert} from '../actions'
import {Link} from 'react-router'

import marked from 'marked'
import highlight from 'highlight.js'

marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: true,
  pedantic: false,
  sanitize: true,
  smartLists: true,
  smartypants: false,
  highlight: function (code) {
    return highlight.highlightAuto(code).value
  }
});

class MyEditor extends Component {

  constructor(props) {
    super(props)

    this.state = this.props.post || {
      _id: null,
      body: '',
      title: ''
    }

    this.onChange = this.onChange.bind(this)
    this.onChangeTitle = this.onChangeTitle.bind(this)
    this.onSave = this.onSave.bind(this)
    this.handleKeydown = this.handleKeydown.bind(this)
  }

  componentDidMount() {
    const { dispatch, params, post } = this.props
    dispatch(fetchPostIfNeeded(params.title.removeDashes()))


    const {_id, title, body} = post

    this.setState({
      _id, title, body: body ? decodeURIComponent(body) : ''
    })

    document.addEventListener('keydown', this.handleKeydown, false)
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeydown, false)
  }

  componentWillReceiveProps(nextProps) {
    const { dispatch, params, isFetching } = nextProps
    if (nextProps.post && nextProps.post.title !== params.title.removeDashes() && !isFetching) {
      dispatch(fetchPostIfNeeded(params.title.removeDashes()))
    }

    const {_id, title, body} = nextProps.post

    this.setState({
      _id, title, body: body ? decodeURIComponent(body) : ''
    })
  }

  handleKeydown(e) {
    if (e.keyCode == 83 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
      e.preventDefault()

      this.onSave(e)
    }

    if (e.keyCode == 9 && e.target.tagName === 'TEXTAREA') {
      e.preventDefault()

      let s = e.target.selectionStart
      let value = e.target.value

      value = value.substring(0, e.target.selectionStart) + '  ' + value.substring(e.target.selectionEnd)

      this.setState({body: value})
      e.target.selectionEnd = s+2
    }
  }

  onChange(e) {
    const editor = this.refs.editor

    this.setState({body: e.target.value})
  }

  onChangeTitle(e) {
    const title = this.refs.title

    this.setState({title: e.target.value})
  }

  onSave(e) {
    const {_id, title, body} = this.state
    const {dispatch} = this.props

    dispatch([updatePost(_id, title, body), flashAlert('Saved!', 'success')])
  }

  render() {
    let {body, title} = this.state || {body: '', title: ''}
    let decodedBody = decodeURIComponent(body || ' ')

    let markdown = {
      __html : marked(decodedBody)
    }

    let height = 50;
    if (this.refs.editor) {
      height = this.refs.editor.scrollHeight - 20
    }

    if (decodedBody) {
      height = Math.max(decodedBody.split('\n').length * 27 + 20, height)
    }

    return (
      <div>
        <Link className="editor-back-btn" to="/list">{'< Back'}</Link>
        <div className="editor-root">
          <div className="editor-wrapper">
            <input type="text" value={title} onChange={this.onChangeTitle}/>
            <button type="button" onClick={this.onSave}>Save</button>
            <textarea
              style={{
                height: height
              }}
              value={decodedBody}
              onChange={this.onChange}
              placeholder="Tell a story..."
              ref="editor">
            </textarea>
          </div>
        </div>
        <div className="preview-root">
          <div className="preview-wrapper">
            <div className="markdown-body" dangerouslySetInnerHTML={markdown}></div>
          </div>
        </div>
      </div>
    )
  }
}

MyEditor.fetchData = function(args) {
  const {params, store} = args
  return store.dispatch(fetchPostIfNeeded(params.title.removeDashes()))
}

// now we connect the component to the Redux store:
var mapStateToProps = function(state){
  const {blog} = state;
  const {currentPost} = blog;

  if (blog[currentPost]) {
    return {...blog[currentPost]}
  } else {
    return {
      post: {},
      isFetching: true,
    }
  }
}

export default connect(mapStateToProps)(MyEditor)
