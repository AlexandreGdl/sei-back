import express from 'express'
import mongoose from 'mongoose'
import db_conf from './db_conf'
import bodyParser  from 'body-parser'
import UserRoute from './routes/usersRoute'
import RowRoute from './routes/rowsRoute'
import TableRoute from './routes/tablesRoute'
import ColumnRoute from './routes/columnsRoute'
import UserRightRoute from './routes/userRightsRoute'
import AuthRoute from './routes/authRoute'
import rowsSchema from './schema/rowsSchema'
import expressValidator from 'express-validator'
import env from './env'
import session from 'express-session'
import jwt from 'jsonwebtoken'
import socketIO from 'socket.io'
import http from 'http'

//Creating Serveur And Setting PORT
const app = express()
const PORT = process.env.PORT || 3001

// our localhost port
const portSocket = 4001

// our server instance
const server = http.createServer(app)

// This creates our socket using the instance of the server
const io = socketIO(server)



//Connection to the DataBase + Some settings to CRUD the DataBase
mongoose.connect('mongodb+srv://vilaty:MullWu6co85WIhGV@cluster0-wmuey.mongodb.net/sei-back?retryWrites=true&w=majority', {useNewUrlParser: true, useFindAndModify: false,useCreateIndex: true}).then(
    () => {console.log(`Connection to the DataBase successfully`)},
    // if Error 
    err => {console.log(`Database ERROR`)}
)

//Allow CORS AND ALLOW PUT POST GET DELETE ?
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, jwt")
    res.header("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE")
    next()
})

//In order to valide the Body of Request POST
app.use(expressValidator())

//BodyParser conf
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.use(session({
    'secret': env.env.session,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60*60*24
    }
}
))

//Adding the routes
app.use('/users',UserRoute)
app.use('/tables',TableRoute)
app.use('/rows',RowRoute)
app.use('/columns',ColumnRoute)
app.use('/auth', AuthRoute)
app.use('/userRights', UserRightRoute)



app.listen(PORT,() => {
    console.log(`Starting server`)
    console.log(`Server ON`)
})

/*---Socket - function---*/
io.on('connection',socket =>{
    console.log('New client connected with id : ' + socket.id)

    socket.on('Changing value in table',room => {
            io.to(room).emit('New Value In Table',{data: ''})
    })
    
    socket.on('Changing Column',room => {
            io.to(room).emit('New Column Value',{data: ''})
    })

    socket.on('Changing Table',room => {
        console
        io.emit('New Table Value',{data: ''}) 
    })

    socket.on('Deleting Table',room =>{
        io.emit('Table Deleted',{data: ''})
    })
    // in order to sent socket only to the users that are on the same table as us
    socket.on('Join Room',(room) => {
        console.log('-----------------------NEW ROOM-------------')
        socket.join(room,()=> {
            let rooms = Object.keys(socket.rooms);
            console.log(rooms) 
      })
      console.log('-----------------------END ROOM-------------')
    })

    socket.on("New Message",(data) => {
        console.log(data)
        io.to(data.table_id).emit("Receive Message",data.chat)
    })
})


server.listen(portSocket, () => console.log(`Listening socket.io on port ${portSocket}`))
