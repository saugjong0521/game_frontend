import { useState } from "react";
import { API } from "@/api"; 
import { PATH } from "@/constant"; 
import { useTokenStore } from "@/store";
import { createApiHeaders } from "@/utils";

const useSignIn = () => {
  const { setToken, clearToken } = useTokenStore();
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignIn = async () => {
    if (!formData.username.trim() || !formData.password.trim()) {
      setError("아이디와 비밀번호를 모두 입력해주세요.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { username, password } = formData;

      // x-www-form-urlencoded body 생성
      const body = new URLSearchParams();
      body.append('grant_type', '');
      body.append('username', username);
      body.append('password', password);
      body.append('scope', '');
      body.append('client_id', '');
      body.append('client_secret', '');

      // 기기 정보 및 위치 정보가 포함된 헤더 생성
      const headers = await createApiHeaders();

      const res = await API.post(PATH.SIGNIN, body.toString(), { headers });

      // 로그인 성공 시 토큰 저장
      if (res.data && res.data.access_token) {
        setToken(res.data);
        setSuccess(true);
        
        // 폼 데이터 초기화 (선택사항)
        setFormData({ username: '', password: '' });
      }

    } catch (error) {         
      console.error('Login failed:', error);
      setError(error.response?.data?.message || "로그인에 실패했습니다.");         
      clearToken();
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    clearToken();
    setSuccess(false);
    setFormData({ username: '', password: '' });
    setError(null);
  };

  return {     
    formData,
    handleChange,
    handleSignIn,
    handleSignOut,
    loading,
    error,
    success,
  }; 
};  

export { useSignIn };