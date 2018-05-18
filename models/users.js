const mongoose = require('mongoose')
var plugin = require('mongoose-createdat-updatedat');

const userSchema = mongoose.Schema({
    firstName:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        trim: true,
        lowercase: true,
        unique: true,
        required: 'Email address is required',
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password:{
        type:String,
        required:true
    },
    companyName:{
        type:String,
        required:true
    },
    address:{
        type:String
    },
    phoneNumber:{
        type:Number,
        min: 10
    },
    otp:{
        type:Number
    }
})

userSchema.plugin(plugin)
module.exports = mongoose.model('Users',userSchema)