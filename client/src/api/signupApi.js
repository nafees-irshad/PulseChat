import api from "./index";
import API_ENDPOINTS from "./endpoints";

export async function signup(data) {
    const response = await api.post(
        API_ENDPOINTS.USERS.REGISTER,
        data
    );

    return response.data;
}