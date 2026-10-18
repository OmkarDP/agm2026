/**
 * Samvedana Foundation — AGM 2026 registration backend
 *
 * SETUP
 * 1. Create a Google Spreadsheet named:
 *    संवेदना फाउंडेशन — AGM 2026
 * 2. Rename the first worksheet to:
 *    AGM 2026 नोंदणी
 * 3. Copy the Spreadsheet ID from the sheet URL:
 *    https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
 *    and paste it into CONFIG.SPREADSHEET_ID below.
 * 4. In Apps Script: Deploy > New deployment > Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy the Web app /exec URL into the frontend .env:
 *    VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/.../exec
 * 6. After every script change, deploy a new version of the same deployment.
 *
 * Duplicate policy:
 * CONFIG.REJECT_DUPLICATE_MOBILE = true rejects a second registration that
 * uses the same normalized 10-digit mobile number.
 *
 * Limitations of this duplicate check:
 * - It only searches this worksheet, not other sheets or files.
 * - It compares normalized 10-digit strings only.
 * - LockService reduces overlapping writes in this script, but it cannot
 *   fully prevent races if the lock wait times out, if another script
 *   project writes to the same sheet, or if a user edits the sheet by hand.
 * - Numbers stored in a different format (for example +91) will not match.
 * - The scan reads the mobile column on each write; very large sheets are slower.
 */

const CONFIG = {
  SPREADSHEET_ID: "YOUR_SPREADSHEET_ID",
  SHEET_NAME: "AGM 2026 नोंदणी",
  REJECT_DUPLICATE_MOBILE: true,
  LOCK_WAIT_MS: 30000,
  MAX_NAME_LENGTH: 120,
};

const HEADERS = [
  "नोंदणी क्रमांक",
  "नोंदणी दिनांक व वेळ",
  "पूर्ण नाव",
  "मोबाईल क्रमांक",
  "प्रवासाचा पर्याय",
  "भोजनाची पसंती",
  "पेमेंट स्थिती",
  "नोंदणी शुल्क",
];

const TRAVEL_OPTIONS = ["मुंबई", "पुणे", "कोल्हापूर (आजरा , भुदरगड, गडहिंग्लज, चंदगड)", "स्वतःची व्यवस्था"];
const FOOD_OPTIONS = ["शाकाहारी", "मांसाहारी"];
const MOBILE_PATTERN = /^[6-9][0-9]{9}$/;

function doGet() {
  return jsonOutput_({
    ok: true,
    message: "नोंदणी सेवा कार्यरत आहे.",
  });
}

function doPost(e) {
  try {
    const payload = parseBody_(e);
    const validated = validatePayload_(payload);
    return writeRegistration_(validated);
  } catch (error) {
    return handleError_(error);
  }
}

function parseBody_(e) {
  if (!e || !e.postData || typeof e.postData.contents !== "string") {
    throw clientError_("अवैध विनंती. कृपया फॉर्म पुन्हा सबमिट करा.");
  }

  try {
    const parsed = JSON.parse(e.postData.contents);
    if (!parsed || typeof parsed !== "object") {
      throw new Error("invalid");
    }
    return parsed;
  } catch (error) {
    throw clientError_("अवैध विनंती. कृपया फॉर्म पुन्हा सबमिट करा.");
  }
}

function validatePayload_(payload) {
  if (typeof payload.website === "string" && payload.website.trim() !== "") {
    throw clientError_("नोंदणी अयशस्वी झाली. कृपया पुन्हा प्रयत्न करा.");
  }

  const fullName = normalizeName_(payload.fullName);
  const mobile = normalizeMobile_(payload.mobile);
  const travel =
    typeof payload.travel === "string" ? payload.travel.trim() : "";
  const food = typeof payload.food === "string" ? payload.food.trim() : "";

  if (!fullName) {
    throw clientError_("कृपया पूर्ण नाव भरा.");
  }
  if (fullName.length > CONFIG.MAX_NAME_LENGTH) {
    throw clientError_("पूर्ण नाव खूप मोठे आहे.");
  }
  if (!mobile) {
    throw clientError_("कृपया मोबाईल क्रमांक भरा.");
  }
  if (!MOBILE_PATTERN.test(mobile)) {
    throw clientError_("कृपया १० अंकी वैध भारतीय मोबाईल क्रमांक भरा.");
  }
  if (TRAVEL_OPTIONS.indexOf(travel) === -1) {
    throw clientError_("कृपया प्रवासाचा पर्याय निवडा.");
  }
  if (FOOD_OPTIONS.indexOf(food) === -1) {
    throw clientError_("कृपया भोजनाची पसंती निवडा.");
  }

  const paymentConfirmed = payload.paymentConfirmed === true;
  const paymentStatus =
    typeof payload.paymentStatus === "string"
      ? payload.paymentStatus.trim()
      : paymentConfirmed
        ? "होय"
        : "नंतर करतो आणि ADMIN ला कळवतो";
  const registrationFee =
    typeof payload.registrationFee === "string"
      ? payload.registrationFee.trim()
      : paymentConfirmed
        ? "१०००"
        : "०";

  return {
    fullName: neutralize_(fullName),
    mobile: mobile,
    travel: neutralize_(travel),
    food: neutralize_(food),
    paymentStatus: neutralize_(paymentStatus),
    registrationFee: neutralize_(registrationFee),
  };
}

