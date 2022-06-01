export const validateEmail = (email: string): string | undefined => {
  var validRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  if (!email.length || !validRegex.test(email)) {
    return "Entre com email Válido";
  }
};

export const validatePassword = (password: string): string | undefined => {
  if (password.length < 5) {
    return "no mínimo 5 caracteres";
  }
};

export const validateName = (name: string): string | undefined => {
  if (!name.length) return `Entre com o Nome`;
};
