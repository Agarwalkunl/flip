const express = require("./node_modules/express");

const cors = require("./node_modules/cors");
const Razorpay = require("./node_modules/razorpay");
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 1000;
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});
var crypto = require("crypto");
app.get("/", (req, resp) => {
  resp.send("hellokunal");
});
var instance = new Razorpay({
  key_id: "rzp_test_l8SB435a25MxdM",
  key_secret: "zvAwFoWhcO9biTJJcpD8jaYq",
});

app.post("/verify", (req, res) => {
  let body =
    req.body.response.razorpay_order_id +
    "|" +
    req.body.response.razorpay_payment_id;

  var expectedSignature = crypto
    .createHmac("sha256", "zvAwFoWhcO9biTJJcpD8jaYq")
    .update(body.toString())
    .digest("hex");

  if (expectedSignature === req.body.response.razorpay_signature)
    res.send({ message: "vaild", status: 210 });
  else res.send({ message: "invaild", status: 211 });
});
app.post("/orders", (req, resp) => {
  var options = {
    amount: 20 * 100, // amount in the smallest currency unit
    currency: "INR",
  };
  instance.orders.create(options, function (err, order) {
    if (err) {
      return resp.send({ status: 500, message: "server err" });
    } else {
      return resp.send({ status: 200, message: "order created", order: order });
    }
  });
});
app.post("/refund/:paymentId", async (req, res) => {
  const { paymentId } = req.params;
  const { refundAmount } = req.body;

  try {
    const refund = await instance.payments.refund(paymentId, {
      amount: refundAmount * 100, // amount in paise
    });

    res.status(200).json({ status: "success", data: refund });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: error.message });
  }
});
app.post("/webhook", (req, res) => {
  const payload = JSON.stringify(req.body);
  const signature = req.get("X-Razorpay-Signature");

  const expectedSignature = crypto
    .createHmac("sha256", "12345678")
    .update(payload)
    .digest("hex");

  if (signature !== expectedSignature) {
    return res.status(400).send("Invalid webhook signature");
  }

  // If the signature is valid, continue processing the webhook
  // ...

  res.status(200).send("Webhook received successfully");
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});

app.listen(PORT, console.log("server start 1000"));
