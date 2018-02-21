export function getTitleField(preference) {
  switch (preference) {
    case 'english':
      return 'en';
    case 'romanized':
      return 'en_jp';
    default:
      return 'canonical';
  }
}

export function getComputedTitle(user, defaultTitle, titles) {
  if (!user) { return defaultTitle; }
  const preference = (user.titleLanguagePreference || '').toLowerCase();
  const key = getTitleField(preference);
  return key ? (titles[key] || defaultTitle) : defaultTitle;
}

export default {
  getTitleField,
  getComputedTitle
};
