const jwt = require("jsonwebtoken");


const generateToken = (id, time) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: time,
    });
};

const verifyToken = (token) => {

    return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = { generateToken, verifyToken }