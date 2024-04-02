const express = require('express')
const app = express()
const port = 3001
const amqp = require('amqplib');
const RMQ_URL = 'amqp://localhost:5672/';


async function consumeMessage(exchange, routingKey){
  try{
    // Connect to rabbitMQ server and retirieve the message 
    const con = await amqp.connect(RMQ_URL);
    const channel = await con.createChannel();

    await channel.assertExchange(exchange, 'topic', { durable: false });
    
    const { queue } = await channel.assertQueue('', { exclusive: true });

    await channel.bindQueue(queue, exchange, routingKey);

    console.log(`Waiting for messages from exchange "${exchange}" with routing key "${routingKey}"...`);
    channel.consume(queue, (msg) => {
      if (msg) {
        const messageContent = msg.content.toString();
        console.log('Received message:', messageContent);
        channel.ack(msg);
      }
    });
  } catch(error){
    console.error('Error: ', error.message);
  }
}


consumeMessage('delete', '');


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
