// ============================================================================
// SSO Integration Configuration and Utilities
// ============================================================================

import { createClient } from '@supabase/supabase-js';

// ============================================================================
// Types
// ============================================================================

export type SSOProvider = 'azure' | 'google' | 'okta' | 'github' | 'saml';

export interface SSOConfig {
  provider: SSOProvider;
  enabled: boolean;
  clientId: string;
  clientSecret?: string; // Server-side only
  tenantId?: string; // For Azure AD
  domain?: string; // For Okta
  callbackUrl: string;
  scopes: string[];
  metadata?: {
    issuer?: string;
    authorizationEndpoint?: string;
    tokenEndpoint?: string;
    userInfoEndpoint?: string;
    jwksUri?: string;
  };
}

export interface SSOUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: SSOProvider;
  providerUserId: string;
  roles: string[];
  groups: string[];
  metadata: Record<string, unknown>;
}

export interface SSOSession {
  user: SSOUser;
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
  idToken?: string;
}

// ============================================================================
// Provider Configurations
// ============================================================================

export const SSO_PROVIDERS: Record<
  SSOProvider,
  {
    name: string;
    icon: string;
    color: string;
    defaultScopes: string[];
  }
> = {
  azure: {
    name: 'Microsoft Azure AD',
    icon: '🔷',
    color: '#0078d4',
    defaultScopes: ['openid', 'profile', 'email', 'User.Read'],
  },
  google: {
    name: 'Google Workspace',
    icon: '🔴',
    color: '#4285f4',
    defaultScopes: ['openid', 'profile', 'email'],
  },
  okta: {
    name: 'Okta',
    icon: '🔵',
    color: '#007dc1',
    defaultScopes: ['openid', 'profile', 'email', 'groups'],
  },
  github: {
    name: 'GitHub',
    icon: '⚫',
    color: '#24292f',
    defaultScopes: ['read:user', 'user:email'],
  },
  saml: {
    name: 'SAML 2.0',
    icon: '🔐',
    color: '#6b7280',
    defaultScopes: [],
  },
};

// ============================================================================
// Azure AD Configuration
// ============================================================================

export function getAzureADConfig(
  clientId: string,
  tenantId: string,
  redirectUri: string
): SSOConfig {
  return {
    provider: 'azure',
    enabled: true,
    clientId,
    tenantId,
    callbackUrl: redirectUri,
    scopes: SSO_PROVIDERS.azure.defaultScopes,
    metadata: {
      issuer: `https://login.microsoftonline.com/${tenantId}/v2.0`,
      authorizationEndpoint: `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize`,
      tokenEndpoint: `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
      userInfoEndpoint: 'https://graph.microsoft.com/v1.0/me',
      jwksUri: `https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`,
    },
  };
}

// ============================================================================
// Google Workspace Configuration
// ============================================================================

export function getGoogleConfig(
  clientId: string,
  redirectUri: string
): SSOConfig {
  return {
    provider: 'google',
    enabled: true,
    clientId,
    callbackUrl: redirectUri,
    scopes: SSO_PROVIDERS.google.defaultScopes,
    metadata: {
      issuer: 'https://accounts.google.com',
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
      userInfoEndpoint: 'https://openidconnect.googleapis.com/v1/userinfo',
      jwksUri: 'https://www.googleapis.com/oauth2/v3/certs',
    },
  };
}

// ============================================================================
// Okta Configuration
// ============================================================================

export function getOktaConfig(
  clientId: string,
  domain: string,
  redirectUri: string
): SSOConfig {
  const baseUrl = `https://${domain}`;
  return {
    provider: 'okta',
    enabled: true,
    clientId,
    domain,
    callbackUrl: redirectUri,
    scopes: SSO_PROVIDERS.okta.defaultScopes,
    metadata: {
      issuer: baseUrl,
      authorizationEndpoint: `${baseUrl}/oauth2/v1/authorize`,
      tokenEndpoint: `${baseUrl}/oauth2/v1/token`,
      userInfoEndpoint: `${baseUrl}/oauth2/v1/userinfo`,
      jwksUri: `${baseUrl}/oauth2/v1/keys`,
    },
  };
}

// ============================================================================
// GitHub Configuration
// ============================================================================

export function getGitHubConfig(
  clientId: string,
  redirectUri: string
): SSOConfig {
  return {
    provider: 'github',
    enabled: true,
    clientId,
    callbackUrl: redirectUri,
    scopes: SSO_PROVIDERS.github.defaultScopes,
    metadata: {
      authorizationEndpoint: 'https://github.com/login/oauth/authorize',
      tokenEndpoint: 'https://github.com/login/oauth/access_token',
      userInfoEndpoint: 'https://api.github.com/user',
    },
  };
}

// ============================================================================
// Authorization URL Generator
// ============================================================================

export function generateAuthorizationUrl(
  config: SSOConfig,
  state: string,
  nonce?: string
): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.callbackUrl,
    response_type: 'code',
    scope: config.scopes.join(' '),
    state,
  });

  if (nonce) {
    params.set('nonce', nonce);
  }

  // Provider-specific parameters
  if (config.provider === 'azure' && config.tenantId) {
    params.set('response_mode', 'query');
  }

  if (config.provider === 'google') {
    params.set('access_type', 'offline');
    params.set('prompt', 'consent');
  }

  const endpoint =
    config.metadata?.authorizationEndpoint ||
    getDefaultAuthEndpoint(config.provider);

  return `${endpoint}?${params.toString()}`;
}

