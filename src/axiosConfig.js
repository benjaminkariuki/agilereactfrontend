import axios from 'axios';

const setupAxiosInterceptors = (onUnauthenticated) => {
    axios.interceptors.response.use(
        response => {
            return response;
        },
        error => {
            if (error.response && error.response.status === 401) {
                onUnauthenticated();
            }
            return Promise.reject(error);
        }
    );
};

export default setupAxiosInterceptors;