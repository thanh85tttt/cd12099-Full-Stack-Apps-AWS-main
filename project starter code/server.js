import express from "express"
import bodyParser from "body-parser"
import { filterImageFromURL, deleteLocalFiles } from "./util/util.js"

// Init the Express application
const app = express()

// Set the network port
const port = process.env.PORT || 8082

// Use the body parser middleware for post requests
app.use(bodyParser.json())

// Filtering images endpoint
app.get("/filteredimage", async (req, res) => {
  const { image_url } = req.query
  if (!image_url) {
    return res.status(400).send("Image URL is invalid")
  }

  try {
    const imagePath = await filterImageFromURL(image_url)
    res.sendFile(imagePath, async (error) => {
      if (error) {
        console.error(error)
        return res.status(500).send("Sending image failed, please try again.")
      }
      try {
        await deleteLocalFiles([imagePath])
      } catch (error) {
        console.error("Deleting image failed:", error)
      }
    })
  } catch (error) {
    console.error("Processing image failed:", error)
    res.status(422).send("Unable to process the image, please try again.")
  }
})

// Root Endpoint
// Displays a simple message to the user
app.get("/", async (req, res) => {
  res.send("try GET /filteredimage?image_url={{}}")
})

// Start the Server
app.listen(port, () => {
  console.log(`server running http://localhost:${port}`)
  console.log(`press CTRL+C to stop server`)
})
