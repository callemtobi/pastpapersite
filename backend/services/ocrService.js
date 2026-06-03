import Tesseract from "tesseract.js";

async function extractText(imagePath) {
  try {
    const result = await Tesseract.recognize(imagePath, "eng", {
      logger: (m) => console.log(m),
    });

    return result.data.text;
  } catch (error) {
    console.error("OCR Error:", error);
    throw error;
  }
}

module.exports = { extractText };
