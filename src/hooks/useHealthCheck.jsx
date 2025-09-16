import { useMutation } from '@tanstack/react-query';
import { kstadiumAPI } from '../api/api';
import { PATH } from '../constant/path';
import { useAccessTokenStore } from '../store/useAccessTokenStore';

const fetchHealthCheck = (accessKey) => async () => {
  const response = await kstadiumAPI.post(PATH.HEALTHCHECK, { accessKey });
  return response.data;
};

function useHealthCheck() {
  const { getAccessToken } = useAccessTokenStore();
  const { ...rest } = useMutation(fetchHealthCheck(getAccessToken));

  return { ...rest };
}

export { useHealthCheck };