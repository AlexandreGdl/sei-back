import express from 'express'
import user from '../schema/usersSchema'
import bcrypt from 'bcryptjs'
import {validationResult} from 'express-validator/check'
import validateurLogin from '../validateurs/login'
import jwt from 'jsonwebtoken'
import env from '../env'
import schema from '../schema/usersSchema'

const AuthRoute = express.Router()

AuthRoute.route(`/`).post(validateurLogin, async (req, res) => {
    // log
    console.log(`[IF] ► Request was made to : ${req.originalUrl}`)
     // catch errors for check value (by validateurRegistration)
     const errors = validationResult(req)
     if (!errors.isEmpty()) {
         return res.status(422).send({status:`error`, message:`${errors.array()[0].msg}`, value:`${errors.array()[0].value}`})
     }
 
     // get values
     let {email, password} = req.body
     try {
         let userData = ``
        console.log(userData)
         //check usernaname
         let isUserExists = false

         await // searching into DB with the query
         schema.find({email: email}).then(data => {
             userData = data[0]
             data.length !== 0 ?
              isUserExists = true
              : isUserExists = false })
         .catch(err => {res.status(400).send(`Error Unable to find data from database : "${err}"`)})
        console.log(isUserExists)
         let isPasswordValid = ``
         // check the password
         if (userData) {
             console.log('there is a user')
             console.log(userData)
            isPasswordValid = await bcrypt.compare(password, userData.password)
         }
         // if no user
         if(!isUserExists || !isPasswordValid) {
             return res.status(401).send({status:`error`, message:`Bad values`, value:`email or password`})
         }
        
         // create the jwt
         let token = jwt.sign({id: userData._id,lvl: userData.lvl}, env.env.secret, {expiresIn: 60*60*24*10000})
         if (token) {
            console.log(`[OK] ✎ Token stored in session`)
            return res.status(200).send({status:`ok+`, message:`Login successfully`, username: `${userData.username}`, jwt:`${token}`,userID: `${userData._id}`})
         }
         
 
     } catch (err) {
         console.log(`[ER] ☠ Promise error --`)
         console.log(err)
         return res.status(500).send({status:`ok`, message:`Promise error`, value:`${err}`})
     }
 
})

export default AuthRoute

