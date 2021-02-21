const config = require('./config');
const RabbitMQ = require('./service/RabbitMQ').RabbitClient;
const MailService = require('./service/Nodemailer').MailService;
const rabbit = new RabbitMQ(process.env.RABBIT);
const mailClient = new MailService(config.nodemailerConfig);

const sendConfirmation = async (msg) => {
    if (msg !== null) {
        console.log(`new mail message received: ${JSON.stringify(msg)}`);
        const message = JSON.parse(msg.content.toString());
        await mailClient.sendEmail('amazing@company.com',message.email,`Welcome ${message.name}`,`Welcome ${message.name} and thanks for the subscription to the ${message.subscription_id} campaign.`);
    }
};

async function app(){
    const consumer = rabbit.createConsumer(config.CONFIRMATION_EMAIL_QUEUE,sendConfirmation);
}

app();