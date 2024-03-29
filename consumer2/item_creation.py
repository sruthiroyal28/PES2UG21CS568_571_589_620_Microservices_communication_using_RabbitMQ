import json
import asyncio
from flask import Flask, jsonify
import pika

RMQ_URL = 'amqp://localhost:5672/'

def consume_message(exchange, routing_key):
    try:
        connection = pika.BlockingConnection(pika.ConnectionParameters(RMQ_URL))
        channel = connection.channel()

        channel.exchange_declare(exchange='create', exchange_type='topic')

        result = channel.queue_declare('', exclusive=True)
        queue_name = result.method.queue

        channel.queue_bind(exchange=exchange, queue=queue_name, routing_key=routing_key)

        print(f'Waiting for messages from exchange "{exchange}" with routing key "{routing_key}"...')

        def callback(ch, method, properties, body):
            print(f"Received message: {body.decode()}")
            ch.basic_ack(delivery_tag=method.delivery_tag)

            # Inserting into database

        channel.basic_consume(queue=queue_name, on_message_callback=callback, auto_ack=False)

        connection.ioloop.start()

    except Exception as error:
        print(f"Error: {error}")

def start_consumer2(exchange, routing_key):
    consume_message(exchange, routing_key)

def main():
    exchange = 'create'
    routing_key = ''
    start_consumer2(exchange, routing_key)

app = Flask(__name__)

@app.route('/consumer2')
def consumer2():
    exchange = 'create'
    routing_key = ''
    consume_message(exchange, routing_key)
    return jsonify({'status': 'Consumer 2 started consuming messages'})

if __name__ == '__main__':
    main()
    app.run(port=3002)
