const express = require('express');
const validators = require('./validators/idx');
const RabbitMQ = require('./service/RabbitMQ').RabbitClient;
const rabbit = new RabbitMQ(process.env.RABBIT);
const app = express();
const port = process.env.PORT || 6000
app.use(express.json());

app.post('/subscriptions', async (req, res) => {
  try {
    const subscription = validators.subscriptions.validateSubscription(req.body);
    try {
      await rabbit.send('subscribe', subscription, true);
      return res.status(202).send({ subscription_id: subscription.subscription_id });
    } catch (err) {
      return res.status(503).send({ message: 'sorry, the service is temporarly unavailable' });
    }
  } catch (err) {
    return res.status(400).send(err);
  }
})

app.delete('/subscriptions/:subscription_id', async (req, res) => {
  try {
    validators.subscriptions.validateDeletion(req.params);
    try {
      await rabbit.send('unsubscribe', req.params, true);
      return res.status(202).send({ message: 'The request will be completed withing 12 hours' });
    } catch (err) {
      return res.status(500).send({ message: 'oops, there was an error' });
    }
  } catch (err) {
    return res.status(400).send(err);
  }
})

app.listen(port, () => {
  console.log(`Public APIs Server run at http://localhost:${port}`);
});