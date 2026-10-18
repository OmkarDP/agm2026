export const ORGANIZATION = "संवेदना फाउंडेशन";

export const PAGE_TITLE = "वार्षिक सर्वसाधारण सभा २०२६";

export const PAGE_SUBTITLE = "आपली उपस्थिती नोंदवा";

export const PAGE_DESCRIPTION =
  "संवेदना फाउंडेशन यांच्या वार्षिक सर्वसाधारण सभेसाठी कृपया खालील माहिती भरून आपली नोंदणी पूर्ण करा.";

export const TRAVEL_OPTIONS = [
  "मुंबई",
  "पुणे",
  "कोल्हापूर (आजरा , भुदरगड, गडहिंग्लज, चंदगड)",
  "स्वतःची व्यवस्था",
] as const;

export const FOOD_OPTIONS = ["शाकाहारी", "मांसाहारी"] as const;

export type TravelOption = (typeof TRAVEL_OPTIONS)[number];
export type FoodOption = (typeof FOOD_OPTIONS)[number];

export const PAYMENT_AMOUNT = "१०००";

export const DEMO_UPI_NUMBER = "demo@upi";

export const PAYMENT_APPEAL = `कृपया वार्षिक सर्वसाधारण सभेची फी रु. ${PAYMENT_AMOUNT}/- UPI वर पेमेंट करा. आपली नोंदणी पूर्ण करण्यासाठी ही फी भरणे आवश्यक आहे.`;

export const PAYMENT_QUESTION = "तुम्ही पेमेंट केली आहे का?";

export const UPI_ID = "9067819090";

export const UPI_NAME = "Shritej Kavalekar";

export const PAYMENT_YES = "होय";

export const PAYMENT_NO = "नंतर करतो आणि ADMIN ला कळवतो";

export const SUCCESS_MESSAGE =
  "आपली नोंदणी यशस्वीरीत्या पूर्ण झाली आहे. धन्यवाद!";

export const MESSAGES = {
  nameRequired: "कृपया पूर्ण नाव भरा.",
  mobileRequired: "कृपया मोबाईल क्रमांक भरा.",
  mobileInvalid: "कृपया १० अंकी वैध भारतीय मोबाईल क्रमांक भरा.",
  travelRequired: "कृपया प्रवासाचा पर्याय निवडा.",
  foodRequired: "कृपया भोजनाची पसंती निवडा.",
  paymentRequired: "कृपया पेमेंट केली आहे का हे निश्चित करा.",
  configMissing:
    "नोंदणी सेवा सध्या उपलब्ध नाही. कृपया आयोजकांशी संपर्क साधा.",
  network:
    "संपर्क साधता आला नाही. कृपया इंटरनेट तपासून पुन्हा प्रयत्न करा.",
  unconfirmed:
    "नोंदणी पूर्ण झाल्याची खात्री करता आली नाही. कृपया थोड्या वेळाने पुन्हा प्रयत्न करा.",
  genericFailure: "नोंदणी अयशस्वी झाली. कृपया पुन्हा प्रयत्न करा.",
  submitting: "नोंदणी सुरू आहे...",
} as const;
