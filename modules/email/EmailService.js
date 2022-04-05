const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
	service: 'Gmail',
	auth: { user: process.env.EMAIL_TO_SEND, pass: process.env.PASS_OF_EMAIL_TO_SEND }
});

class EmailService {

	static async sendEmail(to, subject, html) {
		try {
			const emailSended = await transporter.sendMail({
				from: process.env.EMAIL_TO_SEND,
				to,
				subject,
				html
			});

			return emailSended;
		} catch(error) {
			return error;
		}
	}
}

module.exports = EmailService;
