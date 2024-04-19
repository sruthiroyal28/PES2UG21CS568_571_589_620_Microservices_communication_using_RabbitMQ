FROM node:14  # Use Node.js for your JavaScript code

WORKDIR /app/consumer2

COPY PES2UG21CS568_571_589_620_Microservices_communication_using_RabbitMQ/consumer2/package-lock.json   ./
COPY PES2UG21CS568_571_589_620_Microservices_communication_using_RabbitMQ/consumer2/package.json ./

RUN npm install 
COPY PES2UG21CS568_571_589_620_Microservices_communication_using_RabbitMQ/consumer2/index.js    ./
#COPY PES2UG21CS568_571_589_620_Microservices_communication_using_RabbitMQ/consumer2/!node_modules ./


EXPOSE 3002  

# Database connection details (replace with environment variables)
ENV DB_HOST='localhost'
ENV DB_USER='root'
ENV DB_PORT = 3306
ENV DB_PASSWORD='jacksonwang123$$'
ENV DB_NAME= 'inventory'


# Assuming MySQL library is `mysql2` (adjust as needed)
COPY mysql /app/node_modules/

CMD ["node", "index.js"]  
