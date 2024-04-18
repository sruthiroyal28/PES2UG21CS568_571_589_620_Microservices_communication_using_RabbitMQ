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
  password: 'jacksonwang123$$',
  database: 'inventory'
});

async function connect_to(msg) {
  connection.connect((err) => {
    if (err) {
      console.error("Error connecting to the database");
      return;
    }
    console.log('Successfully Connected to the database');
  });

  const parsedData = JSON.parse(msg);

  const item = parsedData.item_id;

  const sql = 'DELETE FROM stock WHERE item_id = ?';

  // Execute the query with placeholders
  connection.query(sql, [item], (err, results) => {
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

async function consumeMessage(exchange, routingKey) {
  try {
    // Connect to RabbitMQ server and retrieve the message 
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
    });
  } catch (error) {
    console.error('Error: ', error.message);
  }
}

consumeMessage('delete', '');

app.listen(port, () => {
  console.log(`Consumer 3 listening on port ${port} for stock management operations.`);
});
