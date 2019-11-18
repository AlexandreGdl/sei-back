import createRoute from '../controller/routeCreator'
import express from 'express'
import ColumnSchema from '../schema/columnsSchema'

const ColumnRoute = express.Router()

createRoute(ColumnRoute, 'columns', ColumnSchema)

export default ColumnRoute