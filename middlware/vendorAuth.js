const { decrypt } = require('../handler/crypto')
const { verifyToken } = require('../handler/jwtGenarate')
const User = require('../models/user')



const authUser = async (req, res, next) => {
    let token;
   
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decryptedToken = decrypt(token);
            if (decryptedToken) {
                const decoded = verifyToken(decryptedToken);
                const user = await User.findById({ _id: decoded.id }).select('-password')
                console.log(user);
                
                if (!user) {
                    res.status(404).json({ status: false, message: 'User not found' });
                } else if (user.isBlocked) {
                    return res.status(403).json({ status: false, message: 'Your account is blocked' });
                } else if (user.role !== 'user') {
                    res.status(403).json({ status: false, message: 'You are not authorized to access this resource' });
                } else {


                    req.user = user._id;
                    req.userData = user;
                    next();
                }
            }
        } catch (error) {
            if (error.message == 'jwt expired') {
                res.status(403).json({ status: false, message: 'Token expired' });
            } else {
                res.status(403).json({ status: false, message: 'Invalid token' });
            }
        }
    }
    if (!token) {
        res.status(401).json({ status: false, message: 'Token not found' });
    }
}


module.exports = {
  authUser,
};

