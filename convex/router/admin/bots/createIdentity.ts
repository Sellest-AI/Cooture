import { de, en, es, Faker, fr, it, ja, ko, nb_NO, pt_BR, ru, tr, uk, zh_CN } from "@faker-js/faker";
import unidecode from 'unidecode';
import { adminMutation } from "../../../procedures";

export const admin = adminMutation({
  handler: async () => {
    const mainLocales = [
      en, pt_BR, fr, es, it, de, uk, nb_NO, tr, ru, ja, ko, zh_CN
    ];

    // Use Math.random() for truly random locale selection
    const locale = mainLocales[Math.floor(Math.random() * mainLocales.length)];

    const faker = new Faker({ locale: [locale, en] });

    const sex = faker.helpers.weightedArrayElement([
      { weight: 2, value: 'male' },
      { weight: 3, value: 'female' }
    ])

    const size = faker.helpers.weightedArrayElement([
      { value: "lean", weight: 3 },
      { value: "average", weight: 5 },
      { value: "athletic", weight: 3 },
      { value: "muscular", weight: 1 },
      { value: "heavy", weight: 1 },
      { value: "heavyset", weight: 1 },
    ]);

    const skinTone = faker.helpers.weightedArrayElement([
      { value: "light", weight: 7 },
      { value: "medium", weight: 2 },
      { value: "dark", weight: 1 },
    ]);

    const heightCm =
      sex === 'female' ? faker.number.int({ min: 155, max: 180 }) :
        faker.number.int({ min: 165, max: 195 });

    const firstName = unidecode(faker.person.firstName(sex));
    const lastName = unidecode(faker.person.lastName(sex));
    const email = faker.internet.email({ firstName, lastName });
    const username = faker.internet.username({ firstName, lastName }).toLowerCase();
    const displayName = faker.internet.displayName({ firstName, lastName });
    const age = faker.number.int({ min: 18, max: 26 });

    // Extract numbers from the username to append to it, to increase variability and reduce collisions
    const usernameNumbers = username.replace(/\D/g, '').slice(0, 4);
    const finalUsername = username.slice(0, 13) + usernameNumbers;

    const finalDisplayName = displayName.replaceAll('_', ' ')
      // Replace all non-alphanumeric characters with spaces, to increase variability and reduce collisions
      .replace(/[^a-zA-Z ]/g, ' ');
    const capitalizedDisplayName = finalDisplayName.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ').trim();

    const capitalizedFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
    const capitalizedLastName = lastName.charAt(0).toUpperCase() + lastName.slice(1);

    return {
      sex,
      age,
      size,
      skinTone,
      username: finalUsername,
      displayName: capitalizedDisplayName,
      name: `${capitalizedFirstName} ${capitalizedLastName}`,
      heightCm,
      firstName: capitalizedFirstName,
      lastName: capitalizedLastName,
      email,
    }
  }
})