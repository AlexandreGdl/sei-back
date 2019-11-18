import createRoute from '../controller/routeCreator'
import express from 'express'
import TableSchema from '../schema/tablesSchema'

const TableRoute = express.Router()

createRoute(TableRoute, 'tables', TableSchema)

export default TableRoute