function getDefaultAuthEndpoint(provider: SSOProvider): string {
  switch (provider) {
    case 'azure':
      return 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
    case 'google':
      return 'https://accounts.google.com/o/oauth2/v2/auth';
    case 'github':
      return 'https://github.com/login/oauth/authorize';
    default:
      throw new Error(`No default auth endpoint for provider: ${provider}`);
  }
}

// ============================================================================
// User Mapping
// ============================================================================

export function mapProviderUser(
  provider: SSOProvider,
  userData: Record<string, unknown>
): Partial<SSOUser> {
  switch (provider) {
    case 'azure':
      return {
        email: userData.mail as string || userData.userPrincipalName as string,
        name: userData.displayName as string,
        avatar: undefined, // Azure requires separate call for photo
        providerUserId: userData.id as string,
        groups: (userData.groups as string[]) || [],
      };

    case 'google':
      return {
        email: userData.email as string,
        name: userData.name as string,
        avatar: userData.picture as string,
        providerUserId: userData.sub as string,
        groups: [],
      };

    case 'okta':
      return {
        email: userData.email as string,
        name: userData.name as string,
        avatar: userData.picture as string,
        providerUserId: userData.sub as string,
        groups: (userData.groups as string[]) || [],
      };

    case 'github':
      return {
        email: userData.email as string,
        name: userData.name as string || userData.login as string,
        avatar: userData.avatar_url as string,
        providerUserId: String(userData.id),
        groups: [],
      };

    default:
      return {
        email: userData.email as string,
        name: userData.name as string,
        providerUserId: userData.sub as string || userData.id as string,
        groups: [],
      };
  }
}

// ============================================================================
// Role Mapping
// ============================================================================

export interface RoleMapping {
  providerGroup: string;
  appRole: string;
}

export function mapGroupsToRoles(
  groups: string[],
  mappings: RoleMapping[]
): string[] {
  const roles = new Set<string>();

  for (const group of groups) {
    for (const mapping of mappings) {
      if (
        group === mapping.providerGroup ||
        group.toLowerCase() === mapping.providerGroup.toLowerCase()
      ) {
        roles.add(mapping.appRole);
      }
    }
  }

  // Default role if no mappings found
  if (roles.size === 0) {
    roles.add('viewer');
  }

  return Array.from(roles);
}

// ============================================================================
// Supabase SSO Integration
// ============================================================================

export async function signInWithSSO(
  supabaseClient: ReturnType<typeof createClient>,
  provider: 'azure' | 'google' | 'github',
  options?: {
    redirectTo?: string;
    scopes?: string;
  }
) {
  const { data, error } = await supabaseClient.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: options?.redirectTo || `${window.location.origin}/auth/callback`,
      scopes: options?.scopes || SSO_PROVIDERS[provider].defaultScopes.join(' '),
    },
  });

  return { data, error };
}

export async function getSession(
  supabaseClient: ReturnType<typeof createClient>
) {
  const { data, error } = await supabaseClient.auth.getSession();
  return { session: data.session, error };
}

export async function signOut(supabaseClient: ReturnType<typeof createClient>) {
  const { error } = await supabaseClient.auth.signOut();
  return { error };
}

// ============================================================================
// Session Validation
// ============================================================================

export function isSessionValid(session: SSOSession): boolean {
  return new Date() < session.expiresAt;
}

export function shouldRefreshSession(
  session: SSOSession,
  thresholdMinutes: number = 5
): boolean {
  const threshold = new Date();
  threshold.setMinutes(threshold.getMinutes() + thresholdMinutes);
  return threshold >= session.expiresAt;
}

// ============================================================================
// PKCE Utilities (for mobile/SPA apps)
// ============================================================================

export function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(new Uint8Array(hash));
}

function base64UrlEncode(buffer: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...buffer));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function generateState(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

export function generateNonce(): string {
  return generateState();
}

// ============================================================================
// Export
// ============================================================================

export const SSOUtils = {
  generateAuthorizationUrl,
  mapProviderUser,
  mapGroupsToRoles,
  isSessionValid,
  shouldRefreshSession,
  generateCodeVerifier,
  generateCodeChallenge,
  generateState,
  generateNonce,
};

export default SSOUtils;
