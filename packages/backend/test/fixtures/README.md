# OCR Test Fixtures

Place receipt images here for the integration test (`npm run test:integration`).

## Current fixtures

- `1001-receipt.jpg` … `1033-receipt.jpg` — From the
  [ExpressExpense SRD](https://expressexpense.com/blog/free-receipt-images-ocr-machine-learning-dataset/)
  (MIT license, US restaurant receipts). Used to stress-test OCR pipeline.
- **Add your own** receipt scans to exercise Tesseract (OCR integration tests).

## Requirements

- Supported formats: `.jpg`, `.jpeg`, `.png`, `.webp`, `.bmp`, `.tiff`
- **Redact personal data** (card numbers, names, addresses) before committing

## Naming convention (optional but helpful)

Name files to hint at the expected category, e.g.:

- `rewe-lebensmittel.jpg`
- `netflix-streaming.png`
- `aral-transport.jpg`
- `unknown-sonstiges.png`

The test automatically picks up every image file in this folder.
