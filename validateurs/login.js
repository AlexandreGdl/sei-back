import {body} from 'express-validator/check'


const validateLoginBody = () => {
    return [ 
        body('email')
            .exists()
            .withMessage('Email is required'),

        body('password')
            .exists()
            .withMessage('Password is required')
    ]
}

export default validateLoginBody()