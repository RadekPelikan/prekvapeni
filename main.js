const DEFAULT_LOCALE = "cs";

const LOCALES = ["cs", "sk"];

const LOCALE_JSON_URL = `${window.location.pathname}res/json/locale.json`;

const NAMEDAY_API_URLs = {
  cs: "https://svatkyapi.cz/api/day",
  sk: "https://raw.githubusercontent.com/zoltancsontos/slovak-name-days-json/refs/heads/master/slovak-nameday-list-shorter.json",
};

const TODAY = new Date();

const getFetchPromise = (locale) => fetch(NAMEDAY_API_URLs[locale]);

const fetchNameDayData = async (locale) => {
  const res = await getFetchPromise(locale);
  const data = res.json();
  return data;
};

const getLocale = () =>
  // Get locale from Hash path
  (LOCALES.includes(window.location.hash.slice(1)) &&
    window.location.hash.slice(1)) ||
  // Get locale from browser language
  navigator.languages.filter((language) => LOCALES.includes(language))[0] ||
  // Get default locale
  DEFAULT_LOCALE;

let locale = getLocale();
const fetchNameDayPromise = getFetchPromise(locale);
const dataExtractors = {
  getName(data) {
    const month = TODAY.getMonth() + 1;
    const day = TODAY.getDay();
    return {
      cs: data?.name,
      sk: data?.[month]?.[day],
    }[locale];
  },
};

const getSelector = (data, itemKey) =>
  data.locales.items[locale]?.[itemKey]?.selector ||
  data.scheme[itemKey].selector;

const getValue = (data, itemKey) =>
  data.locales.items[locale]?.[itemKey]?.value ||
  data.locales.items[DEFAULT_LOCALE]?.[itemKey].value;

const replaceTemplates = (text, key, nameDayData) => {
  return (
    {
      title: text.replace("{0}", dataExtractors.getName(nameDayData)),
    }[key] || text
  );
};

const hydrateHTML = async (data, nameDayData) => {
  const keys = Object.keys(data.scheme);

  keys.forEach((key) => {
    const element = document.querySelector(getSelector(data, key));
    const value = getValue(data, key);
    element.textContent = replaceTemplates(value, key, nameDayData);
  });
};

window.onload = async () => {
  const nameDayRes = await fetchNameDayPromise;
  const nameDayData = await nameDayRes.json();

  const localeRes = await fetch(LOCALE_JSON_URL);
  const localeData = await localeRes.json();

  hydrateHTML(localeData, nameDayData);

  document.querySelector(getSelector(localeData, "langButton")).onclick =
    async () => {
      locale = LOCALES[(LOCALES.indexOf(locale) + 1) % LOCALES.length];
      window.location.href = `${window.location.pathname}#${locale}`;
      hydrateHTML(localeData, await fetchNameDayData(locale));
    };
};
