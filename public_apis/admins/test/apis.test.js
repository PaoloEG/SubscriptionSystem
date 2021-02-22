const chai = require('chai');
const chaiHttp = require('chai-http');
const { app, killserver } = require('../apis');
process.env.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://subscriptionservice:securepassword@localhost:27017/subscription-service';

chai.use(chaiHttp);
chai.should();

const correctLogin = {
    username: 'admin',
    password: 'admin'
}
const wrongLogin = {
    username: 'qwerty',
    password: '234567890'
}
let token;

describe('Public Admin APIs', function () {
    this.timeout(0);

    after(async () => {
        await killserver();
    })

    describe('POST /login', () => {

        it('POST a correct login credential', (done) => {
            chai.request(app)
                .post('/login')
                .send(correctLogin)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    token = res.body.access_token;
                    done();
                });
        });

        it('POST a wrong login credential', (done) => {
            chai.request(app)
                .post('/login')
                .send(wrongLogin)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.a('object');
                    done();
                });
        });

    });

    describe('GET /subscriptions', () => {

        it('GET all subscriptions - should fail', (done) => {
            chai.request(app)
                .get('/subscriptions')
                .auth(token)
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.a('object');
                    done();
                });
        });

    });

});