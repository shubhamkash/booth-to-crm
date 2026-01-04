import QrScanner from 'qr-scanner';
import Tesseract from 'tesseract.js';

export class Scanner {
  static async scanQR(videoElement) {
    try {
      const qrScanner = new QrScanner(
        videoElement,
        (result) => result,
        {
          returnDetailedScanResult: true,
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );
      
      await qrScanner.start();
      return qrScanner;
    } catch (error) {
      console.error('QR Scanner failed:', error);
      throw new Error('Camera access denied or not available');
    }
  }

  static async scanBusinessCard(imageFile) {
    try {
      const { data: { text } } = await Tesseract.recognize(imageFile, 'eng', {
        logger: m => console.log(m),
        workerPath: 'https://unpkg.com/tesseract.js@4.1.1/dist/worker.min.js',
        langPath: 'https://tessdata.projectnaptha.com/4.0.0',
        corePath: 'https://unpkg.com/tesseract.js-core@4.0.3/tesseract-core.wasm.js'
      });
      
      const contactInfo = this.extractContactInfo(text);
      // Include the image file for storage
      contactInfo.imageFile = imageFile;
      
      return contactInfo;
    } catch (error) {
      console.error('OCR failed:', error);
      throw new Error('Failed to read business card');
    }
  }

  static extractContactInfo(text) {
    const lines = text.split('\n').filter(line => line.trim());
    
    // Simple extraction patterns
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const phoneRegex = /[\+]?[1-9]?[\d\s\-\(\)]{10,}/;
    
    const email = text.match(emailRegex)?.[0];
    const phone = text.match(phoneRegex)?.[0];
    
    // Assume first line is name, second might be company
    const name = lines[0]?.trim();
    const company = lines[1]?.trim();
    
    return {
      name,
      email,
      company,
      phone,
      raw_text: text
    };
  }

  static parseQRData(qrText) {
    try {
      // Try parsing as JSON first
      const data = JSON.parse(qrText);
      return data;
    } catch {
      // Fallback: treat as vCard or simple text
      if (qrText.startsWith('BEGIN:VCARD')) {
        return this.parseVCard(qrText);
      }
      
      // Simple text - assume it's a name or email
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
      if (emailRegex.test(qrText)) {
        return { email: qrText };
      }
      
      return { name: qrText };
    }
  }

  static parseVCard(vcard) {
    const lines = vcard.split('\n');
    const data = {};
    
    lines.forEach(line => {
      if (line.startsWith('FN:')) data.name = line.substring(3);
      if (line.startsWith('EMAIL:')) data.email = line.substring(6);
      if (line.startsWith('ORG:')) data.company = line.substring(4);
      if (line.startsWith('TITLE:')) data.role = line.substring(6);
    });
    
    return data;
  }
}