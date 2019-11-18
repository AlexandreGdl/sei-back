import jwt from 'jsonwebtoken'
import env from '../env'
import userRightsSchema from '../schema/userRightsSchema'
import level from './accessLevel'
import session from 'express-session'

const authenticationToken = async ( req, res, next) => {
    let userAccess = false
    // get the token in the header request
    console.log('--------------BODY---------')
    console.log(req.body)
    console.log('--------------BODY---------')
    let token = req.headers.jwt
    if (!token) {
        console.log('no token')
        return res.status(401).send({status:`error`, message:`Token`, value:`No token provided`})
    }
    
    jwt.verify(token, env.env.secret, (err, decoded) => {
        if (err) {
            return res.status(401).send({status:`error`, message:`Token`, value:`Token invalid`})
        }
    })

    const token64 = jwt.decode(token)
    console.log(token64)
    // we are creating some exeption for some route
    if (req.originalUrl === '/tables/create/' || req.originalUrl === '/users/' || req.originalUrl === '/tables/' || req.originalUrl === '/userRights/') {
        userAccess = true
    } else {
        try{
            await userRightsSchema.find({table_id: req.body.table_id}).then(data => {
                // looking if the users is allowed for the table, also i'm calling it data because i'll be able to use the same code for the row
                if (data[0].data[0][token64.id]) {
                    if (level[data[0].data[0][token64.id]-1].indexOf(req.method) !== -1){
                        userAccess = true
                        console.log('cest bon')
                    } else {
                        console.log('c\'est mort')
                        return res.status(401).send({status:`error`, message:`Access`, value:`This user doesn't have the right to ${req.method} this route`})
                    }
                } else {
                    userAccess = false
                 }  
                
            })
        } catch (err){
            console.log(`[ER] ☠ Promise error --`)
            console.log(err)
            return res.status(500).send({status:`ok`, message:`Promise error`, value:`${err}`})
        }
    }
    if  (!userAccess) {
        return res.status(401).send({status:`error`, message:`Access`, value:`You are not allowed to access this route`})
        
    } else { 
        console.log('lets go')
        return next()
    }

}

export default authenticationToken