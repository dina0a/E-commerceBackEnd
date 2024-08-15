import nodemailer from 'nodemailer'
export const sendEmail = async ({ to = '', subject = '', html = '' }) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "omerbag2002@gmail.com",
            pass: "mgzsycjhskkndqsy",
        },
    });
    const info = await transporter.sendMail({
        from: 'E-commerce', // sender address
        to, // list of receivers
        subject, // Subject line
        html, // html body
    });
}