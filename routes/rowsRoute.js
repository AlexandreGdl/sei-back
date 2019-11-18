import createRoute from '../controller/routeCreator'
import express from 'express'
import RowSchema from '../schema/rowsSchema'

const RowRoute = express.Router()

createRoute(RowRoute, 'rows', RowSchema)

export default RowRoute