import api from "./index";
import API_ENDPOINTS from "./endpoints";

export async function getProfile() {
  const response = await api.get(API_ENDPOINTS.USERS.PROFILE);

  return response.data;
}

export async function changePassword(data) {
  const response = await api.patch(API_ENDPOINTS.USERS.CHANGE_PASSWORD, data);

  return response.data;
}