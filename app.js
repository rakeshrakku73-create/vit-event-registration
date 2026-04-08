const express = require('express');
const nodemailer = require('nodemailer');
const qrcode = require('qrcode');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
    res.send(`
        <h2>VIT Event Registration</h2>
        <form action="/register" method="POST">
            <input type="text" name="name" placeholder="Full Name" required><br><br>
            <input type="email" name="email" placeholder="Gmail Address" required><br><br>
            <input type="text" name="event" placeholder="Event Name" required><br><br>
            <button type="submit">Register Now</button>
        </form>
    `);
});

app.post('/register', async (req, res) => {
    const { name, email, event } = req.body;

    try {
        const qrData = `Student: ${name}, Event: ${event}, ID: ${Math.floor(Math.random() * 10000)}`;
        const qrCodeImage = await qrcode.toDataURL(qrData);

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, 
                pass: process.env.EMAIL_PASS  
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `Registration Confirmed: ${event}`,
            html: `<h1>Hi ${name}!</h1>
                   <p>You are registered for <b>${event}</b>.</p>
                   <p>Show this QR Code at the entry:</p>
                   <img src="${qrCodeImage}" alt="QR Code">`,
            attachments: [{
                filename: 'ticket-qr.png',
                content: qrCodeImage.split("base64,")[1],
                encoding: 'base64'
            }]
        };

        await transporter.sendMail(mailOptions);
        res.send("<h1>Registration Successful!</h1><p>Check your Gmail for your QR Ticket.</p>");
    } catch (err) {
        res.status(500).send("Error: " + err.message);
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
