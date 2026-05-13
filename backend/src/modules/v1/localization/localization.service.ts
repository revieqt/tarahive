import fs from 'fs';
import path from 'path';

export class LocalizationService {
  private localesPath = path.join(__dirname, 'locales');

  async getTranslations(lang: string, namespace: string): Promise<Record<string, any>> {
    const filePath = path.join(this.localesPath, lang, `${namespace}.json`);

    if (!fs.existsSync(filePath)) {
      throw new Error(`Translation not found for ${lang}/${namespace}`);
    }

    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }

  async getAllTranslations(lang: string): Promise<Record<string, any>> {
    const langPath = path.join(this.localesPath, lang);

    if (!fs.existsSync(langPath)) {
      throw new Error(`Language ${lang} not found`);
    }

    const files = fs.readdirSync(langPath);

    const result: Record<string, any> = {};

    for (const file of files) {
      if (!file.endsWith('.json')) continue;

      const namespace = path.basename(file, '.json');
      const filePath = path.join(langPath, file);

      result[namespace] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }

    return result;
  }
}