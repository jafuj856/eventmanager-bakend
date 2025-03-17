const { decrypt } = require('../handler/crypto')
const { verifyToken } = require('../handler/jwtGenarate')
// const User = require('../model/user')


const auth = async (req, res, next) => {
    // ---
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            
            if (token) {
                token = decrypt(token);
                const decoded = verifyToken(token);
                if (decoded.id == process.env.ADMIN_ID) {
                    req.admin = process.env.ADMIN_ID;
                    next();
                } else {
                    return res.status(403).json({ status: false, message: 'Invalid token' });
                }
            }
        } catch (error) {
            if (error.message == 'jwt expired') {
                return res.status(399).json({ status: false, message: 'Token expired' });
            } else {
                return res.status(403).json({ status: false, message: 'Invalid token' });
            }
        }
    }
    if (!token) {
        return res.status(401).json({ status: false, message: 'Token not found' });
    }
}


module.exports = {
    auth
}

