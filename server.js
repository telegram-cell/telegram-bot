const express = require("express");
const axios = require("axios");

const app = express();

app.use(express.json());


// ===== SETTINGS =====

const BOT_TOKEN = "8967748156:AAHa4oK4eqDsHr7d-haFpEtAmhuePbML3Xc";

const GROUP_ID = "-1003978853785";

const PAYMENT_LINK =
"https://rzp.io/rzp/ugkoBhYG";


// ===== TELEGRAM START =====

app.post("/telegram", async (req, res) => {

  try {

    const msg = req.body.message;

    if (msg && msg.text === "/start") {

      const chatId = msg.chat.id;

      // payment link with telegram id
      const finalLink =
`${PAYMENT_LINK}?telegram_id=${chatId}`;


      await axios.post(
`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
{
  chat_id: chatId,
  text:
`✅ Payment karne ke liye niche click karo

${finalLink}`
}
      );

    }

    res.sendStatus(200);

  } catch (e) {

    console.log(e);

    res.sendStatus(500);
  }

});




// ===== RAZORPAY WEBHOOK =====

app.post("/razorpay", async (req, res) => {

  try {

    const payment =
req.body.payload.payment.entity;

    const notes = payment.notes || {};

    const telegramId =
notes.telegram_id;

    if (!telegramId) {

      return res.sendStatus(200);

    }


    // unique invite link

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



    // send to user

    await axios.post(
`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
{
  chat_id: telegramId,

  text:
`✅ Payment Successful

Group Join Link:
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

  res.send("Bot Running");

});



app.listen(3000, () => {

  console.log("Running");

});