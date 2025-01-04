import mongoose from "mongoose";

const {Schema} = mongoose;

const UserSchema = new Schema({
    fname:{
        type: String,
        required: true
    },
    lname:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    phone:{
        type:String
    },
    profilephoto:{
        type: String,
        default :""
    },
    invoice:{
        type: String,
        default:""
    },
    lastLogin:{
        type: Date,
        default: Date.now
    },
    refresh_Token:{
        type: String,
        default: ""
    },
    verify_email:{
        type: Boolean,
        default: false
    },
    role:{
        type: String,
        enum:['admin','user'],
        default: 'user'
    },
    status:{
        type: String,
        enum: ['active','inactive','suspended'],
        default: 'active'
    },
    logo:{
        type: String,
        default: ""
    },
    address_details : [
        {
            type : mongoose.Schema.ObjectId,
            ref : 'address'
        }
    ],
    shopping_cart : [
        {
            type : mongoose.Schema.ObjectId,
            ref : 'cartProduct'
        }
    ],
    orderHistory : [
        {
            type : mongoose.Schema.ObjectId,
            ref : 'order'
        }
    ],
},{timestamps : true})

const User = mongoose.model('user', UserSchema);

export default User;