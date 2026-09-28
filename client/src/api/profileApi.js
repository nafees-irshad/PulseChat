import api from "./index";
import API_ENDPOINTS from "./endpoints";

export async function getProfile() {
  const response = await api.get(API_ENDPOINTS.USERS.PROFILE);

  return response.data;
}
