// @ts-nocheck

/* dataLayer event push to GA. */
export function pushDataLayerEventToGa(value) {
  // PUSH TO GA.
  if (typeof dataLayer !== "undefined") {
    dataLayer.push(value);
  }
}

/* This function sets the client Ids from GA accounts
 * Based on code by David Lemus - EdPlus @ ASU
 * @asuonline account Id: UA-141599-1
 * @asu enterprise account ID: UA-42798992-4
 * Updated Nov 2022 to get clientId via _ga cookie. (ERFI-125)
 */
const getGaClientId = () => {
  const gaCookie = document.cookie
    .split("; ")
    .find(cookie => cookie.startsWith("_ga="));

  if (!gaCookie) {
    return undefined;
  }

  const gaCookieValue = gaCookie.split("=").slice(1).join("=");
  const gaCookieParts = gaCookieValue.split(".");

  if (gaCookieParts.length < 2) {
    return undefined;
  }

  return gaCookieParts.slice(-2).join(".");
};

export function setClientId(payload) {
  const output = payload;
  const gaUserId = getGaClientId();

  if (!gaUserId) {
    return output;
  }

  output.enterpriseclientid = gaUserId;
  output.ga_clientid = gaUserId;

  return output;
}
