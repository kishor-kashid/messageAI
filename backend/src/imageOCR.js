const vision = require("@google-cloud/vision");
const admin = require("firebase-admin");
const {withAIMiddleware} = require("./utils/functionWrapper");

// Initialize Vision API client
const visionClient = new vision.ImageAnnotatorClient();

/**
 * Extract text from an image using Google Cloud Vision OCR
 * Cloud Function: extractImageText
 */
exports.extractImageText = withAIMiddleware(
    async (data, userId) => {
      const {imageUrl, imageBase64} = data;

      // Validate that we have either URL or base64
      if (!imageUrl && !imageBase64) {
        throw new Error("Either imageUrl or imageBase64 must be provided");
      }

      // Check cache first
      const cacheKey = imageUrl ?
        imageUrl.split("/").pop().split("?")[0] :
        imageBase64.substring(0, 50);

      const cached = await checkOCRCache(cacheKey);
      if (cached) {
        console.log(`📦 OCR cache hit for: ${cacheKey}`);
        return cached;
      }

      // Prepare image for Vision API
      let request;
      if (imageUrl) {
        // For Firebase Storage URLs or public URLs
        request = {
          image: {source: {imageUri: imageUrl}},
          features: [{type: "TEXT_DETECTION"}],
        };
      } else {
        // For base64 encoded images
        request = {
          image: {content: imageBase64},
          features: [{type: "TEXT_DETECTION"}],
        };
      }

      // Call Google Cloud Vision API
      console.log(`🔍 Calling Vision API for text detection...`);
      const [result] = await visionClient.annotateImage(request);

      // Check if text was detected
      const textAnnotations = result.textAnnotations;
      if (!textAnnotations || textAnnotations.length === 0) {
        throw new Error("NO_TEXT_DETECTED");
      }

      // Extract full text (first annotation contains all text)
      const extractedText = textAnnotations[0].description;

      // Detect language from detected text
      let detectedLanguages = [];
      if (result.fullTextAnnotation &&
          result.fullTextAnnotation.pages &&
          result.fullTextAnnotation.pages[0] &&
          result.fullTextAnnotation.pages[0].property &&
          result.fullTextAnnotation.pages[0].property.detectedLanguages) {
        detectedLanguages = result.fullTextAnnotation.pages[0]
            .property.detectedLanguages;
      }

      let detectedLanguage = "en"; // Default to English
      if (detectedLanguages.length > 0) {
        // Convert ISO 639-2 (3-letter) to ISO 639-1 (2-letter)
        const langCode = detectedLanguages[0].languageCode;
        detectedLanguage = convertToISO6391(langCode);
      }

      // Calculate average confidence
      let totalConfidence = 0;
      let wordCount = 0;
      for (let i = 1; i < textAnnotations.length; i++) {
        if (textAnnotations[i].confidence) {
          totalConfidence += textAnnotations[i].confidence;
          wordCount++;
        }
      }
      const confidence = wordCount > 0 ? totalConfidence / wordCount : 0.95;

      const ocrResult = {
        text: extractedText.trim(),
        detectedLanguage: detectedLanguage,
        confidence: confidence,
        wordCount: wordCount || textAnnotations.length - 1,
        processedAt: new Date().toISOString(),
      };

      // Cache the result for 24 hours
      await cacheOCRResult(cacheKey, ocrResult);

      console.log(
          `✅ OCR complete: ${ocrResult.text.length} chars,`,
          `lang: ${detectedLanguage}, confidence: ${confidence.toFixed(2)}`,
      );

      return ocrResult;
    },
    {
      functionName: "extractImageText",
      authMessage: "Must be logged in to use OCR.",
      validate: (data) => {
        if (!data.imageUrl && !data.imageBase64) {
          throw new Error(
              "Either imageUrl or imageBase64 must be provided",
          );
        }
        // Optional validation for URL format or base64 format
        if (data.imageUrl && typeof data.imageUrl !== "string") {
          throw new Error("imageUrl must be a string");
        }
        if (data.imageBase64 && typeof data.imageBase64 !== "string") {
          throw new Error("imageBase64 must be a string");
        }
      },
    },
);

/**
 * Check OCR cache in Firestore
 * @param {string} cacheKey - Cache key (image identifier)
 * @return {Promise<object|null>} Cached result or null
 */
async function checkOCRCache(cacheKey) {
  try {
    const cacheRef = admin.firestore()
        .collection("ocr_cache")
        .doc(cacheKey);

    const cacheDoc = await cacheRef.get();

    if (cacheDoc.exists) {
      const data = cacheDoc.data();
      const now = new Date();
      const processedAt = data.processedAt.toDate ?
        data.processedAt.toDate() :
        new Date(data.processedAt);
      const hoursSinceProcessed =
        (now - processedAt) / (1000 * 60 * 60);

      // Cache valid for 24 hours
      if (hoursSinceProcessed < 24) {
        return {
          text: data.text,
          detectedLanguage: data.detectedLanguage,
          confidence: data.confidence,
          wordCount: data.wordCount,
          processedAt: data.processedAt,
          cached: true,
        };
      }
    }
  } catch (error) {
    console.error("Error checking OCR cache:", error);
  }
  return null;
}

/**
 * Cache OCR result in Firestore
 * @param {string} cacheKey - Cache key (image identifier)
 * @param {object} result - OCR result to cache
 */
async function cacheOCRResult(cacheKey, result) {
  try {
    const cacheRef = admin.firestore()
        .collection("ocr_cache")
        .doc(cacheKey);

    await cacheRef.set({
      text: result.text,
      detectedLanguage: result.detectedLanguage,
      confidence: result.confidence,
      wordCount: result.wordCount,
      processedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`💾 Cached OCR result for: ${cacheKey}`);
  } catch (error) {
    console.error("Error caching OCR result:", error);
  }
}

/**
 * Convert ISO 639-2 (3-letter) to ISO 639-1 (2-letter) codes
 * @param {string} langCode - Language code (2 or 3 letters)
 * @return {string} ISO 639-1 code (2 letters)
 */
function convertToISO6391(langCode) {
  // If already 2 letters, return as is
  if (langCode.length === 2) {
    return langCode;
  }

  // Common ISO 639-2 to ISO 639-1 mappings
  const mapping = {
    "eng": "en",
    "spa": "es",
    "fra": "fr",
    "deu": "de",
    "ita": "it",
    "por": "pt",
    "rus": "ru",
    "jpn": "ja",
    "kor": "ko",
    "chi": "zh",
    "zho": "zh",
    "ara": "ar",
    "hin": "hi",
    "tur": "tr",
    "nld": "nl",
    "pol": "pl",
    "swe": "sv",
  };

  return mapping[langCode.toLowerCase()] || langCode.substring(0, 2);
}

