import fs from 'fs';
import path from 'path';

export class LocalizationService {
  private localesPath = path.join(__dirname, 'locales');

  async getTranslations(lang: string, namespace: string): Promise<Record<string, any>> {
    const filePath = path.join(this.localesPath, lang, `${namespace}.json`);

    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`Translation not found for ${lang}/${namespace}`);
      }

      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('LocalizationService error:', error.message);
      throw error;
    }
  }
}