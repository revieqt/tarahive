import fs from 'fs';
import path from 'path';


export class LocalizationService {
  private localesPath = path.join(__dirname, 'locales');

  /**
   * Get translation JSON for a given language code
   * @param lang language code like 'en', 'fil', 'ceb'
   */
  async getTranslations(lang: string): Promise<Record<string, any>> {
    const filePath = path.join(this.localesPath, `${lang}.json`);

    try {
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        throw new Error(`Language ${lang} not found`);
      }

      // Read JSON
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('LocalizationService error:', error.message);
      throw error;
    }
  }
}