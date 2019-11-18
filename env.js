import randomValueBase64 from './function/random64bits'

// auto-generate random value for secret and session id
const secret = randomValueBase64(125)
const session = randomValueBase64(125)


export default {
    env: {
        type: 'dev',
        secret: secret,
        session: session
    }
}