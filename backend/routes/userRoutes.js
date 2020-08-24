import express, { response } from "express";
import User from "../models/userModel";
import { getToken, isAdmin, isAuth } from "../util";

const router = express.Router();

router.post("/signin", async (req, res) => {
  try {
    const signinUser = await User.findOne({
      email: req.body.email,
      password: req.body.password,
    });

    if (signinUser) {
      res.send({
        _id: signinUser._id,
        name: signinUser.name,
        email: signinUser.email,
        isAdmin: signinUser.isAdmin,
        token: getToken(signinUser),
      });
    } else {
      res.status(401).send({ message: "Invalid Email or password" });
    }
  } catch (error) {
    res.status(401).send({ message: error.message });
  }
});

router.get("/createAdmin", async (req, res) => {
  try {
    const user = new User({
      name: "Sahil",
      email: "sahil.dev@gmail.com",
      password: "123456789",
      isAdmin: true,
    });

    const newUser = await user.save();
    res.send(newUser);
  } catch (error) {
    res.send({ message: error.message });
  }
});

router.post("/register", async (req, res) => {
  try {
    const user = await User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });
    const newUser = await user.save();

    if (newUser) {
      res.send({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        isAdmin: newUser.isAdmin,
        token: getToken(newUser),
      });
    } else {
      res.status(401).send({ message: "Invalid User Data" });
    }
  } catch (error) {
    res.status(401).send({ message: error.message });
  }
});

export default router;
