import { AppDataSource } from '../../../infrastructure/database/client/postgres';
import { Country } from './country.entity';

export interface CountryPhoneCode {
  name: string;
  iso2: string | null;
  iso3: string | null;
  phoneCode: string;
}

const countryRepository = AppDataSource.getRepository(Country);

export async function getCountryPhoneCodes(): Promise<CountryPhoneCode[]> {
  const countries = await countryRepository.find({
    select: {
      name: true,
      iso2: true,
      iso3: true,
      phoneCodes: true,
    },
    where: {
      isActive: true,
    },
    order: {
      name: 'ASC',
    },
  });

  return countries.flatMap((country) =>
    (country.phoneCodes ?? []).map((phoneCode) => ({
      name: country.name,
      iso2: country.iso2,
      iso3: country.iso3,
      phoneCode,
    })),
  );
}