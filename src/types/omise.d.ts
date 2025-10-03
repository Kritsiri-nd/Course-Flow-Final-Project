declare module 'omise' {
  interface OmiseConfig {
    publicKey: string;
    secretKey: string;
  }

  interface OmiseCharge {
    id: string;
    amount: number;
    currency: string;
    status: string;
    paid: boolean;
    failure_message?: string;
    created_at: string;
    paid_at?: string;
    metadata?: Record<string, unknown>;
  }

  interface OmiseSource {
    id: string;
    type: string;
    scannable_code?: {
      image: {
        download_uri: string;
      };
    };
  }


  interface CreateChargeParams {
    amount: number;
    currency: string;
    card?: string;
    source?: {
      type: string;
      phone_number?: string;
      amount?: number;
      currency?: string;
    };
    return_uri?: string;
    description?: string;
    metadata?: Record<string, unknown>;
  }

  interface CreateSourceParams {
    type: string;
    amount: number;
    currency: string;
    phone_number?: string;
  }

  interface OmiseInstance {
    charges: {
      create(params: CreateChargeParams): Promise<OmiseCharge>;
      retrieve(id: string): Promise<OmiseCharge>;
    };
    sources: {
      create(params: CreateSourceParams): Promise<OmiseSource>;
    };
  }

  function Omise(config: OmiseConfig): OmiseInstance;
  export = Omise;
}
