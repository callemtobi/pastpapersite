import User from "../models/User.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`Email: ${email}, Password: ${password}`);
  } catch (error) {
    console.error("Error", error);
  }
};

export default { login };
