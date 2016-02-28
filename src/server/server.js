import 'babel-polyfill'
import koa      from 'koa'
import bodyParser from 'koa-bodyparser'
import koaErr from 'koa-error'
import morgan from 'koa-morgan'
import serve from 'koa-static'
import less from 'koa-less'
import auth from 'koa-basic-auth'
import path from 'path'
import web from './web'

const app      = koa()

app.use(koaErr())
app.use(bodyParser())
app.use(morgan.middleware('dev'))

let stylePath = path.join(__dirname, '../site/styles')
app.use(less(stylePath))
app.use(serve(stylePath))
app.use(serve(path.join(process.cwd(), 'node_modules/highlight.js/styles')))

app.use(function *(next){
  try {
    yield next;
  } catch (err) {
    if (401 == err.status) {
      this.status = 401;
      this.set('WWW-Authenticate', 'Basic');
      this.body = 'Unauthenticated';
    } else {
      throw err;
    }
  }
});

const creds = { name: process.env.ADMIN_USER || 'admin', pass: process.env.ADMIN_PASS || 'admin' }
app.use(auth(creds))


web(app);

app.listen(process.env.PORT || 3000)
