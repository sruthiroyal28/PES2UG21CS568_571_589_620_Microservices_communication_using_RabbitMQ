const express = require('express');
const app = express();
const port = 3000;
const amqp = require('amqplib');
const bodyParser = require('body-parser');
const RMQ_URL = '...';

app.use(bodyParser.json());


async function pub(exchange, routingKey, message) {
  try{
    // Todo: Connect to rabbitMQ server and publish message.
    const con = await amqp.connect(RMQ_URL);
    const channel = await con.createChannel();

    await channel.assertExchange(exchange, 'topic', { durable: flase });

    await channe;.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)));
    
    await channel.close();
    await con.close();

    console.log(`Message published to exchange "${exchange}" with routing key "${routingKey}"`);
  } catch(error){
      console.error(error.message);
  }
}

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
