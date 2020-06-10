let express = require('express');
let request = require('request');
let bodyParser = require('body-parser');
require('dotenv').config();

let CLIENT = process.env.CLIENT;
let SECRET = process.env.SECRET;

var PAYPAL_API = 'https://api.sandbox.paypal.com';

express()
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: false }))
    .post('/create-payment/', (req, res) => {
        request.post(PAYPAL_API + '/v1/payments/payment',
            {
                auth: {
                    user: CLIENT,
                    pass: SECRET
                },
                body: {
                    intent: 'sale',
                    payer: {
                        payment_method: 'paypal'
                    },
                    transactions: [
                        {
                            amount: {
                                total: req.body.total,
                                currency: 'USD'
                            }
                        }
                    ],
                    redirect_urls:
                    {
                        return_url: 'https://example.com',
                        cancel_url: 'https://example.com'
                    }
                },
                json: true
            }, (err, response) => {
                if (err) {
                    console.error(err);
                    return res.sendStatus(500);
                }
                res.json({
                    id: response.body.id,
                    response
                });
            });
    })
    .post('/execute-payment/', (req, res) => {
        let paymentID = req.body.payment_ID;
        let payerID = req.body.payer_ID;

        request.post(PAYPAL_API + '/v1/payments/payment/' + paymentID + '/execute',
            {
                auth: {
                    user: CLIENT,
                    pass: SECRET
                },
                body: {
                    payer_id: payerID,
                    transactions: [
                        {
                            amount:
                            {
                                total: req.body.total,
                                currency: 'USD'
                            }
                        }
                    ]
                },
                json: true
            }, (err, response) => {
                if (err) {
                    console.error(err)
                    return res.sendStatus(500)
                }
                res.json(
                    {
                        status: 'success',
                        response
                    }
                )
            })
    }).listen(process.env.PORT || 3000, () => {
        console.log('Server listening at http://localhost:3000/')
    })