const express = require('express');
const path = require('path');
const bodyParser = require("body-parser");
const session = require("express-session");
require('dotenv').config();

console.log("Session Secret:", process.env.SESSION_SECRET || "FallbackSecret");

const app = express();
const PORT = 3000;
const mongoose = require('mongoose');

app.use(express.static(path.join(__dirname, 'public')));


app.use(bodyParser.urlencoded({ extended: true }));

console.log("Session Secret:", process.env.SESSION_SECRET);

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, httpOnly: true, maxAge: 360000 } 
}));

mongoose.connect('mongodb://localhost:27017/userDB')
const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String 
}, {collection: "users" });

const User = mongoose.model('User', userSchema);



app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const user = await User.findOne({ username, password });
        
        if (user) {
            req.session.loggedIn = true;
            res.redirect("/dashboard")
        } else {
            res.send({ success: false, message: "Incorrect username or password." });
        }
    } catch (err) {
        res.status(500).send("Server error.");
    }
})


app.get('/dashboard',(req,res) =>{
    if (req.session.loggedIn) {
        res.sendFile(path.join(__dirname , 'public' , 'dashboard.html'))
    } else {
        res.redirect("/");
    }
})

app.post('/Register',async (req,res)=>{
    const {username ,email, password} = req.body;
    const user = await User.findOne({ username});
     
    if(user){
        res.send('user alredy exite')
    }else{
      
        const data = new User({username:username,email:email, password:password})
        data.save()
        res.send('your username and password send to server /login')
    }
    

})
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
