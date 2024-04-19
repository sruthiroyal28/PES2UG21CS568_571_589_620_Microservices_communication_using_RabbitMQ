const express = require('express');
const app = express();
const port = 3003;
const amqp = require('amqplib');
const RMQ_URL = 'amqp://localhost:5672/';
const mysql = require('mysql');
const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '24982498',
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

// Function to handle delete operations from the database
async function handleDeleteOperation(msg) {
  const parsedData = JSON.parse(msg);
  const inventoryId = parsedData.inventory_id;

  const sql = 'DELETE FROM inventory WHERE inventory_id = ?';

  connection.query(sql, [inventoryId], (err, result) => {
    if (err) {
      console.error('Error executing query:', err);
      return;
    }

    if (result.affectedRows === 0) {
      console.log('No rows were deleted. Inventory ID not found.');
    } else {
      console.log('Deleted', result.affectedRows, 'row(s).');
    }
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
        handleDeleteOperation(msg.content.toString());
      }
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

consumeMessage('delete', '');

app.listen(port, () => {
  console.log(`Consumer 3 listening on port ${port} for stock management operations.`);
});
