import jwt from 'jsonwebtoken';

const authenticate = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).send('Access Denied');

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = verified.id; // Attach userId to the request object
        next();
    } catch (error) {
        res.status(400).send('Invalid Token');
    }
};

export default authenticate;
