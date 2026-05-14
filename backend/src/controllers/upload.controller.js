import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import SmartParser from "pdf-parse-new/lib/SmartPDFParser.js";
import mammoth from "mammoth";

export const uploadResume = asyncHandler(async (req, res) => {

  const file = req.file;

  if (!file) {
    throw new ApiError(400, "No file uploaded");
  }

  let extractedText = "";

  // PDF parsing
  if (file.mimetype === "application/pdf") {
    const parser = new SmartParser();
    const data = await parser.parse(file.buffer);

    extractedText = data.text;
  }

  // DOCX parsing
  else if (
    file.mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {

    const result = await mammoth.extractRawText({
      buffer: file.buffer,
    });

    extractedText = result.value;
  }

  console.log(extractedText);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        filename: file.originalname,
        extractedText,
      },
      "Resume uploaded successfully"
    )
  );
});