const express = require("express");
const app = express();
const cors = require("cors");
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require('fs');
const port = 3001;

// app.use(cors()); init 

app.use(
  cors({
    origin: 'https://image-resizer-task-client.vercel.app/', 
    credentials: true, 
  })
);

app.use(express.urlencoded({ extended: true }));

const store = multer.memoryStorage();
const uploadfile = multer({ storage: store });


app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});


app.post("/upload", uploadfile.single("file"), async (req, res) => {
    try {
        const image = req.file.buffer; 
        const width = parseInt(req.body.width);
        const height = parseInt(req.body.height); 


        const resizename = `resize_${width || 0 }x${height || 0 }_${Date.now()}.png`; 
        const outputPath = path.join(__dirname, "download", resizename);

        let processedImage = sharp(image);
        if (!width) {
            processedImage = processedImage.resize({ height, fit: 'contain' });
        } else if (!height) {
            processedImage = processedImage.resize({ width, fit: 'contain' });
        } else {
            processedImage = processedImage.resize(width, height, { fit: 'contain' });
        }
        
        await processedImage.toFile(outputPath);

        res.json({ imageUrl: `${resizename}` });


    } catch (error) {
        console.error("Error processing image:", error);
        res.status(500).send("Error processing image");
    }
});

app.get("/download/:image", async (req, res) => {
    const imageName = req.params.image; 
    const imagePath = path.join(__dirname, 'download', imageName); 

    const fullUrl = `${req.protocol}://${req.get('host')}/download/${imageName}`;

    // console.log(imageName);
    // console.log(imagePath);
    // console.log(fullUrl);

    try {
        
        if (!fs.existsSync(imagePath)) {
            return res.status(404).send("File not found");
        }

        
        res.download(imagePath, (err) => {
            if (err) {
                console.error("Error downloading file:", err);
                return res.status(500).send("Could not download the file");
            }
        });
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).send("Server error");
    }
});



app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



