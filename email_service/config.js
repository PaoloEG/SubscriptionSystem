module.exports.SUBSCRIBE_QUEUE = 'subscribe';
module.exports.UNSUBSCRIBE_QUEUE = 'unsubscribe';
module.exports.CONFIRMATION_EMAIL_QUEUE = 'sendconfirm';
module.exports.UNSUBSCRIBE_EMAIL_QUEUE = 'sendbyebye';

module.exports.nodemailerConfig = {
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'robert.auer@ethereal.email',
        pass: 'e66zqvK5MftSRnsukx'
    }
};