const express = require('express')
const app = express()
const port = 3000
var amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function(error0, connection) {});



app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
