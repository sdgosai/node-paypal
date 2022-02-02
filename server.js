// Require dependencies & Using ...
const express = require('express');
const ejs = require('ejs');
const paypal = require('paypal-rest-sdk');

// Environment var require and pass ...
const dotenv = require('dotenv');
dotenv.config({ path: './.env' })

const app = express();
app.set('view engine', 'ejs');
app.get('/', (req, res) => res.render('index'));

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': '####yourclientid######',
    'client_secret': '####yourclientsecret#####'
});

app.post('/pay', (req, res) => {
    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:1000/success",
            "cancel_url": "http://localhost:1000/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "Book", // Change name ...
                    "sku": "001",
                    "price": "1.00", // Change price
                    "currency": "USD",
                    "quantity": 2 // Change quantity
                }]
            },
            "amount": {
                "currency": "USD",
                "total": "2.00" // Change total amount
            },
            "description": "Hat for the best team ever" // Change des ...
        }]
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            for (let i = 0; i < payment.links.length; i++) {
                if (payment.links[i].rel === 'approval_url') {
                    res.redirect(payment.links[i].href);
                }
            }
        }
    });
});

// Payment success for this API ...
app.get('/success', (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": "2.00" // Change total amount pay ...
            }
        }]
    };
    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log(JSON.stringify(payment));
            res.send('Success');
        }
    });
});

// Payment cancel for this API ...
app.get('/cancel', (req, res) => res.send('Cancelled'));

// PORT config ...
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`node application live at ${PORT}...`);
})