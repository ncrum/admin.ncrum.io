import React from 'react'
import {Link} from 'react-router'
import {connect} from 'react-redux'
import {fetchPostsIfNeeded} from '../actions'

class List extends React.Component {

  constructor(props) {
    super(props)
  }

  componentDidMount() {
    const { dispatch } = this.props
    dispatch(fetchPostsIfNeeded())
  }

  componentWillReceiveProps(nextProps) {
    const { dispatch, isFetching, posts } = nextProps
    if (!posts && !isFetching) {
      dispatch(fetchPostsIfNeeded())
    }
  }

  render() {
    return (
      <section className="List-container">
        <ul className="list">
          {
            this.props.posts.map((post) => {
              return (
                <li className="item" key={post._id}>
                  <Link to={`/edit/${post.title.addDashes()}`} activeClassName="active">
                    {post.title}
                  </Link>
                </li>
              )
            })
          }
        </ul>
      </section>
    )
  }
}

List.fetchData = function(args) {
  const {store} = args;
  return store.dispatch(fetchPostsIfNeeded())
}

// now we connect the component to the Redux store:
var mapStateToProps = function(state){
    // This component will have access to `state.blog.posts` through `this.props.posts`
    return {
      posts:  state.blog.posts || [],
      isFetching: (state.blog.posts) ? state.blog.isFetching : true,
      lastUpdated: state.blog.lastUpdated
    }
};

export default connect(mapStateToProps)(List)
