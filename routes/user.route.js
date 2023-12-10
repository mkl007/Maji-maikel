import express from 'express'
import { randomFill, randomFillSync } from 'crypto';
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'
import User from '../models/user.model.js';
import Token from '../models/token.js';


export const routerUser = express.Router();

// Create new user
routerUser.post('/register', async (req, res) => {
    try {
        const verifyEmail = await User.findOne({ email: req.body.email })
        if (verifyEmail) return res.json({ msg: 'Email already exist. Do you want to login?' })
        const newUser = new User({
            fullname: req.body.fullname,
            email: req.body.email,
            password: await bcrypt.hash(req.body.password, 10),
        })
        // generate verification token
        const tokenBytes = randomFillSync(Buffer.alloc(16))
        const tok = tokenBytes.toString('hex')
        const token = new Token({ userId: newUser._id, token: tok });
        // send mail
        // const link = `http:localhost:3000/api/v1/confirm/${token.token}`;
        const link = `http://localhost:3000/api/v1/confirm/${token.token}`;
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            }
        });

        // confirm registration
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: newUser.email,
            subject: "MAJI BOOKS ",
            html: `<div><p>Thank you for joing our family, ${newUser.fullname}. 
                To complete the registration please confirm your address
                </p><a href="${link}">Confirm your account here</a>heres: ${token.token}</div>`
        }

        transporter.sendMail(mailOptions, async function (error, info) {
            if (error) {
                return res.status(500).json({ status: "FAILED", message: "Error :( Email not found. Please check the email provided" });
            } else {
                await newUser.save()
                await token.save()
                return res.json({ Status: "SUCCESSFUL", message: "User created", newUser });
            }
        });

    } catch (error) {
        console.log(error)
    }
})

// active account
// const link = `http:localhost:3000/api/v1/users/confirm/${token.token}`;
routerUser.get('/confirm/:token', async (req, res) => {
    try {
        const token = await Token.findOne({ token: req.params.token });
        await User.updateOne({ _id: token.userId }, { $set: { verified: true } });
        await Token.findByIdAndDelete(token._id)
        console.log('email verified bro')
        res.json({ msg: "email verified" })
    } catch (error) {
        res.status(400).json({ msg: 'Error while verifying', Token })
    }

})

/// Login 
routerUser.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email })
        if (!user) {
            return res.json({ msg: 'No user found' })
        } else if (user && user.verified) {
            const paswrdDeshash = bcrypt.compareSync(password, user.password)
            if (!paswrdDeshash) return res.json({ msg: "Wrong password!" })
            const token = jwt.sign({ id: user.id }, process.env.JWT_PASS, { expiresIn: '1800s' })
            res.cookie('token', token, {
                httpOnly: false,
                sameSite: 'none',
                secure: true
            })
            res.json({ msg: "Token created", token })
        }
        res.json({ msg: "Email not verified. Please check your Mail box or register your account" })
    } catch (error) {
        console.log(error)
    }
})

routerUser.post('/logout', (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(0)
    })
    return res.status(200).json({ msg: 'Loggin out...' })
}
)
// For testing propusess
routerUser.get('/testing', (req, res) => {
    res.send('Hi bro!')
})