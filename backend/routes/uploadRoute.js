import express from "express";
import multer from "multer";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
const config = {};

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/");
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({ storage });

const router = express.Router();

// Optional
// router.post("/", upload.single("image"), (req, res) => {
//   const file = req.file;
//   if (!file) {
//     return res.statusCode(400).send("Please upload a file");
//   }

//   res.send(`/${req.file.path}`);
// });

const imageSchema = mongoose.Schema({
  imageData: "",
});

const UploadModel = mongoose.model("Image", imageSchema);

router.post("/", upload.single("image"), async (req, res) => {
  try {
    var img = fs.readFileSync(req.file.path);

    var encode_image = img.toString("base64");

    // define a JSON object for image

    var finalImg = {
      contentTypep: req.file.mimeType,
      path: req.file.path,
      image: new Buffer.from(encode_image, "base64"),
    };

    // insert the image to the database

    const newImage = await UploadModel.create({
      imageData: finalImg,
    });

    if (newImage) {
      res.send(newImage._id);
    } else {
      res.status(401).send({ message: "Invalid Data" });
    }
  } catch (error) {
    res.status(401).send({ message: error.message });
  }
});

export default router;

//src=data:image/jpg;base64,
