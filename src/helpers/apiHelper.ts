import axios, { AxiosResponse, AxiosError } from "axios";
import ApiError from "../interface/api";
import { BASE_URL } from "../configuration/config";

export const axiosApi = axios.create({
  baseURL: BASE_URL,
});

axiosApi.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError<ApiError>) => {
    if (error.response) {
      console.error("Request failed with status:", error.response.status);
      console.error("Response data:", error.response.data);
    } else if (error.request) {
      console.error("Request was made but no response was received");
    } else {
      console.error("Error setting up the request:", error.message);
    }
    return Promise.reject(error);
  }
);

async function handleApiError(error: AxiosError<ApiError>): Promise<never> {
  if (error.response) {
    console.error("Request failed with status:", error.response.status);
    console.error("Response data:", error.response.data);
  } else if (error.request) {
    console.error("Request was made but no response was received");
  } else {
    console.error("Error setting up the request:", error.message);
  }
  throw error;
}

export async function get<T = any>(
  url: string,
  config = {}
): Promise<T> {
  try {
    const response: AxiosResponse<T> = await axiosApi.get(url, {
      ...config,
    });
    return response.data;
  } catch (error) {
    return handleApiError(error as AxiosError<ApiError>);
  }
}

export async function post<T = any>(
  url: string,
  data: any,
  config = {}
): Promise<T> {
  try {
    const response: AxiosResponse<T> = await axiosApi.post(url, data, {
      ...config,
    });
    return response.data;
  } catch (error) {
    return handleApiError(error as AxiosError<ApiError>);
  }
}

export async function put<T = any>(
  url: string,
  data: any,
  config = {}
): Promise<T> {
  try {
    const response: AxiosResponse<T> = await axiosApi.put(url, data, {
      ...config,
    });
    return response.data;
  } catch (error) {
    return handleApiError(error as AxiosError<ApiError>);
  }
}

export async function del<T = any>(
  url: string,
  config = {}
): Promise<T> {
  try {
    const response: AxiosResponse<T> = await axiosApi.delete(url, {
      ...config,
    });
    return response.data;
  } catch (error) {
    return handleApiError(error as AxiosError<ApiError>);
  }
}
