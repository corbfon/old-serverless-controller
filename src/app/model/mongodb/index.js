const { connect } = require('../../services/mongodb')

connect()

module.exports = {
  restModels: [require('./lesson')],
}
