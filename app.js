var express = require('express')
var bodyParser = require('body-parser')
var jwt = require('jwt-simple')
var secret = process.env.JWT_SECRET || 'secret'

var knex = require('knex')({
  client: 'pg',
  connection: process.env.DATABASE_URL || "postgres://localhost/platform_test_development",
  searchPath: 'knex,public'
})

var app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

var router = express.Router()

router.use((req, res, next) => {
  var header = req.get('Authorization') || ''
  var token = header.split(' ')[1]

  if (!token) return res.status(401).json()

  try {
    var userId = jwt.decode(token, secret).user_id
  } catch (ex) {
    return res.status(401).json(ex.message)
  }

  knex('users').where({
    id: userId
  })
  .then((rows) => {
    if (rows.length === 0) {
      return res.status(401).json()
    }
    delete rows[0].password_digest
    req.user = rows[0]
    next()
  })
})

router.route('/current')
  .get((req, res) => { res.json(req.user) })

app.use('/api/v1/users', router)

app.use('/loaderio-75e286c322995445a7696c747b3a7d4e.txt', (req, res) => {
  res.send('loaderio-75e286c322995445a7696c747b3a7d4e')
})

var PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`)
})
