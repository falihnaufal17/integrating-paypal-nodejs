let express = require('express');
let request = require('request');
let bodyParser = require('body-parser');

let CLIENT = "AU1Ip9EcfJbX0Km6nWAsKKni2yFDA16HbeOp9WrsCpNrT9pEXNB_X7IpkhZE7itDVYcNTx2uaIY2vAUw";
let SECRET = "EJ7yw3uBIFAXofFwxI7PRMmru3Xt70kLHI6RgIPvW9LRXl0DKKVBU82f0X6ovDFSHzO_nxRkdPTw1dGL";

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
                    id: response.body.id
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
                        status: 'success'
                    }
                )
            })
    }).listen(process.env.PORT || 3000, () => {
        console.log('Server listening at http://localhost:3000/')
    })