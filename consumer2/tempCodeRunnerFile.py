import logging
import time
import pika
from pika.exchange_type import ExchangeType


def main():
    LOG_FORMAT = ('%(levelname) -10s %(asctime)s %(name) -30s %(funcName) '
                  '-35s %(lineno) -5d: %(message)s')
    LOGGER = logging.getLogger(__name__)
    logging.basicConfig(level=logging.INFO, format=LOG_FORMAT)

    amqp_url = "your_amqp_url"  # Replace with your RabbitMQ URL

    # Consumer class with reconnection logic
    class ExampleConsumer(object):
        EXCHANGE = 'message'
        EXCHANGE_TYPE = ExchangeType.topic
        QUEUE = 'text'
        ROUTING_KEY = 'example.text'

        def __init__(self):
            self.should_reconnect = False
            self._connection = None
            self._channel = None
            self._closing = False
            self._consumer_tag = None
            self._url = amqp_url
            self._consuming = False
            self._prefetch_count = 1

        def connect(self):
            LOGGER.info('Connecting to %s', self._url)
            return pika.SelectConnection(
                parameters=pika.URLParameters(self._url),
                on_open_callback=self.on_connection_open,
                on_open_error_callback=self.on_connection_open_error,
                on_close_callback=self.on_connection_closed)

        def close_connection(self):
            self._consuming = False
            if self._connection.is_closing or self._connection.is_closed:
                LOGGER.info('Connection is closing or already closed')
            else:
                LOGGER.info('Closing connection')
                self._connection.close()

        def on_connection_open(self, connection):
            LOGGER.info('Connection opened')
            self.open_channel(connection)

        def on_connection_open_error(self, unused_connection, err):
            LOGGER.error('Connection open failed: %s', err)
            self.reconnect()

        def on_connection_closed(self, unused_connection, reason):
            self._channel = None
            if self._closing:
                self._connection.ioloop.stop()
            else:
                LOGGER.warning('Connection closed, reconnect necessary: %s', reason)
                self.reconnect()

        def reconnect(self):
            self.should_reconnect = True
            LOGGER.info('Reconnecting in 5 seconds...')
            time.sleep(5)
            self._connection = self.connect()

        def on_channel_open(self, channel):
            LOGGER.info('Channel opened')
            self._channel = channel
            self._setup_subscriptions(channel)

        def on_channel_closed(self, channel, reason):
            LOGGER.warning('Channel %i was closed: %s', channel, reason)
            self.should_reconnect = True
            self.close_connection()

        def on_message(self, channel, method, header, body):
            LOGGER.info('Received message # %s from %s: %s', method.delivery_tag, header.routing_key, body.decode())
            self.ack_message(channel, method.delivery_tag)

        def ack_message(self, channel, delivery_tag):
            LOGGER.debug('Acknowledging message %i', delivery_tag)
            channel.basic_ack(delivery_tag)

        def stop_consuming(self):
            if self._channel:
                LOGGER.info('Stopping consuming')
                self._channel.basic_cancel(self._consumer_tag)
                self._consuming = False
                return True
            else:
                return False

        def close_channel(self):
            if self._channel:
                LOGGER.info('Closing channel')
                self._channel.close()
                self._channel = None
                return True
            else:
                return False

        def _setup_subscriptions(self, channel):
            LOGGER.info('Setting up subscriptions')
            channel.exchange_declare(exchange=self.EXCHANGE, exchange_type=self.EXCHANGE_TYPE)
            result = channel.queue_declare(exclusive=False, auto_delete=True, queue=self.QUEUE)
            queue_name = result.method.queue

            channel.queue_bind(exchange=self.EXCHANGE, routing_key=self.ROUTING_KEY, queue=queue_name)

            # Tell RabbitMQ that we only want to receive one message at a time
            channel.basic_qos(prefetch_count=self._prefetch_count)

            self._consumer_tag = channel.basic_consume(queue=queue_name, on_message_callback=self.on_message)
            self._consuming = True

        def run(self):
            """This method starts the consumer in a loop
                waiting for incoming messages.
            """
            while True:
                if self._closing:
                    self._connection.ioloop.stop()
                    break
                self._connection.ioloop.start()
                self._wait_for_reconnect()

        def _wait_for_reconnect(self):
            if self.should_reconnect:
                self.should_reconnect = False
                self.try_reconnect()

            time.sleep(1)

        def try_reconnect(self):
            if self._connection:
                self._connection.ioloop.start()
                self._connection.ioloop.stop()

            while not self._connection:
                try:
                    self._connection = self.connect()
                except pika.exceptions.AMQPConnectionError:
                    LOGGER.warning('Connection failed, retrying in 5 seconds...')
                    time.sleep(5)


if __name__ == '__main__':
  consumer = ExampleConsumer()  # Here, the ExampleConsumer object is created
  consumer.run()                 # Here, the run method of the consumer object is called


                               
