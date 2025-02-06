const jwt = require('jsonwebtoken');

const jwtAuthMiddleware = (req, res, next) => {
    // console.log("Middleware triggered");

    // first check request headers has authorization or not
    const authorization = req.headers.authorization
    if(!authorization || !authorization.startsWith("Bearer ")) {
        // console.error("Token Missing or Invalid Format:", authHeader);
        return res.status(401).json({ error: "Token Not Found or Invalid" });
    }

    // Extract the jwt token from the request headers
    const token = req.headers.authorization.split(" ")[1];
    if(!token) {
        // console.log("Token missing");
        return res.status(401).json({ error: "Unauthorized" });
    }

    try{
        // Verify the JWT token
        // console.log("Jwt token for verification", token);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // console.log("JWT verified:", decoded);

        // Attach user information to the request object
        req.user = decoded;
        // console.log("TOken transferd to user");
        next();

    }catch (err){
        console.error("JWT Verification Error:", err);
        res.status(401).json({ error: 'Invalid token' });
        next(err);
    }
}


// Function to generate JWT token
const generateToken = (userData) => {
    // Generate a new JWT token using user data
    return jwt.sign(userData, process.env.JWT_SECRET);
}

module.exports = {jwtAuthMiddleware, generateToken};