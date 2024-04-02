import pika
import logging
import flask

# Configure logging
logging.basicConfig(level=logging.INFO)

# Replace with your RabbitMQ URL
amqp_url = "amqp://localhost:5672/"


# class ExampleConsumer(object):
#     EXCHANGE = "create"
#     EXCHANGE_TYPE = 'topic'
#     QUEUE = "consumer2_queue"  # Define your queue name here
#     ROUTING_KEY = "item.created"  # Define your routing key here
#
#     def __init__(self):
#         self.connection = None
#         self.channel = None
#
#     def connect(self):
#         logging.info("Connecting to RabbitMQ...")
#         self.connection = pika.BlockingConnection(pika.URLParameters(amqp_url))
#         self.channel = self.connection.channel()
#         self.channel.exchange_declare(exchange=self.EXCHANGE, exchange_type=self.EXCHANGE_TYPE)
#         result = self.channel.queue_declare(queue=self.QUEUE, exclusive=False)
#         queue_name = result.method.queue
#         self.channel.queue_bind(exchange=self.EXCHANGE, routing_key=self.ROUTING_KEY, queue=queue_name)
#         self.channel.basic_consume(queue=queue_name, on_message_callback=self.on_message)
#
#     def on_message(self, channel, method, header, body):
#         logging.info(f"Received message: {body.decode()}")
#         # Process the message here (e.g., save it to a database)
#         channel.basic_ack(delivery_tag=method.delivery_tag)
#
#     def start_consuming(self):
#         logging.info("Starting to consume messages...")
#         self.connect()
#         self.channel.start_consuming()
#
#     def stop_consuming(self):
#         if self.channel:
#             self.channel.stop_consuming()
#         if self.connection:
#             self.connection.close()
#
#
app = flask.Flask(__name__)
#

@app.route('/consumer2', methods=['POST'])
def handle_message():
    # Add logic here to handle incoming POST requests
    # You can potentially access the message body from the request
    # and use the consumer object to do something with it (e.g., acknowledge)
    return "Message received", 200


if __name__ == "__main__":
    # consumer = ExampleConsumer()
    # consumer.start_consuming()
    app.run(debug=True, port=5002)  # Run the Flask app in debug mode
