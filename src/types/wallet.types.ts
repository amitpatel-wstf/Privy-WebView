export type WalletType = 'ethereum' | 'solana';

export interface WalletInfo {
  address: string;
  type: WalletType;
  name: string;
}

export interface UserProfile {
  id: string;
  email?: string;
  phone?: string;
  wallet?: {
    address: string;
    chainType: string;
  };
  createdAt?: Date;
  linkedAccounts?: Array<{
    type: string;
    address?: string;
    email?: string;
    phone?: string;
  }>;
}