function writeRegistration_(data) {
  if (
    !CONFIG.SPREADSHEET_ID ||
    CONFIG.SPREADSHEET_ID === "YOUR_SPREADSHEET_ID"
  ) {
    throw serverError_(
      "नोंदणी सेवा सध्या उपलब्ध नाही. कृपया आयोजकांशी संपर्क साधा.",
    );
  }

  const lock = LockService.getScriptLock();
  const locked = lock.tryLock(CONFIG.LOCK_WAIT_MS);
  if (!locked) {
    throw serverError_(
      "सध्या अनेक विनंत्या येत आहेत. कृपया थोड्या वेळाने पुन्हा प्रयत्न करा.",
    );
  }

  try {
    const sheet = getOrCreateSheet_();
    ensureHeaders_(sheet);

    if (CONFIG.REJECT_DUPLICATE_MOBILE && hasMobile_(sheet, data.mobile)) {
      return jsonOutput_({
        ok: false,
        error: "या मोबाईल क्रमांकाची नोंदणी आधीच झाली आहे.",
      });
    }

    const registrationId = Utilities.getUuid();
    const timestamp = Utilities.formatDate(
      new Date(),
      "Asia/Kolkata",
      "yyyy-MM-dd HH:mm:ss",
    );

    const nextRow = sheet.getLastRow() + 1;
    sheet
      .getRange(nextRow, 1, 1, HEADERS.length)
      .setValues([
        [
          registrationId,
          timestamp,
          data.fullName,
          data.mobile,
          data.travel,
          data.food,
          data.paymentStatus,
          data.registrationFee,
        ],
      ]);
    sheet.getRange(nextRow, 4).setNumberFormat("@");

    return jsonOutput_({
      ok: true,
      message: "आपली नोंदणी यशस्वीरीत्या पूर्ण झाली आहे. धन्यवाद!",
    });
  } finally {
    lock.releaseLock();
  }
}

function getOrCreateSheet_() {
  let spreadsheet;
  try {
    spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  } catch (error) {
    throw serverError_(
      "नोंदणी सेवा सध्या उपलब्ध नाही. कृपया आयोजकांशी संपर्क साधा.",
    );
  }

  let sheet = spreadsheet.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(CONFIG.SHEET_NAME);
  }
  return sheet;
}

function ensureHeaders_(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.getRange(1, 4).setNumberFormat("@");
    sheet.setFrozenRows(1);
    return;
  }

  const existing = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  for (let i = 0; i < HEADERS.length; i++) {
    if (String(existing[i]) !== HEADERS[i]) {
      sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
      break;
    }
  }
}

function hasMobile_(sheet, mobile) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return false;
  }

  const values = sheet.getRange(2, 4, lastRow - 1, 1).getDisplayValues();
  for (let i = 0; i < values.length; i++) {
    if (normalizeMobile_(values[i][0]) === mobile) {
      return true;
    }
  }
  return false;
}

function normalizeName_(value) {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim().replace(/\s+/g, " ");
}

function normalizeMobile_(value) {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value).replace(/\D/g, "");
}

function neutralize_(value) {
  if (/^[=+\-@\t\r]/.test(value)) {
    return "'" + value;
  }
  return value;
}

function jsonOutput_(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(
    ContentService.MimeType.TEXT,
  );
}

function clientError_(message) {
  const error = new Error(message);
  error.name = "ClientError";
  return error;
}

function serverError_(message) {
  const error = new Error(message);
  error.name = "ServerError";
  return error;
}

function handleError_(error) {
  const safeMessage =
    error && (error.name === "ClientError" || error.name === "ServerError")
      ? error.message
      : "नोंदणी अयशस्वी झाली. कृपया पुन्हा प्रयत्न करा.";

  return jsonOutput_({
    ok: false,
    error: safeMessage,
  });
}
