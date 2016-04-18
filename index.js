// var os = require('os')
// var throng = require('throng')
// var WORKERS = process.env.WEB_CONCURRENCY || os.cpus().length

// throng({
//   workers: WORKERS,
//   master: startMaster,
//   start: startWorker
// })

// function startMaster() {
//   console.log('Started master');
// }

// function startWorker(id) {
//   console.log(`Started worker ${ id }`)

  require('./app')

//   process.on('SIGTERM', () => {
//     console.log(`Worker ${ id } exiting...`)
//     process.exit()
//   })
// }
