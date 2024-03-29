import json 
import asyncio
import aiohttp
import pika

RMQ_URL = 'amqp://localhost:5672/'

async def start_consumer2(exchange,routing_key):
    try:
        connection = pika.AsyncioConnectionParameters(RMQ_URL)
        channel = connection.channel()

        channel.exchange_declare(exchange='create',exchange_type='topic')

        result = channel.queue_declare('',exclusive=True)
        queue_name= result.method.queue

        await channel.queue_bind(exchange=exchange,queue=queue_name,routing_key=routing_key)

        print(f'Waiting for messages from exchange "{exchange}" with routing key "{routing_key}"...')

        def callback(ch,method,properties,body):
            print(f"Received message:{body.decode()}")
            ch.basic_ack(delivery_tag=method.delivery_tag)

            #inserting into database
            

        await channel.basic_consume(queue=queue_name, on_message_callback=callback, auto_ack=False)

        await asyncio.sleep(0.1) 


    except Exception as error:
        print(f"error :{error}")
async def main():
    exchange='create'
    routing_key=''

    await start_consumer2(exchange,routing_key)
app = aiohttp.web.Application()
app.router.add_get('/consumer2', lambda request: aiohttp.web.json_response(consume_message('create', '')))

if __name__ =='__main__':
    aiohttp.web.run_app(app,port=3002)