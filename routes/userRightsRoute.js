import createRoute from '../controller/routeCreator'
import express from 'express'
import UserRightSchema from '../schema/userRightsSchema'

const UserRightRoute = express.Router()

createRoute(UserRightRoute, 'userRights', UserRightSchema)

export default UserRightRoute