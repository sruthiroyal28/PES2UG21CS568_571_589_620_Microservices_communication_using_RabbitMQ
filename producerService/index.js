"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const port = 3000;
const amqplib_1 = __importDefault(require("amqplib"));
const body_parser_1 = __importDefault(require("body-parser"));
const RMQ_URL = 'amqp://localhost:5672/';
app.use(body_parser_1.default.json());
function pub(exchange, routingKey, message) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Todo: Connect to rabbitMQ server and publish message.
            console.log("pub function");
            const con = yield amqplib_1.default.connect(RMQ_URL);
            const channel = yield con.createChannel();
            yield channel.assertExchange(exchange, 'topic', { durable: false });
            channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)));
            console.log("pub function");
            yield channel.close();
            yield con.close();
            console.log(`Message published to exchange "${exchange}" with routing key "${routingKey}"`);
        }
        catch (error) {
            console.error("Error in pub function:", error.message);
            throw error;
        }
    });
}
app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.post('/consumer1', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("hi");
        const healthCheckMessage = { "status": "ok" };
        yield pub("health", '', healthCheckMessage);
        res.send('HealthCheck message published successfully');
    }
    catch (error) {
        res.send("error from api");
    }
}));
app.post('/consumer2', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = req.body;
        console.log(data);
        yield pub('create', '', data);
        res.send('Item data published successfully');
    }
    catch (error) {
        res.send(error.message);
    }
}));
app.post('/consumer3', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = req.body;
        console.log(data);
        yield pub('delete', '', data);
        res.send('Item data published successfully');
    }
    catch (error) {
        res.send(error.message);
    }
}));
app.post('/consumer4', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = req.body;
        console.log(data);
        yield pub('read', '', data);
        res.send('Item data published successfully');
    }
    catch (error) {
        res.send(error.message);
    }
}));
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
