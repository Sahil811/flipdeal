import express, { response } from "express";
import Product from "../models/productModel";
import { isAdmin, isAuth } from "../util";

const router = express.Router();

router.get("/", async (req, res) => {
  const category = req.query.category ? { category: req.query.category } : {};
  const searchKeyword = req.query.searchKeyword
    ? {
        $or: [
          {
            name: {
              $regex: req.query.searchKeyword,
              $options: "i",
            },
          },
          {
            brand: {
              $regex: req.query.searchKeyword,
              $options: "i",
            },
          },
          {
            category: {
              $regex: req.query.searchKeyword,
              $options: "i",
            },
          },
        ],
      }
    : {};

  const sortOrder = req.query.sortOrder
    ? req.query.sortOrder === "highest"
      ? { price: 1 }
      : { price: -1 }
    : { _id: -1 };

  const products = await Product.find({ ...category, ...searchKeyword })
    .sort(sortOrder)
    .populate("image");
  res.send(products);
});

router.get("/:id", async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id }).populate(
    "image"
  );
  if (product) {
    res.send(product);
  } else {
    res.status(404).send({ message: "Product Not Found." });
  }
});
router.post("/:id/reviews", isAuth, async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    const review = {
      name: req.body.name,
      rating: Number(req.body.rating),
      comment: req.body.comment,
    };
    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((a, c) => c.rating + a, 0) /
      product.reviews.length;
    const updatedProduct = await product.save();
    res.status(201).send({
      data: updatedProduct.reviews[updatedProduct.reviews.length - 1],
      message: "Review saved successfully.",
    });
  } else {
    res.status(404).send({ message: "Product Not Found" });
  }
});

router.get("/", async (req, res) => {
  const products = await Product.find({}).populate("image");
  if (products) {
    res.send(products);
  } else {
    res.status(404).send({
      message: "There are no products!",
    });
  }
});

router.get("/:id", async (req, res) => {
  const product = await Product.findById({ _id: req.params.id });
  if (product) {
    res.send(product);
  } else {
    res.status(404).send({
      message: "Product not found!",
    });
  }
});

router.post("/", isAuth, isAdmin, async (req, res) => {
  const product = new Product({
    name: req.body.name,
    price: req.body.price,
    image: req.body.image,
    brand: req.body.brand,
    category: req.body.category,
    countInStock: req.body.countInStock,
    description: req.body.description,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
  });
  const newProduct = await product.save();
  if (newProduct) {
    return res
      .status(201)
      .send({ message: "New Product Created!", data: newProduct });
  }
  return res.status(500).send({ message: "Error while creating new product!" });
});

router.patch("/:id", isAuth, isAdmin, async (req, res) => {
  const productId = req.params.id;
  try {
    const product = await Product.findOne({ _id: productId });

    if (!req.body.image) {
      req.body.image = product.image;
    }

    if (product) {
      product.name = req.body.name;
      product.price = req.body.price;
      product.image = req.body.image;
      product.brand = req.body.brand;
      product.category = req.body.category;
      product.countInStock = req.body.countInStock;
      product.description = req.body.description;
      const updatedProduct = await (await product.save()).populate("image");
      console.log(updatedProduct);
      if (updatedProduct) {
        return res
          .status(200)
          .send({ message: "Product Updated", data: updatedProduct });
      }
    }
  } catch (error) {
    res.status(500).send({ message: "Error while creating Updating product!" });
  }
});

router.delete("/:id", isAuth, isAdmin, async (req, res) => {
  const deleteProduct = await Product.findById(req.params.id);
  if (deleteProduct) {
    await deleteProduct.remove();
    res.send({ message: "Product Deleted" });
  } else {
    res.send("Error in Deletion");
  }
});

export default router;
