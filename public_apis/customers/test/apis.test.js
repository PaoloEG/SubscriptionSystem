const chai = require('chai');
const chaiHttp = require('chai-http');
const { app, killserver } = require('../apis');

chai.use(chaiHttp);
chai.should();

const testSub = {
    email: 'test@automatic.com',
    first_name: 'AutomaticTest',
    gender: 'male',
    newsletter_id: 'AHEBDHS65EL',
    birthdate: '1950-03-09',
    privacy_acceptance: true
}

const wrongTestSub = {
    email: 'test@automatic.com',
    newsletter_id: 'AHEBDHS65EL',
    privacy_acceptance: true
}

describe('Public Customers APIs', function () {
    this.timeout(0);

    after(async () => {
        await killserver();
    })

    describe('POST /subscriptions', () => {

        it('POST a correct formatted subscription record', (done) => {
            chai.request(app)
                .post('/subscriptions')
                .send(testSub)
                .end((err, res) => {
                    res.should.have.status(202);
                    res.body.should.be.a('object');
                    done();
                });
        });

        it('POST a subscription record without some fields', (done) => {
            chai.request(app)
                .post('/subscriptions')
                .send(wrongTestSub)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.a('object');
                    done();
                });
        });

        it('POST a subscription record with privacy acceptance to false', (done) => {
            chai.request(app)
                .post('/subscriptions')
                .send(Object.assign(testSub, { privacy_acceptance: false }))
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.a('object');
                    done();
                });
        });

    });

    describe('DELETE /subscriptions', () => {

        it('DELETE with no path parameters', (done) => {
            chai.request(app)
                .delete('/subscriptions')
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.be.a('object');
                    done();
                });
        });

        it('DELETE with a correct subscription id', (done) => {
            chai.request(app)
                .delete(`/subscriptions/${Buffer.from(testSub.email.slice(4, 14) + testSub.newsletter_id.slice(0, 10)).toString('hex')}`)
                .send(wrongTestSub)
                .end((err, res) => {
                    res.should.have.status(202);
                    res.body.should.be.a('object');
                    done();
                });
        });

    });

});