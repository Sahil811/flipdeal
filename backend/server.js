import express from "express";
import path from "path";
import dotenv from "dotenv";
import mongoose from "mongoose";
import userRoute from "./routes/userRoutes";
import productRoute from "./routes/productRoutes";
import orderRoute from "./routes/orderRoute";
import uploadRoute from "./routes/uploadRoute";
import bodyParser from "body-parser";

dotenv.config({ path: `${__dirname}/config.env` });
const app = express();

app.use(bodyParser.json());

//const mongodbUrl = config.MONGODB_URL;
const mongodbUrl = process.env.MONGODB_ATLAS;

mongoose
  .connect(mongodbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .catch((error) => console.log(error.message));

app.use("/api/uploads", uploadRoute);
app.use("/api/users", userRoute);
app.use("/api/products", productRoute);
app.use("/api/orders", orderRoute);
app.get("/api/config/paypal", (req, res) => {
  res.send(process.env.PAYPAL_CLIENT_ID);
});
app.use("/uploads", express.static(path.join(__dirname, "/../uploads")));

// app.get("*", (req, res) => {
//   res.sendFile(path.resolve(__dirname, "flipdeal", "build", "index.html"));
// });
//app.use(express.static(path.join(__dirname, "/../flipdeal/build")));
// app.get("*", (req, res) => {
//   res.sendFile(path.join(`${__dirname}/../flipdeal/build/index.html`));
// });
if (process.env.NODE_ENV === "production") {
  app.use(express.static("flipdeal/build"));
  app.get("*", (req, res) => {
    res.sendFile(path.join(`${__dirname}/../flipdeal/build/index.html`));
  });
  // app.use(
  //   "*",
  //   express.static(path.join(__dirname, "flipdeal", "build", "index.html"))
  // );
}

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log("Server started at http://localhost:" + PORT);
});
