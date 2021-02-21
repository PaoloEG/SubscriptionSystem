const express = require('express');
const validators = require('./validators/idx');
const RabbitMQ = require('./service/RabbitMQ').RabbitClient;
const rabbit = new RabbitMQ(process.env.RABBIT || 'amqp://localhost:5672');
const app = express();
const port = process.env.PORT || 4000
app.use(express.json());

app.post('/subscriptions', async (req, res) => {
  try {
    // console.log(`Hi Paolo, you are in the POST call, with this body: ${JSON.stringify(req.body)}`);
    const subscription = validators.subscriptions.validateSubscription(req.body);
    try {
      await rabbit.connect();
      await rabbit.send('subscribe', subscription);
      return res.status(202).send({ subscription_id: subscription.subscription_id });
    } catch (err) {
      // console.log(`There was an error completing the subscription request: ${JSON.stringify(err)}`);
      return res.status(500).send({ message: 'oops, there was an error' });
    }
  } catch (err) {
    // console.log(`There was an error in your input: ${err}`);
    return res.status(400).send(err);
  }
})

app.delete('/subscriptions/:subscription_id', async (req, res) => {
  try {
    // console.log('Hi Paolo, you are in the DELETE call, with these params: ' + JSON.stringify(req.params));
    validators.subscriptions.validateDeletion(req.params);
    // console.log('Subscription id to be deleted: ' + req.params.subscription_id);
    try {
      await rabbit.connect();
      await rabbit.send('unsubscribe', req.params);
      return res.status(202).send({ message: 'The request will be completed withing 12 hours' });
    } catch (err) {
      // console.log(`There was an error completing the unsubscription request: ${JSON.stringify(err)}`);
      return res.status(500).send({ message: 'oops, there was an error' });
    }
  } catch (err) {
    // console.log(`There was an error in your input: ${err}`);
    return res.status(400).send(err);
  }
})

app.listen(port, () => {
  console.log(`Public APIs Server run at http://localhost:${port}`);
});