import 'babel-polyfill'
import koa      from 'koa'
import bodyParser from 'koa-bodyparser'
import koaErr from 'koa-error'
import morgan from 'koa-morgan'
import serve from 'koa-static'
import less from 'koa-less'
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

web(app);

app.listen(process.env.PORT || 3000)
