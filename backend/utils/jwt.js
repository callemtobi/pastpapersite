import { SignJWT, jwtVerify } from "jose";
import argon2 from "argon2";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function generateToken({ id, role }) {
  return await new SignJWT({ id, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(secret);
}

export async function verifyToken(token) {
  const { payload } = await jwtVerify(token, secret);

  return payload;
}

// Hash password
async function hashPassword(passwordHash) {
  return argon2.hash(passwordHash);
}

export async function createPasswordResetToken(userId, currentPasswordHash) {
  const fingerprint = await hashPassword(currentPasswordHash);

  return new SignJWT({
    sub: userId.toString(),
    fingerprint,
    purpose: "password-reset",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secret);
}

// Verify the token AND check that the password hasn't changed since issuance.
// export async function verifyPasswordResetToken(token, currentPasswordHash) {
//   const payload = await verifyToken(token);

//   console.log("payload.purpose:", payload.purpose);
//   console.log("payload.sub:", payload.sub);
//   console.log("payload.fingerprint exists:", !!payload.fingerprint);
//   console.log("currentPasswordHash passed in:", currentPasswordHash);

//   if (payload.purpose !== "password-reset") {
//     throw new Error("Wrong token purpose");
//   }

//   const fingerprintValid = await argon2.verify(
//     payload.fingerprint,
//     currentPasswordHash,
//   );

//   console.log("fingerprintValid:", fingerprintValid);

//   if (!fingerprintValid) {
//     throw new Error("Token already used — password was changed");
//   }

//   return { userId: payload.sub };
// }

export async function verifyPasswordResetToken(token, currentPasswordHash) {
  const payload = await verifyToken(token);

  if (payload.purpose !== "password-reset") {
    throw new Error("Wrong token purpose");
  }

  const fingerprintValid = await argon2.verify(
    payload.fingerprint,
    currentPasswordHash,
  );

  if (!fingerprintValid) {
    throw new Error("Token already used — password was changed");
  }

  return { userId: payload.sub };
}
