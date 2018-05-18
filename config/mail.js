const nodemailer = require('nodemailer');

var sendMail = function(useremail, text, subject) {

    let transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user : 'example@gmail.com',//your gmail id
            pass : '*******'//your gmail password
        }
    });

    // setup email data with unicode symbols
    let mailOptions = {
        from: 'contact@example.com', // sender address
        to: useremail, // list of receivers
        subject: subject, // Subject line
        html: text // plain text body
    };

    transporter.sendMail(mailOptions, function (err, info) {
        if(err)
            console.log(err)
        else
            console.log(info);
    });
         
}

module.exports = {
    'sendMail': sendMail
};
