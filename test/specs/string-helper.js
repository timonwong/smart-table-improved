let KEBAB_CASE_REGEXP = /[A-Z]/g;

export function kebabCase(name, separator = '_') {
  return name.replace(KEBAB_CASE_REGEXP, (letter, pos) => `${pos ? separator : ''}${letter.toLowerCase()}`);
}
