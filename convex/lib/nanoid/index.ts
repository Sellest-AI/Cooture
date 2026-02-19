type Options = {
  alphabet?: string;
}

export const nanoid = (length: number = 21, options?: Options): string => {
  const alphabet = options?.alphabet || '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let id = '';
  for (let i = 0; i < length; i++) {
    id += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return id;
}