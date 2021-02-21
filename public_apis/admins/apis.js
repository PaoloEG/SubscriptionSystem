const express = require('express');
const validators = require('./validators/idx');
const auth = require('./service/Auth');
const mongoose = require('mongoose');
const models = require('./models/index');
const app = express();
const port = process.env.PORT || 5000
app.use(express.json());

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const user = auth.authenticate(authHeader.split(' ')[1]);
    Object.assign(req, { user: user });
    next();
  } catch (err) {
    res.sendStatus(401);
  }
}

app.post('/login', async (req, res) => {
  try {
    const creds = validators.user.validateLogin(req.body);
    try {
      const accessToken = auth.login(creds.username, creds.password);
      return res.status(200).send({ access_token: accessToken });
    } catch (err) {
      // console.log(`There was an error completing the subscription request: ${JSON.stringify(err)}`);
      return res.status(500).send({ message: 'oops, there was an error' });
    }
  } catch (err) {
    return res.status(400).send(err);
  }
})

app.get('/subscriptions', authMiddleware, async (req, res) => {
  try {
    console.log(`this is the query and body obj: ${JSON.stringify(req.query)} ${JSON.stringify(req.body)} `);
    const searchFilter = validators.subscriptions.validateSearchSubs(req.body);
    const searchQuery = validators.subscriptions.validateSearchSubsQuery(req.query);
    try {
      const limit = searchQuery.limit ? parseInt(searchQuery.limit, 10) : 50;
      let queryRes;
      if (searchQuery.next != null) {
        queryRes = await models.subscriber.find(Object.assign({ _id: { $lt: req.query.next } }, searchFilter)).sort({ _id: -1 }).limit(limit).select(['_id', 'email', 'subscription_id', 'newsletter_id']).lean();
      } else {
        queryRes = await models.subscriber.find(searchFilter).sort({ _id: -1 }).limit(limit).select(['_id', 'email', 'subscription_id', 'newsletter_id']).lean();
      }
      const next = queryRes.length < limit ? null : queryRes[queryRes.length - 1]._id;
      return res.status(200).send({ items: queryRes.map(e => { delete e._id; return e; }), next: next });
    } catch (err) {
      return res.status(500).send({ message: 'oops, there was an error' });
    }
  } catch (err) {
    return res.status(400).send(err);
  }
})

app.get('/subscriptions/:subscription_id', authMiddleware, async (req, res) => {
  try {
    const searchParam = validators.subscriptions.validateSubsDetails(req.params);
    try {
      const queryRes = await models.subscriber.find(searchParam).select('-__v','-_id').lean();
      return res.status(200).send(queryRes);
    } catch (err) {
      // console.log(`There was an error completing the subscription request: ${JSON.stringify(err)}`);
      return res.status(500).send({ message: 'oops, there was an error' });
    }
  } catch (err) {
    // console.log(`There was an error in your input: ${err}`);
    return res.status(400).send(err);
  }
})


mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true, server: { auto_reconnect: true }}).then(async () => {
  app.listen(port, () =>
    console.log(`Example app listening on port ${port}!`),
  );
});