import crypto from 'crypto'

export default function randomValueBase64(len) {
    return crypto
        .randomBytes(Math.ceil((len * 3) / 4)) //In Base64 format, the number of output bytes per input byte is 4/3 (33% overhead). So to get X output characters, we need to generate 3/4 of X bytes.
        .toString('base64') // convert to base64 format
        .slice(0, len) // return required number of characters
        .replace(/\+/g, '0') // replace '+' with '0'
        .replace(/\//g, '0') // replace '/' with '0'
}