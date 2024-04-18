const express = require('express');
const app = express();
const port = 3004;
const amqp = require('amqplib');
const RMQ_URL = 'amqp://localhost:5672/';
const mysql = require('mysql');

// Setup MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'jacksonwang123$$',
  database: 'inventory'
});

// Connect to MySQL
connection.connect(err => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log('Successfully connected to the database');
});

// Function to handle read operations from the database
async function handleReadOperation(msg) {
  const parsedData = JSON.parse(msg);
  const itemId = parsedData.item_id;

  const sql = 'SELECT * FROM inventory WHERE item_id = ?';

  connection.query(sql, [itemId], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return;
    }
    console.log('Query results:', results);
  });
}

// Function to consume messages
async function consumeMessage(exchange, routingKey) {
  try {
    const conn = await amqp.connect(RMQ_URL);
    const channel = await conn.createChannel();
    await channel.assertExchange(exchange, 'topic', { durable: false });
    const { queue } = await channel.assertQueue('', { exclusive: true });
    await channel.bindQueue(queue, exchange, routingKey);

    console.log(`Waiting for messages from exchange "${exchange}" with routing key "${routingKey}"...`);
    channel.consume(queue, msg => {
      if (msg) {
        console.log('Received message:', msg.content.toString());
        channel.ack(msg);
        handleReadOperation(msg.content.toString());
      }
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Start message consumption
consumeMessage('read', '');

app.listen(port, () => {
  console.log(`Consumer 4 listening on port ${port}`);
});
