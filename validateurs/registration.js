import {body} from 'express-validator/check'

const validateRegistrationBody =()=> {
    return [
        body('username')
            .exists()
            .withMessage('Name is required')
            .isLength({min: 3})
            .withMessage('Name must be greater than 3'),

        body('password')
            .exists()
            .withMessage('Password is required')
            .isLength({min: 8, max: 255})
            .withMessage('Password must be in between 8 to 12 characters'),

        body('email')
            .exists()
            .withMessage('Email is required')
    ]
}

export default validateRegistrationBody()