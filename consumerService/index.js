const express = require('express')
const app = express()
const port = 3000
// var amqp = require('amqplib/callback_api');

// amqp.connect('amqp://localhost', function(error0, connection) {});



app.get('/healthcheck', (req, res) => {
  res.json({"Health": "ok"})
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
