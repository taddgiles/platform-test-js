var express = require('express')
var bodyParser = require('body-parser')
var mongoose = require('mongoose')
var User = require('./user')
var bcrypt = require('bcrypt')
var jwt = require('jwt-simple')
var secret = process.env.JWT_SECRET || 'secret'

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/platform-test')

var app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

var router = express.Router()

router.use((req, res, next) => {
  if (req.originalUrl.match(/authenticate$/)) return next()

  var header = req.get('Authorization') || ''
  var token = header.split(' ')[1]

  if (!token) return res.status(401).json()

  try {
    var userId = jwt.decode(token, secret).userId
  } catch (ex) {
    return res.status(401).json(ex.message)
  }

  User.findById(userId, function(err, user) {
    if (err) return res.json(err)
    if (!user) return res.status(401).json()

    req.user = user
    next()
  })
})

router.route('/authenticate')
  .post((req, res) => {
    User.findOne({ email: req.body.email }, (err, user) => {
      if (err) return res.json(err)
      if (!user) return res.status(404).json()

      console.log('USER', user)
      if (!bcrypt.compareSync(req.body.password, user.passwordDigest)) {
        return res.status(401).json({ message: 'Invalid password' })
      }

      var payload = { userId: user._id }
      res.json({ authToken: jwt.encode(payload, secret) })
    })
  })

router.route('/current')
  .get((req, res) => { res.json(req.user) })

router.route('/')
  .get(function(req, res) {
    User.find(function(err, users) {
      if (err) return res.json(err)
      res.json(users)
    })
  })
  .post(function(req, res) {
    var user = new User()
    user.name = req.body.name
    user.email = req.body.email
    if (req.body.password) {
      user.password = req.body.password
    }

    user.save(function(err) {
      if (err) return res.json(err)
      res.json(user)
    })
  })

router.route('/:id')
  .get(function(req, res) {
    User.findById(req.params.id, function(err, user) {
      if (err) return res.json(err)
      res.json(user)
    })
  })

app.use('/api/v1/users', router)

var PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`)
})
