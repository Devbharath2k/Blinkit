import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import userSchema from '../Model/userModel.js';
dotenv.config();

const AccessToken = async (userId) => {
    try {
        const token = jwt.sign({id : userId},
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn : '1d' }
        )
        return token;
    } catch (error) {
        console.error(error);
        throw new Error("Access token is not available")
    }
}

const RefreshToken = async (userId) => {
    try {
        const token = jwt.sign({id : userId},
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '7d' }
        )
        const updateToken = await userSchema.updateOne({_id : userId},{
            refresh_Token: token
        })

        if(updateToken.matchedCount  === 0){
            throw new Error("Access token" + updateToken)
        }

        return token;

    } catch (error) {
        console.error(error);
        throw new Error("Refresh token is not available")
    }
}

const IsAuthroization = async (req, res, next) => {
    try {
        const token = req.cookies.accesstoken;

        if(!token){
            return(
                res.status(401).json({message : "No token provided",
                    success : false
                })
            )
        }
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        
        if(!decoded){
            return(
                res.status(402).json({
                    message : "Token is not valid",
                    success : false
                })
            )
        }
        req.user = decoded.id;
        next();
    } catch (error) {
        console.log(error)
        res.status(401).json({message : "Authentication failed"})
    }
}

const AdminAuthorization = async (req, res, next) => {
    try {
        const userId = req.user;
        
        const user = await userSchema.findById(userId);
        if(user){
            return(
                res.status(403).json({
                    message : "You are not an admin",
                    success : false
                })
            )
        }
        if(user.role !== "admin"){
            return(
                res.status(403).json({
                    message : "You are not an admin",
                    success : false
                })
            )
        }
        next();
    } catch (error) {
        console.log(error)
        res.status(401).json({message : "Authentication failed"})
    }
}

export {AccessToken, RefreshToken, IsAuthroization, AdminAuthorization}