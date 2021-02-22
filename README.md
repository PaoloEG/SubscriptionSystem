# Subscription System
##Introduction
The aim of this project is to develop a **subscription system** using microservices written in NodeJS and deployed in Docker.
The subscription system has to be composed of three main microservices:
- **Public Service**: the backend to be used by the frontend UI.
- **Subscription Service**: the service implementing the subscription logic, including persistence of subscription data.
- **Email Service**: the microservice implementing email notifications process.

The subscription system as of now provides these operations:
- Create new subscription
- Delete existing subscription
- Get details of a subscription
- Get all subscriptions

Since this could be the start for a production service, it should be reliable. In the table below the montly uptime and expected response time for each microservice.

|Service|Response time [ms]|Monthly uptime [%]|
| :---: | :---: | :---: |
|**Public Service**|100|99.99|
|**Subscription Service**|150|99.99|
|**Email Service**|60000|85|

##Infrastructure
The chosen infratructure can be seen below.
![infrastructure](/documentation/Infrastructure_schema.jpg)

###Public Service Layer
The public service layer has been splitted in two different microservices, due to the different possible loads and scaling needs:
- Admin APIs
- Customer APIs

####Admin APIs
The possiblity to have the details of a subscription (e.g. email of the user, subscription date, user name) has to be protected with some sort of authentication (privacy concertn, GDPR). In this scenario these two APIs are considered for "admins only", hence probably less subjected to heavy load. 
As a consequence of these considerations, and the type of operations that are needed, these APIs connects directly to the database (**MongoDB** in this case).

####Customer APIs
The apis subjected to heavy load are the one related to the customers, and in particular the one regarding the creation and deletion of a subscription. These APIs have been decoupled from the database using queues (**RabbitMQ** in particuar).
When a customer subscribes to a newsletter, the "Create Subscription" API is called. After input checking, the API generate a subscription ID that is returned to the caller (status 202) and insert into a **subscribe** queue all the received data.
The same procedure applies to unsubscribe events, where the delete API is called and the deletion task is queued in the **unsubscribe** queue.


###Subscription Service Layer
The subscription service layer is the microservice in charge of elaborating the data coming from the different queues and saves/delete the subscription from the database. This service is also in charge for the queuing of the confirmation email for the email service.
The subscription service has two different consumers:
- **Subscription Consumer**
This consumer works on the **subscribe** queue. Upon each message, the consumer check if the subscriber already exists on the database or not. If the subscriber already exists the consumer sends and ack to the queue broker and pass to the next message. If the subscriber is new, the record containing all the customer information is saved into the database, and a subset of userful information is sent to another queue for the email service.
- **Unsubscription Consumer**
This consumer has a much shorter and simple task with respect to the first one. It receives messages containing the subscription ID, and delete from the database (if needed) the record related to that subscription.

###Email Service
The email microservice is in charge of the email delivery process.
As a first development, the email service exploits the [Ethermail Service](https://ethereal.email/) along with the [Nodemailer](https://nodemailer.com) module for NodeJS. This implementation lets you send "fake" emails to a randomly generated ethereal user.
The email demon creates a consumer attached to the **confirmation email** queue. Each received message container email, name and subscription ID, useful to compose and send an email to the subscriber.

##Frameworks & Libraries
Until now this subscription service leverages the following technologies:
|Name|Version|Resources|
| :---: | :---: | :---: |
|NodeJS|14.15.5|[nodejs.org](https://nodejs.org/en/)|
|Docker & Docker Compose|20.10.2 & 3.1|[docs.docker.com](https://docs.docker.com)|
|MongoDB|4.4.4|[mongodb.com](https://www.mongodb.com/)|
|RabbitMQ|3.8.12|[rabbitmq.com](https://www.rabbitmq.com/)|
|Mocha|8.3.0|[mochajs.org](https://mochajs.org/)|
|Chai|4.3.0|[chaijs.org](https://www.chaijs.com/)|
|Joi|17.4.0|[joi.dev](https://joi.dev/)|
|Mongoose|5.11.17|[mongoosejs.com](https://mongoosejs.com/)|
|ExpressJS|4.17.1|[expressjs.com](https://expressjs.com/)|
|amqplib|0.6.0|[squaremobius.net](https://www.squaremobius.net/amqp.node/channel_api.html)|
|pm2|4.5.4|[pm2.keymetrics.io](https://pm2.keymetrics.io/)|
|Nodemailer|6.4.18|[nodemailer.com](https://nodemailer.com/)|

##Usage
####Deploy
In order to deploy the system a working installation of Docker is needed.
Once the installation is done, go in the root folder and type in a teminal:
```bash
docker-compose up --build
```
Once all the container are up and running you can use postman to try the exposed APIs.
Take into account that the **Customer APIs** can be found at [localhost:3000](localhost:3000) while the **Admin APIs** at [localhost:4000](localhost:4000).

####Test
Mocha tests can be found under the publicapi/customers folder and publicapi/admins folder. 
Right now the coverage is incomplete, and the tests only covers the RabbitMQ wrapper and some of the exposed apis.
Tests has to be run with at least the MongoDB and RabbitMQ container running. In order to start the tests put in the respective folder and type:
```bash
npm test
```

###Useful Tips
- Inside the documentation folder you can find a swagger.yml (copy/paste it inside a [swagger editor](https://editor.swagger.io/)) and a postman collection ready to be used.
- In order to see incoming emails go to [ethereal.mail](https://ethereal.email/) and log-in with the credentials that can be found in emailservice/config.js (under the name user, pass).
- Since this is a first version, the credentials for the admin APIs are hardcoded. In particular you can use admin/admin as username/password in order to login by means of a JWT token generated by the system. Keep in mind that this is an unsecure system that will be changed soon.






