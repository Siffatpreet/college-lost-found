const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const Item = require("./model/Item");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Uploads folder
const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve uploaded images
app.use("/uploads", express.static(uploadDir));

// Multer configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },

    filename: function (req, file, cb) {
        const uniqueName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1E9) +
            path.extname(file.originalname);

        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed!"));
        }
    }
});

// Home route
app.get("/", (req, res) => {
    res.send("Lost & Found Backend is running!");
});

// Test route
app.get("/api/test", (req, res) => {
    res.send("API route is working!");
});

// Create Lost/Found item
app.post("/api/items", upload.single("photo"), async (req, res) => {
    try {
        if (req.body.type === "found" && !req.file) {
            return res.status(400).json({
                error: "Photo is required for found items."
            });
        }

        const item = new Item({
            type: req.body.type,
            itemName: req.body.itemName,
            description: req.body.description,
            location: req.body.location,
            date: req.body.date,
            contact: req.body.contact,
            photo: req.file ? `/uploads/${req.file.filename}` : ""
        });

        const savedItem = await item.save();

        res.status(201).json(savedItem);

    } catch (error) {
        res.status(400).json({
            error: error.message
        });
    }
});

// Get all items
app.get("/api/items", async (req, res) => {
    try {
        const items = await Item.find().sort({ createdAt: -1 });

        res.json(items);

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

// Check MongoDB environment variable
console.log("MONGO_URI exists:", !!process.env.MONGO_URI);

// MongoDB connection
if (!process.env.MONGO_URI) {
    console.error("ERROR: MONGO_URI is not defined.");
} else {
    mongoose.connect(process.env.MONGO_URI)
        .then(() => {
            console.log("MongoDB connected successfully!");
        })
        .catch((error) => {
            console.log("MongoDB connection failed:", error.message);
        });
}
// Clean page URLs
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "portal.html"));
});

app.get("/lost", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "LostItems.HTML"));
});

app.get("/found", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "FoundItems.HTML"));
});
// Render provides PORT automatically
const PORT = process.env.PORT || 5001;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
