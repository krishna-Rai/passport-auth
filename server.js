const express = require('express')
const connectToDb = require('./db/connection')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
require('dotenv').config()

let userCollection
connectToDb().then((collection)=>{
    userCollection = collection
    console.log("Connected to db")
    app.listen(3000,()=>{
        console.log("server is listening on 3000")
    })
})

const initializePassport = require('./passport-config')
const getUserByEmail = async (email)=>{
    const user = await userCollection.findOne({email})
    user._id = user._id.toString()
    return user
}
const getUserById = async (id)=>{
    const {ObjectId} = require('mongodb')
    const user = await userCollection.findOne({_id:ObjectId(id)})
    user._id = user._id.toString()
    return user
}
initializePassport(
    passport,
    getUserByEmail,
    getUserById
)

app.set('view-engine', 'ejs')
app.use(express.urlencoded({extended:false}))
app.use(flash())
app.use(session({
    secret:process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())

function checkAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')
}

function checkNotAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return res.redirect('/')
    }
    next()
}


app.get('/',checkAuthenticated,(req,res)=>{
    res.render('index.ejs')
})

app.get('/login', checkNotAuthenticated,(req,res)=>{
    res.render('login.ejs')
})

app.get('/register', checkNotAuthenticated,(req,res)=>{
    res.render('register.ejs')
})

app.post('/login',checkNotAuthenticated ,passport.authenticate('local',{
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.post('/register',checkNotAuthenticated, async (req,res)=>{
    console.log(req.url)
    const {name,email,password} = req.body
    const userFound = await userCollection.findOne({email})
    if(userFound){
        return res.redirect('/register')
    }
    const hashedPassword = await bcrypt.hash(password,10)
    const user = {
        name,email,password:hashedPassword
    }
    const userCreated = await userCollection.insertOne(user)
    if(userCreated){
        res.redirect('/login')
    }else{
        res.redirect('/register')
    }
})

app.get('/logout',(req,res)=>{
    req.logOut((done)=>{
        console.log(done)
    })
    res.redirect('/login')
})
