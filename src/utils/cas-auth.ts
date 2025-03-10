import { signOut } from "next-auth/react";

/**
 * Redirects to CAS login page
 * @param callbackUrl The URL to redirect to after successful authentication
 */
export function redirectToCASLogin(callbackUrl: string = window.location.href) {
  // Create service URL (URL to return to after CAS login)
  const serviceUrl = new URL(
    "auth/signin",
    process.env.NEXT_PUBLIC_URL ?? window.location.origin,
  ).toString();

  sessionStorage.setItem("callbackUrl", callbackUrl);

  const casLoginUrl = `https://cas.sfu.ca/cas/login?service=${encodeURIComponent(serviceUrl)}`;

  window.location.href = casLoginUrl;
}

/**
 * Logs out from both NextAuth and CAS, nextAuth first
 */
export async function casLogout() {
  await signOut({ redirect: false });

  window.location.href = "https://cas.sfu.ca/cas/logout";
}
