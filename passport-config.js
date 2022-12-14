const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function initialize(passport,getUserByEmail,getUserById){
    
    const authenticateUser = async (email,password, done)=>{
        const user = await getUserByEmail(email)
        if(user == null){
            return done(null,false,{message:"No user with this email id"})
        }
        try {
            const passwordMatch = await bcrypt.compare(password,user.password)
            if(passwordMatch){
                return done(null,user)
            }else{
                return done(null,false,{message:"Incorrect Password"})
            }
        } catch (error) {
            return done(error)
        }
    }


    passport.use(new LocalStrategy({usernameField: 'email'},authenticateUser))
    passport.serializeUser((user,done)=>done(null,user._id))
    passport.deserializeUser(async (id,done)=>{
        return done(null, await getUserById(id))
    })
}

module.exports = initialize