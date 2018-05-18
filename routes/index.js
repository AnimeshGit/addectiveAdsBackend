var express = require('express');
var router = express.Router();
var Users = require('../models/users');
var Constant = require('../config/constant');
var config = require('../config/mail');
var session = require('express-session');

bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync();

/* GET home page. */
router.get('/', function (req, res, next) {
	res.render('index', { title: 'Express' });
});

/**SignUp */
router.post('/signUp', function (req, res, next) {
	if (req.body.password != req.body.conPass) {
		res.send("password and confirm password should be same");
		return;
	}
	password = bcrypt.hashSync(req.body.password, salt);
	var newUserData = new Users({
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		email: req.body.email,
		password: password,
		companyName: req.body.companyName,
		address: req.body.address,
		phoneNumber: req.body.phoneNumber
	})
	newUserData.save(function (err, data) {
		if (err) {
			res.send(err);
		} else {
			res.json({
				success: true,
				msg: 'Successfully SignUp User.',
				data: data
			});
			return;
		}
	})
});

/**Login */
router.post('/login', function (req, res, next) {
	var sess = req.session;
	Users.findOne({ email: req.body.email }).then(function (data) {
		if (!data) {
			res.send("Please register first")
		} else {
			if (bcrypt.compareSync(req.body.password, data.password)) {
				sess.userId = data._id;
				sess.userEmail = data.email;
				res.json({
					success: true,
					msg: "Login successfully",
					data: data,
				});
				return;
			} else {
				res.json({
					success: false,
					msg: "Please enter correct password"
				});
				return;
			}
		}
	}).catch(function (err) {
		res.send(err)
	})
});

/**Forgot password */
router.post('/forgotPassword', function (req, res, next) {
	console.log(req.body)
	otp = Math.floor(1000 + Math.random() * 9000);
	Users.findOneAndUpdate({
		'email': req.body.email
	}, {
		$set:
			{
				'otp': otp
			}
	}, {
		'new': true
	}).then(function (data) {
		if (data) {
			var text = '<a href=http://localhost:8000/resetPassword/' + otp + '> Click here </a>' + 'to reset your password.\n\n'
			var subject = 'Password Reset Notification';
			config.sendMail(req.body.email, text, subject).then(function (error) {
				if (error) {
					console.log(error);
				}
			});
			res.json({
				success: true,
				msg: 'Email send for reseting password.'
			});
			return
		}
	}).catch(function (error) {
		res.json({
			success: true,
			msg: 'Successfully send a link to reset the password'
		});
	})
});

/**reset password */
router.put('/resetPassword/:token', function (req, res, next) {
	console.log(req.body)
	console.log(req.params.token)
	Users.findOne({ otp: req.params.token }).then(function (data) {
		if (data) {
			res.json({
				success: true,
				msg: 'Successfully verified'
			});
		} else {
			res.send("unAothorize User")
		}
	}).catch(function (error) {
		res.send(error)
	})
});

// changePass
router.put('/changePass', function (req, res, next) {
	if (req.body.newPass != req.body.conPass) {
		res.send("password and confirm password should be same");
		return;
	}
	Users.findOne({
		'otp': req.body.token
	}).exec().then(function (userData) {
		var hash_password = bcrypt.hashSync(req.body.newPass, salt);
		if (userData) {
			Users.findOneAndUpdate({
				_id: userData._id
			}, {
				$set: {
					password: hash_password,
				}
			}, {
				'new': true
			}).then(function (updatedUserData) {
				if (updatedUserData) {
					res.json({
						success: true,
						msg: 'Password reset successfully'
					})
				} else {
					res.json({
						success: false,
						msg: 'Password reset failed'
					})
				}
			}).catch(function (error) {
				res.send("Somthing went wrong in reset password");
			})
		} else {
			res.json({
				success: false,
				msg: "token should not match"
			})
		}
	}).catch(function (error) {
		console.log(error);
		res.json({
			success: false,
			msg: "please resend password erset link"
		});
	})
});

/**LOGOUT */
router.get('/logout', function (req, res) {
	req.session.destroy(function (err) {
		if (err) {
			res.send(err);
		} else {
			res.send('LOGOUT');
		}
	});
});

module.exports = router;
