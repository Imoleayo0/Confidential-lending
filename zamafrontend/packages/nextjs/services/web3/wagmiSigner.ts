import type {
  EIP712TypedData,
  GenericSigner,
  Hex,
  TransactionReceipt,
  WalletAccount,
  WalletAccountListener,
  WalletAccountStore,
} from "@zama-fhe/sdk";
import { WalletNotConnectedError } from "@zama-fhe/sdk";
import type { Config } from "wagmi";
import {
  getAccount,
  getChainId,
  readContract,
  signTypedData,
  waitForTransactionReceipt,
  watchAccount,
  writeContract,
} from "wagmi/actions";

class WagmiWalletAccountStore implements WalletAccountStore {
  private config: Config;
  private listeners: Set<WalletAccountListener> = new Set();
  private current: WalletAccount | undefined;
  private ready = false;

  constructor(config: Config) {
    this.config = config;
    const account = getAccount(config);
    if (account.address && account.chainId) {
      this.current = { address: account.address, chainId: account.chainId };
      this.ready = true;
    }

    watchAccount(config, {
      onChange: account => {
        const next =
          account.address && account.chainId ? { address: account.address, chainId: account.chainId } : undefined;
        const previous = this.current;
        this.current = next;
        this.ready = true;
        this.listeners.forEach(l => l({ previous, next }));
      },
    });
  }

  getSnapshot(): WalletAccount | undefined {
    return this.current;
  }

  isReady(): boolean {
    return this.ready;
  }

  subscribe(onWalletAccountChange: WalletAccountListener): () => void {
    // Emit current state synchronously if already known (SDK requires this)
    if (this.current) {
      onWalletAccountChange({ previous: undefined, next: this.current });
    }
    this.listeners.add(onWalletAccountChange);
    return () => this.listeners.delete(onWalletAccountChange);
  }
}

export class WagmiSigner implements GenericSigner {
  readonly walletAccount: WalletAccountStore;
  private config: Config;

  constructor(signerConfig: { config: Config }) {
    this.config = signerConfig.config;
    this.walletAccount = new WagmiWalletAccountStore(signerConfig.config);
  }

  requireWalletAccount(operation: string): WalletAccount {
    const account = this.walletAccount.getSnapshot();
    if (!account) {
      throw new WalletNotConnectedError(operation);
    }
    return account;
  }

  async signTypedData(typedData: EIP712TypedData): Promise<Hex> {
    const sigTypes = { ...typedData.types };
    delete (sigTypes as Record<string, unknown>).EIP712Domain;
    return signTypedData(this.config, {
      primaryType: Object.keys(sigTypes)[0]! as any,
      types: sigTypes,
      domain: typedData.domain as any,
      message: typedData.message as any,
    });
  }

  async writeContract(config: any): Promise<Hex> {
    return writeContract(this.config, config);
  }

  async readContract(config: any): Promise<any> {
    return readContract(this.config, config);
  }

  async waitForTransactionReceipt(hash: Hex): Promise<TransactionReceipt> {
    return (await waitForTransactionReceipt(this.config, { hash })) as unknown as TransactionReceipt;
  }

  async getChainId(): Promise<number> {
    return getChainId(this.config);
  }
}
