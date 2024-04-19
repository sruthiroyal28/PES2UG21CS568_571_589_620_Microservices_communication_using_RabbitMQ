FROM node:14 

WORKDIR /app/consumer2

COPY package-lock.json   ./
COPY package.json ./
COPY node_modules ./
COPY index.js ./~
RUN npm install express
RUN npm install amqplib


#COPY PES2UG21CS568_571_589_620_Microservices_communication_using_RabbitMQ/consumer2/!node_modules ./

EXPOSE 3002  

# Assuming MySQL library is `mysql2` (adjust as needed)
#COPY mysql /app/node_modules/

CMD ["node", "index.js"]  
