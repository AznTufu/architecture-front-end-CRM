import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import {
  loginSchema,
  signUpSchema,
  type LoginValues,
  type SignUpValues,
} from '../model/schema';
import { useLoginMutation, useRegisterMutation } from '../model/useAuthMutations';

type AuthMode = 'login' | 'signup';

const loginDefaults: LoginValues = {
  email: '',
  password: '',
};

const signUpDefaults: SignUpValues = {
  email: '',
  password: '',
  fullName: '',
};

export function AuthByPasswordForm() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('login');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: loginDefaults,
  });

  const signUpForm = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: signUpDefaults,
  });

  const isPending = loginMutation.isPending || registerMutation.isPending;
  const apiError = loginMutation.error?.message ?? registerMutation.error?.message;

  const submitLogin = loginForm.handleSubmit((values) => {
    setSuccessMessage(null);
    loginMutation.mutate(values, {
      onSuccess: () => {
        navigate('/', { replace: true });
      },
    });
  });

  const submitSignUp = signUpForm.handleSubmit((values) => {
    setSuccessMessage(null);
    registerMutation.mutate(values, {
      onSuccess: () => {
        setSuccessMessage(
          'Compte cree. Verifie ton email puis connecte-toi. Si tu as ete invite, ton role sera assigne automatiquement.'
        );
        setMode('login');
        loginForm.setValue('email', values.email);
        signUpForm.reset(signUpDefaults);
      },
    });
  });

  return (
    <section className="auth-card">
      <h1>Connexion CRM</h1>
      <p className="meta">
        Connecte-toi pour acceder a ton espace. Pour les admins invites, inscris-toi
        avec l&apos;email d&apos;invitation.
      </p>
      <p className="meta">Utilise les identifiants fournis par ton organisation.</p>

      <div className="auth-mode-switch">
        <button
          type="button"
          className={mode === 'login' ? 'active' : ''}
          onClick={() => setMode('login')}
        >
          Se connecter
        </button>
        <button
          type="button"
          className={mode === 'signup' ? 'active' : ''}
          onClick={() => setMode('signup')}
        >
          Creer un compte
        </button>
      </div>

      {mode === 'login' ? (
        <form className="crm-form" onSubmit={submitLogin}>
          <label>
            Email
            <input {...loginForm.register('email')} placeholder="prenom@entreprise.com" />
            {loginForm.formState.errors.email ? (
              <span>{loginForm.formState.errors.email.message}</span>
            ) : null}
          </label>
          <label>
            Mot de passe
            <input type="password" {...loginForm.register('password')} />
            {loginForm.formState.errors.password ? (
              <span>{loginForm.formState.errors.password.message}</span>
            ) : null}
          </label>
          <button type="submit" disabled={isPending}>
            {isPending ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      ) : (
        <form className="crm-form" onSubmit={submitSignUp}>
          <label>
            Nom complet
            <input {...signUpForm.register('fullName')} placeholder="Ex: Alice Martin" />
            {signUpForm.formState.errors.fullName ? (
              <span>{signUpForm.formState.errors.fullName.message}</span>
            ) : null}
          </label>
          <label>
            Email
            <input {...signUpForm.register('email')} placeholder="prenom@entreprise.com" />
            {signUpForm.formState.errors.email ? (
              <span>{signUpForm.formState.errors.email.message}</span>
            ) : null}
          </label>
          <label>
            Mot de passe
            <input type="password" {...signUpForm.register('password')} />
            {signUpForm.formState.errors.password ? (
              <span>{signUpForm.formState.errors.password.message}</span>
            ) : null}
          </label>
          <button type="submit" disabled={isPending}>
            {isPending ? 'Creation...' : 'Creer mon compte'}
          </button>
        </form>
      )}

      {apiError ? <p className="form-feedback error">{apiError}</p> : null}
      {successMessage ? <p className="form-feedback success">{successMessage}</p> : null}
    </section>
  );
}
