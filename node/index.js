'use strict'

require('dotenv').config()
const express = require('express')
const cors = require('cors')
const bent = require('bent')

const PORT = process.env.APP_PORT || 8000
const ENV = process.env.OCROLUS_WIDGET_ENVIRONMENT || 'development'
const OCROLUS_CLIENT_ID = process.env.OCROLUS_CLIENT_ID
const OCROLUS_CLIENT_SECRET = process.env.OCROLUS_CLIENT_SECRET

if (!OCROLUS_CLIENT_ID && !OCROLUS_CLIENT_SECRET) {
    throw Error(
        'Ocrolus client and secret undefined in env. modify .env to contain client id and secret for ocrolus widget.'
    )
}

const TOKEN_ISSUER_URLS = {
    development: 'https://jwe-issuer.demo.ocrolus.net',
    production: 'https://jwe-issuer.ocrolus.net',
}

const token_issuer = TOKEN_ISSUER_URLS[ENV]

if (!token_issuer) {
    throw Error(`Unable to initialize environment ${ENV}. Missing Issuer URL for environment level.`)
}

const issuer = bent(token_issuer, 'POST', 'json', 200)

const app = express()

app.use(cors())

// This is an example proxy for a query that an implementing server would need to do
// in order to get the desired external_id value to be sent to Ocrolus. For example
// purposes this will just mirror back the passed userId
function getUserExternalId(userId) {
    console.log('fake user lookup in local data store', userId)
    return Promise.resolve('9858775')
}

app.post('/token', function (request, response) {
    const user_token = request.headers.authorization || 1234
    return getUserExternalId(user_token).then(userId => {
        return issuer('/token', {
            client_id: OCROLUS_CLIENT_ID,
            client_secret: OCROLUS_CLIENT_SECRET,
            external_id: userId,
            grant_type: 'client_credentials',
            name: 'test',
        }).then(token_response => {
            const token = token_response.access_token

            response.json({ accessToken: token })
        })
    })
})

const server = app.listen(PORT, function () {
    console.log('plaid-quickstart server listening on port ' + PORT)
})
