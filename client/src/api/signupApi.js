import api from "./index";
import API_ENDPOINTS from "./endpoints";

export async function signup(data) {
    const response = await api.post(
        API_ENDPOINTS.USERS.REGISTER,
        data
    );

    return response.data;
}

export async function confirmOtp(email, otp) {
    const response = await api.post(
        API_ENDPOINTS.USERS.CONFIRM_OTP,
        { email, otp }
    );

    return response.data;
}