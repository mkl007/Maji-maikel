import mongoose from 'mongoose'

const realSchema = mongoose.Schema;
const userSchema = new realSchema({
    fullname: {
        type: String, required: true,
    },
    email: {
        type: String, required: true, unique: true,
    },
    password: {
        type: String, required: true,
    },
    verified: {
        type: Boolean, 
        default:  false,
    }
})

const User = mongoose.model('user', userSchema);
export default User;
