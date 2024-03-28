const express = require('express');
const app = express();
const port = 3000;
const amqp = require('amqplib');
const bodyParser = require('body-parser');
const RMQ_URL = 'amqp://localhost:5672/';

app.use(bodyParser.json());


async function pub(exchange, routingKey, message) {
  try{
    // Todo: Connect to rabbitMQ server and publish message.
    console.log("pub function")
    const con = await amqp.connect(RMQ_URL);
    const channel = await con.createChannel();

    await channel.assertExchange(exchange, 'topic', { durable: false });
    channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)));

    console.log("pub function") 
    
    await channel.close();
    await con.close();

    console.log(`Message published to exchange "${exchange}" with routing key "${routingKey}"`);
  } catch(error){
      console.error("Error in pub function:", error.message);
    throw error;  }
}

app.get('/', (req, res) => {
  res.send('Hello World!')
});

app.get('/consumer1', async (req, res) => {
  try{
    const healthCheckMessage = { status: "Perform Healthcheck"};

    await pub("health", '', healthCheckMessage);

    res.send('HealthCheck message published successfully');
  } catch(error){
    res.send("error from api");
  }
});

app.get('/consumer2', async (req, res) => {
  try{
    const data = req.body;
    console.log(data);
    await pub('create', '', data);

    res.send('Item data published successfully')
  } catch(error){
    res.send(error.message);
  }
})

app.get('/consumer3', async (req, res) => {
  try{
    const data = req.body;
    console.log(data);
    await pub('delete', '', data);

    res.send('Item data published successfully')
  } catch(error){
    res.send(error.message);
  }
})

app.get('/consumer4', async (req, res) => {
  try{
    const data = req.body;
    console.log(data);
    await pub('read', '', data);

    res.send('Item data published successfully')
  } catch(error){
    res.send(error.message);
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
