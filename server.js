const express = require("express");
const axios = require("axios");
const Razorpay = require("razorpay");

const app = express();

app.use(express.json());


// ===== CONFIG =====

const BOT_TOKEN = "8967748156:AAHa4oK4eqDsHr7d-haFpEtAmhuePbML3Xc";

const GROUP_ID = "-1003978853785";

const RAZORPAY_KEY_ID =
"rzp_test_SrD9gMMFX4RKc2";

const RAZORPAY_KEY_SECRET =
"1Gh5u6oanhangbeIFq6Npl7O";


// ===== RAZORPAY =====

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});



// ===== TELEGRAM START =====

app.post("/telegram", async (req, res) => {

  try {

    const msg = req.body.message;

    if (msg && msg.text === "/start") {

      const chatId = msg.chat.id;


      // create order

      const order =
await razorpay.orders.create({

  amount: 9900,

  currency: "INR",

  receipt: "receipt_" + chatId,

  notes: {
    telegram_id: String(chatId),
  }

});


      const paymentLink =
`https://checkout.razorpay.com/v1/checkout.js?order_id=${order.id}`;



      await axios.post(
`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
{
  chat_id: chatId,

  text:
`✅ Payment karo:

Order ID:
${order.id}

Aapka payment ready hai.`
}
      );

    }

    res.sendStatus(200);

  } catch (e) {

    console.log(e);

    res.sendStatus(500);
  }

});




// ===== WEBHOOK =====

app.post("/razorpay", async (req, res) => {

  try {

    const payment =
req.body.payload.payment.entity;

    const telegramId =
payment.notes.telegram_id;

    if (!telegramId) {

      return res.sendStatus(200);

    }



    // create unique invite

    const invite =
await axios.post(
`https://api.telegram.org/bot${BOT_TOKEN}/createChatInviteLink`,
{
  chat_id: GROUP_ID,

  member_limit: 1,

  expire_date:
Math.floor(Date.now()/1000)+600
}
    );


    const inviteLink =
invite.data.result.invite_link;



    // send invite

    await axios.post(
`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
{
  chat_id: telegramId,

  text:
`✅ Payment Successful

Join Link:
${inviteLink}`
}
    );


    res.sendStatus(200);

  } catch (e) {

    console.log(e);

    res.sendStatus(500);
  }

});




app.get("/", (req, res) => {

  res.send("Running");

});



app.listen(3000, () => {

  console.log("Server Started");

});
