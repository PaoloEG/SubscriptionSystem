const nodemailer = require('nodemailer');

module.exports.MailService = class {
    constructor(configObj) {
        this.config = configObj;
        this.transporter = nodemailer.createTransport({
            host: this.config.host,
            port: this.config.port,
            secure: this.config.port == 465 ? true : false,
            auth: {
                user: this.config.auth.user,
                pass: this.config.auth.pass
            }
        });
    }

    async sendEmail(from, to, subject = 'Welcome', text = 'Hi user, welcome to this newsletter!') {
        const info = await this.transporter.sendMail({
            from: from,
            to: Array.isArray(to) ? `${to}` : to,
            subject: subject,
            text: text
        });
        return info.messageId;
    }

}
