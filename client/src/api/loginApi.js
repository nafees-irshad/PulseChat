import api from "./index";
import API_ENDPOINTS from "./endpoints";

export async function login(data) {
  const response = await api.post(API_ENDPOINTS.USERS.LOGIN, data);

  return response.data;
}

export async function loginWithGoogle(accessToken) {
  const response = await api.post(API_ENDPOINTS.USERS.GOOGLE, { accessToken });

  return response.data;
}

export async function requestPasswordReset(email) {
  const response = await api.post(
    API_ENDPOINTS.USERS.FORGOT_PASSWORD,
    { email },
    { timeout: 30000 },
  );

  return response.data;
}

export async function resetPassword(data) {
  const response = await api.post(API_ENDPOINTS.USERS.RESET_PASSWORD, data);

  return response.data;
}