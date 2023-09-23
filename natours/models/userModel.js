const crypto = require('crypto'); //Build in node module
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name!'],
    },
    email: {
        type: String,
        required: [true, 'Please provide your Email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid Email']
    },
    photo: String,
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        //to not send the password to user
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            //This only works on CREATE and SAVE!!!
            validator: function(val) {
                return this.password === val;
            },
            message: 'Password and PasswordConfirm are not the same!'
        }  
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
});


userSchema.pre('save', async function(next) {
    //Only run if password was modified
    if(!this.isModified('password')) return next();

    //hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    //DeletepasswordConfim field
    this.passwordConfirm = undefined;
    next();
});

userSchema.pre('save', function(next) {
    if(!this.isModified('password') || this.isNew) return next();
    this.passwordChangedAt = Date.now() - 1000;
    next();
});

userSchema.pre(/^find/, function(next) {
    //this points to the current query
    this.find({ active: {$ne: false} });
    next();
})

//instance method: it's available in all the user documents 
userSchema.methods.correctPassword = async function(condidatePassword, userPassword) {
    return await bcrypt.compare(condidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if(this.passwordChangedAt){
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTimestamp;
    };

    //False means not changed
    return false;
};

userSchema.methods.createPasswordRessetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    console.log({resetToken}, this.passwordResetToken);
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    return resetToken;
}

const User = mongoose.model('User', userSchema);

module.exports = User;