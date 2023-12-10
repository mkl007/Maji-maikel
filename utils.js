import jwt from 'jsonwebtoken'
export const generateLogToken = (user) => {
    return jwt.sign({
        _id: user.id,
        fullname: user.fullname,
        email: user.email
    },
        process.env.JWT_PASS || 'mysecretpass',
        {
            expiresIn: '1d',
        }
    );
};



    // try {
    //     const token = await Token.findOne({ token: req.params.token });
    //     console.log(token)
    //     await User.updateOne({ _id: token.userId }, { $set: { verified: true } });
    //     await Token.findByIdAndDelete(token._id)
    //     console.log('email verified bro')
    //     res.json({ msg: "email verified" })
    // } catch (error) {
    //     res.status(400).json({ msg: 'Error while verifying' })
    // }