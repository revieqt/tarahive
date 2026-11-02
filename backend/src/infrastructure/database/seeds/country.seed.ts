
import { DataSource } from 'typeorm';

import { Country } from '../../../modules/places/country/country.entity';

interface CountrySource {
  name: {
    common: string;
    official: string;
    nativeName?: Record<
      string,
      {
        official: string;
        common: string;
      }
    >;
  };

  cca2?: string;
  cca3?: string;
  ccn3?: string;

  capital?: string[];

  currencies?: Record<
    string,
    {
      name: string;
      symbol?: string | null;
    }
  >;

  idd?: {
    root?: string;
    suffixes?: string[];
  };

  languages?: Record<string, string>;
  region?: string;
  subregion?: string;
  latlng?: [number, number];

  independent?: boolean;
  unMember?: boolean;
}

export async function seedCountries(
  dataSource: DataSource,
): Promise<void> {
  const repository = dataSource.getRepository(Country);

  const countries = (
    await import('./data/countries.json')
  ).default as unknown as CountrySource[];

  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (const item of countries) {
    if (!item.name?.common || !item.cca2) {
      skipped++;
      continue;
    }

    const latitude = item.latlng?.[0];
    const longitude = item.latlng?.[1];

    const phoneCodes = item.idd?.root
      ? (item.idd.suffixes ?? []).map(
          (suffix) => `${item.idd!.root}${suffix}`,
        )
      : [];

    const existing = await repository.findOne({
      where: { iso2: item.cca2 },
      select: { id: true },
    });

    const country = repository.create({
      ...(existing ? { id: existing.id } : {}),
      name: item.name.common,
      officialName: item.name.official,
      iso2: item.cca2,
      iso3: item.cca3 ?? null,
      numericCode: item.ccn3 ?? null,
      capital: item.capital?.[0] ?? null,
      phoneCodes,
      currencies: item.currencies
        ? Object.fromEntries(
            Object.entries(item.currencies).map(
              ([code, currency]) => [
                code,
                {
                  name: currency.name,
                  symbol: currency.symbol ?? null,
                },
              ],
            ),
          )
        : null,
      languages: item.languages ?? null,
      region: item.region ?? null,
      subregion: item.subregion ?? null,
      nativeNames: item.name.nativeName ?? null,
      latitude: latitude != null ? String(latitude) : null,
      longitude: longitude != null ? String(longitude) : null,
      isIndependent: item.independent ?? null,
      isUNMember: item.unMember ?? null,
      isActive: true,
    });

    await repository.save(country);

    if (existing) {
      updated++;
    } else {
      inserted++;
    }
  }

  console.log('Country seeding completed.');
  console.log(`Inserted: ${inserted}`);
  console.log(`Updated: ${updated}`);
  console.log(`Skipped: ${skipped}`);
}
