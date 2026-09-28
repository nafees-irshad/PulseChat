import api from "./index";
import API_ENDPOINTS from "./endpoints";

export async function login(data) {
  const response = await api.post(API_ENDPOINTS.USERS.LOGIN, data);

  return response.data;
}
