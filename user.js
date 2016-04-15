var mongoose = require('mongoose')
var bcrypt = require('bcrypt')

var schema = mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  passwordDigest: {
    type: String
  }
},
{
  timestamps: true,
  versionKey: false,
  toJSON: {
    transform: (doc, obj) => {
      delete obj._id
      delete obj.passwordDigest
      obj.id = doc._id
    }
  }
})

schema.virtual('password').set(function(newPassword) {
  this.newPassword = newPassword
})

schema.methods.validatePassword = function(inputPassword) {
  return bcrypt.compareSync(inputPassword, this.passwordDigest)
}

schema.pre('validate', function(next) {
  if (this.newPassword) {
    this.passwordDigest = bcrypt.hashSync(this.newPassword, 10)
  }
  return next()
})

module.exports = mongoose.model('User', schema)
