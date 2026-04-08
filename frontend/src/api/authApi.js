import api from './axiosInstance';

/** 회원가입 */
export const signup = (data) => api.post('/auth/signup', data);

/** 로그인 */
export const login = (data) => api.post('/auth/login', data);

/** 내 정보 조회 */
export const getMyInfo = () => api.get('/auth/me');

/** 내 정보 수정 */
export const updateMyInfo = (data) => api.put('/auth/me', data);

/** 이메일 중복 확인 */
export const checkEmail = (email) => api.get(`/auth/check-email?email=${email}`);

/** 닉네임 중복 확인 */
export const checkNickname = (nickname) => api.get(`/auth/check-nickname?nickname=${nickname}`);
