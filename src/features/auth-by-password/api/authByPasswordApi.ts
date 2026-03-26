import { signInWithPassword, signUpWithPassword } from '../../../shared/auth';
import type { LoginValues, SignUpValues } from '../model/schema';

export async function loginByPassword(values: LoginValues): Promise<void> {
  return signInWithPassword(values);
}

export async function registerByPassword(values: SignUpValues): Promise<void> {
  return signUpWithPassword({
    email: values.email,
    password: values.password,
    fullName: values.fullName,
  });
}
