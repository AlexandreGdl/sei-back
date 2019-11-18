
import express from 'express'
import bcrypt from 'bcryptjs'
import {validationResult} from 'express-validator/check'
import validateurRegistration from '../validateurs/registration' // made after
import authGuard from '../guard/authguard'
import schema from '../schema/usersSchema'
import jwt from 'jsonwebtoken'
import fs from 'fs'

const UserRoute = express.Router()

UserRoute.route(`/create`).put( async (req, res) => {
    console.log(req.body)
    // log
    console.log(`[IF] ► Request was made to : ${req.originalUrl}`)
    console.log("je passe bien la")
    // catch errors for check value (by validateurRegistration)
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(422).send({status:`error`, message:`${errors.array()[0].msg}`, value:`${errors.array()[0].value}`})
    }

    // get values // changed username to name because it's body('name') in registration.js
    let {username, password, email } = req.body

    // test if username exist
    let nameExist = false
    // find to what user is refered
    try {

        await // searching into DB with the query
        schema.find({email: email}).then(data => { data.length !== 0 ? nameExist = true : nameExist = false })
        .catch(err => {res.status(400).send(`Error Unable to find data from databse : "${err}"`)})

        
    } catch (err) {
        console.log(`[ER] ☠ Promise error --`)
        console.log(err)
    }


    if(nameExist) {
        return res.status(409).send({status:`error`, message:`exist`, value:`Email already exists`})
    }

    // hash password && insert data
        await bcrypt.hash(password, 10, (err, hash) => {

        if (err) {
            console.log(`[ER] ☠ Hash error --`)
            console.log(err)
        } else {
            console.log('registered')
            const newUser = new schema({username: username, email: email,password: hash})

            // some console.log in order to debug
            console.log(`-----Debug on-----`)
            console.log(newUser)

            // persist the data into the DB and telling it's allright if it's allright
            newUser.save()
            .then(row => {res.json(`Data added`)})
            .catch(err => {res.status(400).send(`Unable to save to database`)})
            
        }
    })

})


UserRoute.route(`/:username`).get( (req, res) => {
schema.find({username: {$regex : req.params.username}}).then(data => res.json({data}))
})

UserRoute.route('/profile/:id').get( (req,res)=> {
    schema.find({_id: req.params.id}).then(data => res.json({data}))
})


/*---------------*/

UserRoute.route('/changeEmail/:id').post( async (req,res) => {

    let token64 = jwt.decode(req.body.token)
    if (token64.id === req.params.id){
                

                schema.findOneAndUpdate({_id: req.params.id},{email: req.body.email}).then( data =>{
                    data.email = req.body.email
                    res.json(data)
                })
            
    } else {
        res.json({type: 'error',message: 'Your are not this user'})
    }
    
})


/*---------------*/


UserRoute.route('/changeName/:id').post((req,res) => {

    let token64 = jwt.decode(req.body.token)
    if (token64.id === req.params.id){
        schema.findOneAndUpdate({_id: req.params.id},{username: req.body.username}).then(data=>{
            data.username = req.body.username
            res.json(data)
        })
    } else {
        res.json({type: 'error',message: 'Your are not this user'})
    }
})


/*---------------*/



UserRoute.route('/changePassword/:id').post( async (req,res) => {

    let token64 = jwt.decode(req.body.token)
    if (token64.id === req.params.id){

        await   bcrypt.hash(req.body.newPassword, 10, (err, hash) => {

            if (err) {
                console.log(`[ER] ☠ Hash error --`)
                console.log(err)
            } else {  
                let password = hash
                schema.findOneAndUpdate({_id: req.params.id},{password: password}).then(
                    data => res.json(data)
                )
            }
        })

    } else {
        res.json({type: 'error',message: 'Your are not this user'})
    }

    
})

UserRoute.route('/changeImg/:id').post(async (req,res) => {
    let token64 = jwt.decode(req.body.token)
    let check = false
    token64.id === req.params.id ? check = true : check = false

    if (!check) {
        res.send(401).send('error')
    }
    let _id = '_' + Math.random().toString(36).substr(2, 9)
    let extensions = req.body.name.split('.')[1]
    let filePath = `upload/${_id}.${extensions}`
    let fileContent = req.body.file.split(',')[1];
    fs.writeFile(filePath, fileContent, 'base64' ,(err) => {
        if (err) throw err;

        console.log("The file was successfully saved")
    })
    let toUpdate = {file_directory:  `${_id}.${extensions}`}
    schema.find({_id: req.params.id}).then(data=> {
        fs.unlink(`./upload/${data[0].file_directory}`, (err) =>{
            if (err) {
                console.log("failed to delete local image:"+err);
            } else {
                console.log('successfully deleted local image');                                
            }
        })
    })
    schema.findOneAndUpdate({_id: req.params.id},toUpdate)
    .then(data => {
        res.send('New Profil picture SuccessFully saved')
    })
    
})

UserRoute.route('/profile/picture/:id/').get(async (req,res) => {
    schema.find({_id: req.params.id}).then(data => {
        res.sendFile(`${data[0].file_directory}`,{ root: 'upload/' })
    })
})

UserRoute.route('/deleteImg/:id').post(async (req,res) => {
    schema.find({_id: req.params.id}).then( async data =>{
        data[0].file_directory = null
        schema.findOneAndUpdate({_id: req.params.id},data[0]).then( data =>{
            console.log(data)
            res.send('Image deleted')
        })
    })
})

export default UserRoute

fs.unlink // delete
fs.write // ecrire
fs.read // lire