const express = require("express");
const engines = require("consolidate");
const paypal = require("paypal-rest-sdk");
require('dotenv').config();
const bodyParser = require('body-parser');
const app = express();

app.engine("ejs", engines.ejs);
app.set("views", "./views");
app.set("view engine", "ejs");

paypal.configure({
    mode: "sandbox", //sandbox or live
    client_id:
        process.env.CLIENT,
    client_secret:
        process.env.SECRET
});


app.get("/", (req, res) => {
    res.render("index");
});

app.get("/paypal", (req, res) => {
    var create_payment_json = {
        intent: "sale",
        payer: {
            payment_method: "paypal"
        },
        redirect_urls: {
            return_url: "https://swish-paypal.herokuapp.com/success",
            cancel_url: "https://swish-paypal.herokuapp.com/cancel"
        },
        transactions: [
            {
                item_list: {
                    items: [
                        {
                            name: "item",
                            sku: "item",
                            price: "1.00",
                            currency: "USD",
                            quantity: 1
                        }
                    ]
                },
                amount: {
                    currency: "USD",
                    total: "1.00"
                },
                description: "This is the payment description."
            }
        ]
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            console.log("Create Payment Response");
            console.log(payment);
            res.redirect(payment.links[1].href);
        }
    });
});

app.get("/success", (req, res) => {
    var PayerID = req.query.PayerID;
    var paymentId = req.query.paymentId;
    var execute_payment_json = {
        payer_id: PayerID,
        transactions: [
            {
                amount: {
                    currency: "USD",
                    total: "1.00"
                }
            }
        ]
    };

    paypal.payment.execute(paymentId, execute_payment_json, function (
        error,
        payment
    ) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log("Get Payment Response");
            console.log(JSON.stringify(payment));
            res.render("success");
        }
    });
});

app.get("/cancel", (req, res) => {
    res.render("cancel");
});

app.listen(process.env.PORT, () => {
    console.log("Server is running");
});

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))