import { useMutation } from '@tanstack/react-query';
import { loginByPassword, registerByPassword } from '../api/authByPasswordApi';

export function useLoginMutation() {
  return useMutation({
    mutationFn: loginByPassword,
  });
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: registerByPassword,
  });
}
