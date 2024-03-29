import express, {Express, Request, Response} from 'express';
const app: Express = express();
const port = 3000;
import amqp from 'amqplib';
import bodyParser from 'body-parser';

const RMQ_URL = 'amqp://localhost:5672/';

app.use(bodyParser.json());

async function pub(exchange: string, routingKey: string, message: any) {
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
  } catch(error: any){
      console.error("Error in pub function:", error.message);
    throw error;  }
}

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!')
});

app.post('/consumer1', async (req: Request, res: Response) => {
  try{
    console.log("hi");
    const healthCheckMessage = { "status": "ok" };

    await pub("health", '', healthCheckMessage);

    res.send('HealthCheck message published successfully');
  } catch(error: any){
    res.send("error from api");
  }
});

app.post('/consumer2', async (req: Request, res: Response) => {
  try{
    const data = req.body;
    console.log(data);
    await pub('create', '', data);

    res.send('Item data published successfully')
  } catch(error: any){
    res.send(error.message);
  }
})

app.post('/consumer3', async (req: Request, res: Response) => {
  try{
    const data = req.body;
    console.log(data);
    await pub('delete', '', data);

    res.send('Item data published successfully')
  } catch(error: any){
    res.send(error.message);
  }
})

app.post('/consumer4', async (req: Request, res: Response) => {
  try{
    const data = req.body;
    console.log(data);
    await pub('read', '', data);

    res.send('Item data published successfully')
  } catch(error: any){
    res.send(error.message);
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

