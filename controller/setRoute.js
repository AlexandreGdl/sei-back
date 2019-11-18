import mongoose from 'mongoose'
import authGuard from '../guard/authguard'
import userRightsSchema from '../schema/userRightsSchema';
import columnsSchema from '../schema/columnsSchema';
import rowSchema from '../schema/rowsSchema'
import tableSchema from '../schema/tablesSchema'
import jwt from 'jsonwebtoken'
import rowsSchema from '../schema/rowsSchema';
import userSchema from "../schema/usersSchema"
import session from 'express-session'

const ConnectionDb = mongoose.connection

// Creating the function to set the route 
// default route :[get all: collections/, get one: collections/find/:id, create: collections/create/, update: collection/edit/:id, delete: collections/delete/:id]

//routeExpress is to pass expressRoute
export default function setRoute (methode, routeExpress, collectionName = false,schema = false, targeted = false) {

    //we can't trust user
    let _methode = methode.toLowerCase()

    // SENDING DATA
    if ( _methode === 'get' ) {
        if (targeted === true) {
            routeExpress.route('/find/:target/:id').post((req,res,next) => authGuard(req,res,next),(req,res) => {
                
                

                // creating the target-value element thank's to the params
                const query = {}
                query[req.params.target] = req.params.id
                
                // for a little bit of debug
                console.log('------FIND-------------')
                console.log(query)
                console.log(req.originalUrl)
                if (req.originalUrl === `/userRights/find/table_id/${req.params.id}/`) {
                    schema.find(query).then(async data => {
                        let tab = []
                        let container = []
                        let j = 1
                        tab = Object.entries(data[0].data[0])
                        console.log(tab)
                        await tab.map( user =>{
                            console.log(user)
                            userSchema.find({_id: user[0]}).then(userInfo => {
                                console.log(userInfo)
                                container.push({_id: user[0],username: userInfo[0].username,lvl: user[1],file_directory: userInfo[0].file_directory})
                                console.log(container)
                                if  (j === tab.length){
                                    res.json({data: container})
                                    res.end()
                                }
                                j++
                            })
                        })
                        
                    })
                } else {
                    // searching into DB with the query
                    schema.find(query).then(data => {res.json({
                        "status": "completed",
                        "message": "200 ok",
                        "type": "with target",
                        // if no data, send empty
                        "data": (data.length !== 0 ? data : `empty with target`)
                    })
                    })
                    .catch(err => {res.status(400).send(`Error Unable to find data from databse : "${err}"`)})
                }
            })
        } else if (targeted === false) {
            // Send all the data from the DB collection 
            routeExpress.route(`/`).post(authGuard,(req, res) => {
                console.log('--------------------')
                //Getting data from the good collection
                ConnectionDb.db.collection(collectionName, (err, collection) => {
                    // send it as an Array, {} empty cause we have no target
                    collection.find({}).toArray((err, data) => {

                        // this part of the code is here to get the table of an user 
                        if(req.originalUrl === '/userRights/'){
                            let tab = []
                            let i = 0
                            data.map(info => {info.data[0][req.body.userID] ? tab.push(info.table_id) : null})
                            let container = []
                            tab.map(row => { tableSchema.find({_id: row}).then(data => {
                             container.push(data[0])
                             i++
                             if (i === tab.length) {
                                console.log(container)
                                res.status(200).send({success:`true`,data: container})
                                res.end()
                             }
                             })
                            })
                            // tableSchema.find({_id: row}).then(data => {container.push(data)})
                        } else {
                            res.status(200).send({
                                success: `true`,
                                message: `200 ok`,
                                type: `all`,
                                // if no data, send empty
                                data: (data.length !== 0 ? data : `empty without target`)
                            })
                        }
                        
                    })
                })
            })

        }

    // EDITING DATA
    } else if ( _methode === 'post') {

        routeExpress.route('/edit/:id').post(authGuard,(req,res) => {
            let toUpdate = null

            //looking if it's a rowUpdate

            let check = req.body.data
            let doubleCheck = req.body.delete
            if (check !== undefined && req.originalUrl !== `/userRights/edit/${req.params.id}/` ) {
                schema.find({_id: req.params.id}).then(oldData => {
                    // ask if there can be 1 or 2 or plus admin
                    toUpdate =  {data: [{...oldData[0].data[0],...req.body.data}]},schema.findOneAndUpdate({_id: req.params.id},toUpdate).then(
                    // if the edit is make successfully send the new data
                    row => schema.find({table_id: req.body.table_id}).then(data => {res.json({message:`data edit`, data:data,socket: req.body.socket})})
                )
                .catch(err => {res.status(400).send(`Unable to update data : "${err}"`)})})
                
                
                
            } else if ( req.originalUrl === `/userRights/edit/${req.params.id}/` && doubleCheck === undefined) {
                schema.find({table_id: req.params.id}).then(oldData => {
                    // ask if there can be 1 or 2 or plus admin
                    toUpdate =  {data: [{...oldData[0].data[0],...req.body.data.data}]},schema.findOneAndUpdate({table_id: req.params.id},toUpdate).then(
                    // if the edit is make successfully send the new data
                    row =>  {
                        schema.find({table_id: req.params.id}).then(data => {
                            let tab = []
                            let i = 1
                            Object.entries(data[0].data[0]).map(async (info) => {
                                await userSchema.find({_id: info[0]}).then(user => {
                                    tab.push({_id: info[0],username: user[0].username, lvl: info[1]})
                                })
                                if (i === Object.entries(data[0].data[0]).length) {
                                    res.status(200).send({data:tab})
                                    res.end()
                                }
                                i++
                            })
                        })
                    })})
            } else if (req.originalUrl === `/userRights/edit/${req.params.id}/` && doubleCheck) {

                schema.find({table_id: req.params.id}).then(thisRights => {
                   delete thisRights[0].data[0][req.body.user_id]
                   console.log('-------rights--------')
                   console.log(thisRights[0].data)
                   schema.findOneAndUpdate({table_id: req.params.id},{data: [thisRights[0].data[0]]}).then(thisOne =>{
                    
                    console.log('---------info------------')
                        schema.find({table_id: req.params.id}).then(info => {
                            let tab = []
                            let i = 1
                            Object.entries(info[0].data[0]).map(async (infoUser) => {
                                await userSchema.find({_id: infoUser[0]}).then(user=> {
                                    tab.push({_id: user[0]._id,username: user[0].username,lvl: infoUser[1]})
                                })
                                if (i === Object.entries(info[0].data[0]).length){
                                    res.json({data: tab})
                                }
                                i++
                            })
                        })
                   })
                })

            } else {
                toUpdate = req.body
                 // get basic data 
                
                // target with the ID and update with req.body
            if (req.originalUrl === `/columns/edit/${req.params.id}/`) {
                schema.findOneAndUpdate({_id: req.params.id},toUpdate)
                .then(
                    // if the edit is make successfully send the new data
                    data => schema.find({table_id: req.body.table_id}).then(column => {res.json({message:`data edit`, data: column,socket: req.body.socket})})
                )
                .catch(err => {res.status(400).send(`Unable to update data : "${err}"`)})
            } else if ( req.originalUrl === `/tables/edit/${req.params.id}/`) {
                console.log('im here')
                schema.findOneAndUpdate({_id: req.params.id},toUpdate).then(dd => userRightsSchema.find({})
                   .then( data => {
                        let tab = []
                        let i = 0
                        console.log(data)
                        data.map(info => {info.data[0][req.body.userID] ? tab.push(info.table_id) : null})
                        let container = []
                        tab.map(row => { tableSchema.find({_id: row}).then(data => {
                        container.push(data)
                        i++
                        console.log(i)
                        if (i === tab.length) {
                            console.log('hého')
                            console.log(container)
                            res.status(200).send({success:`true`,data: container,socket: req.body.socket})
                            res.end()
                        }
                        })
                        })
                   }))

            } else {
                schema.findOneAndUpdate({_id: req.params.id},toUpdate)
                .then(
                    // if the edit is make successfully send the new data
                    data => schema.find({_id: req.params.id}).then(data => {res.json({message:`data edit`, data: data})})
                )
                .catch(err => {res.status(400).send(`Unable to update data : "${err}"`)})
            }
            
            }
               
           
        }) 

    // CREATING DATA
    } else if (_methode === 'put' ) {

        routeExpress.route(`/create`).put((req,res,next) => authGuard(req,res,next),(req, res) => {

            // using the collection schema as model
            let toUpdate = []
            let newData = new schema(req.body)
            // some console.log in order to debug
            console.log(`-----Debug on-----`)
            console.log(newData)
           
            // if it's a table we need to create the access
            if (req.originalUrl === '/tables/create/'){
            // creating the query for the user
            let query = {}
            let token = req.headers.jwt
            // converting 
            let token64 = jwt.decode(token)
            console.log(token64)
            // 4 is equal to the admin right and token64.id is equal to the id of the admin (the user creating the table)
            query[token64.id] = 4
            console.log('-----------newData-------------')
            console.log(newData)
            console.log(query)
             const access = new userRightsSchema({table_id: newData._id, data: [ query ]})
             access.save()

             // creating new column so we don't have empty table
             const col1 = new columnsSchema({table_id: newData._id,colType: 'String',colName: 'Column Title'})
             const col2 = new columnsSchema({table_id: newData._id,colType: 'String',colName: 'Column2 Title2'})

             // creating the 'row" value for each column
             const colExemple = {}
             colExemple[col1.id] = "Value"
             const colExemple2 = {}
             colExemple2[col2.id] = "Value 2"
             //fusionning the data just like when we are making an '/edit/:id' 
             const container = {...colExemple,...colExemple2}
             const row = new rowSchema({table_id: newData._id,data: [container]})
             // persist the data
             row.save()
             col1.save()
             col2.save()
             newData.save()
             .then(dd => userRightsSchema.find({})
                   .then( data => {
                        let tab = []
                        let i = 0
                        console.log(data)
                        data.map(info => {info.data[0][req.body.userID] ? tab.push(info.table_id) : null})
                        let container = []
                        console.log(tab)
                        tab.map(row => { tableSchema.find({_id: row}).then(data => {
                        container.push(data[0])
                        i++
                        console.log(container)
                        console.log(i)
                        if (i === tab.length) {
                            console.log('hého')
                            console.log(container)
                            res.status(200).send({success:`true`,data: container})
                            res.end()
                        }
                        })
                        })
                   }))
            } 
            if (req.originalUrl === '/rows/create/') {
                let newRow = { data: req.body.exempleRow.data,
                                table_id: req.body.table_id}

                req.body.column.map(columnInfo => {
                    newRow.data[0][columnInfo._id] = "New Value"
                })
                newData = new schema(newRow)
                newData.save()
                .then(data => {schema.find({table_id: req.body.table_id})
                .then(dataRow =>{
                    res.json({dataRow: dataRow,socket: req.body.socket})
                    res.end()
                    }).catch(err => {res.status(400).send(`An error occured, unable to add data : "${err}"`)})
                    }).catch(err => {res.status(400).send(`An error occured, unable to add data : "${err}"`)})
                
            // if we create a columns we need to update all the rows
            } else if ( req.originalUrl === '/columns/create/' ) {
                
                console.log("heelo")
                let query = {}
                query[newData._id] = "Value"

                rowSchema.find({table_id: req.body.table_id})
                .then(data => {
                data.map(row => {
                    toUpdate =  {data: [{...row.data[0],...query}]}
                    rowSchema.findOneAndUpdate({_id: row._id},toUpdate).catch(err => {
                        res.status(400).send(`Unable to save to database`)
                        res.end()})                                                       
                })})
                newData.save()
                .then(row => {columnsSchema.find({table_id: req.body.table_id}).then( dataColumn => {
                    res.json({dataColumn,socket: req.body.socket})
                    res.end()
                    })}).catch(err => {
                res.status(400).send(`Unable to save to database`)
                res.end()})
                
            }
           // persist the data into the DB and telling it's allright if it's allright
           if  (req.originalUrl !== '/rows/create/') {
               if   (req.originalUrl === '/columns/create/') {

               } else if (req.originalUrl === '/tables/create/') {

               } else {
            newData.save()
                .then(row => {
                res.json({message: 'ok',data: newData})
                res.end()})
                .catch(err => {
                res.status(400).send(`Unable to save to database`)
                res.end()})
               }
               
           }
            
        })
    } else if (_methode === 'delete') {

        routeExpress.route('/delete/:id').delete(authGuard,(req,res) => {
            // finding with the id given in params
            if(req.originalUrl === `/tables/delete/${req.params.id}`){
                userRightsSchema.findOneAndDelete({table_id: req.params.id}).then(value =>
                rowSchema.deleteMany({table_id: req.params.id}).then( value2 =>
                columnsSchema.deleteMany({table_id: req.params.id})) )
                console.log('deleted')
                    
            } else if (req.originalUrl === `/columns/delete/${req.params.id}` ) {
                console.log('je pass bien ici')
                rowSchema.find({table_id: req.body.table_id}).then(data =>{ 
                    console.log('----- data -----')
                    console.log(data)
                    data.map(row=>{
                        console.log('----- row 1 -----')
                        console.log(row)
                        delete row.data[0][req.params.id]
                        console.log('----- row 2 -----')
                        console.log(row)
                        rowSchema.findOneAndUpdate({_id: row._id},{data: row.data}).then(data => console.log(`edited ${data}`))
                    })
                })
            }
            let container =''
            schema.find({_id: req.params.id}).then(data => container = data )
            schema.findOneAndDelete({_id: req.params.id})
                    // if it's ok sending a response
                    .then(row => {
                        res.json({message: `The data has been deleted successfully`, id_item: req.params.id,socket: req.body.socket,table_id: container[0].table_id,socket: req.body.socket})})
                    .catch(err => {res.status(400).send(`An error occured, unable to delete data : "${err}"`)})
        })

    }

}