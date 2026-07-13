export const PASSWORD_RULES = {
  minLength: 8,
  maxLength: 128,
};

export const validatePassword = (password) => {
  const errors = [];

  if (!password || password.trim().length === 0) {
    errors.push("Password is required");
    return errors;
  }

  if (password.length < PASSWORD_RULES.minLength) {
    errors.push(
      `Password must be at least ${PASSWORD_RULES.minLength} characters`,
    );
  }
  if (password.length > PASSWORD_RULES.maxLength) {
    errors.push(
      `Password must not exceed ${PASSWORD_RULES.maxLength} characters`,
    );
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return errors;
};
