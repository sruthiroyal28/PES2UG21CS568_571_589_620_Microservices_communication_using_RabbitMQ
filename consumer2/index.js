const express = require('express')
const app = express()
const port = 3009
const amqp = require('amqplib');
const RMQ_URL = 'amqp://localhost:5672/';
const mysql = require('mysql2/promise')
const connection = mysql.createConnection({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database:  DB_NAME
})

async function connect_to(msg)
{
  connection.connect((err)=>{
    if(err)
    {
      console.error("Error connecting to the database");
      return ;
    }
    console.log('Successfully Connected to the database');
  })

  const parsedData = JSON.parse(msg);

  const customer = parsedData.customer_id;
  const order = parsedData.order_date;
  const total_Amount = parsedData.total_amount;
  
  const sql = 'INSERT INTO orders (customer_id, order_date, total_amount) VALUES (?, ?, ?)';

// Execute the query with placeholders
  connection.query(sql, [customer, order, total_Amount], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return;
    }
    console.log('Query results:', results);
  });

  connection.end((err) => {
    if (err) {
      console.error('Error closing connection:', err);
      return;
    }
    console.log('Connection closed');
  });

}
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
        connect_to(messageContent);
      }
    
      //establishing connection to database
    });
  } catch(error){
    console.error('Error: ', error.message);
  }
}

consumeMessage('create', '');
  //res.json(msg);
// app.get('/itemcreation', (req, res) => {
//   consumeMessage('create', '');
//   res.json("Consumer2 started consuming messages");
// })

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})