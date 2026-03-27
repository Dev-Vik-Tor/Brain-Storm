import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  Horizon,
  Keypair,
  Networks,
  TransactionBuilder,
  BASE_FEE,
  Operation,
  SorobanRpc,
} from '@stellar/stellar-sdk';

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

@Injectable()
export class StellarService {
  private readonly logger = new Logger(StellarService.name);
  private server: Horizon.Server;
  private sorobanServer: SorobanRpc.Server;
  private network: string;
  private networkPassphrase: string;
  private contractId: string;

  constructor(
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    const isTestnet = this.configService.get<string>('stellar.network') !== 'mainnet';
    this.network = isTestnet ? 'testnet' : 'mainnet';
    this.networkPassphrase = isTestnet ? Networks.TESTNET : Networks.PUBLIC;
    
    this.server = new Horizon.Server(
      isTestnet ? 'https://horizon-testnet.stellar.org' : 'https://horizon.stellar.org',
    );
    
    const rpcUrl = this.configService.get<string>('stellar.sorobanRpcUrl');
    this.sorobanServer = new SorobanRpc.Server(rpcUrl);
    
    this.contractId = this.configService.get<string>('stellar.contractId');
  }

  async getAccountBalance(publicKey: string) {
    const cacheKey = `stellar:balance:${publicKey}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }
    const account = await this.server.loadAccount(publicKey);
    const balances = account.balances;
    await this.cacheManager.set(cacheKey, balances, 30);
    return balances;
  }

  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    attempt: number = 1,
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (attempt >= MAX_RETRIES) {
        this.logger.error(`Max retries reached: ${error.message}`);
        throw error;
      }
      const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
      this.logger.warn(`Attempt ${attempt} failed, retrying in ${delay}ms: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return this.retryWithBackoff(fn, attempt + 1);
    }
  }

  async issueCredential(recipientPublicKey: string, courseId: string): Promise<string> {
    try {
      await this.retryWithBackoff(() => this.recordProgressOnChain(recipientPublicKey, courseId));
      this.logger.log(`Progress recorded on Soroban for ${courseId}`);
    } catch (error) {
      this.logger.error(`Failed to record progress on Soroban: ${error.message}, falling back to Horizon`);
      await this.issueCredentialFallback(recipientPublicKey, courseId);
    }
    
    return this.mintCredentialViaHorizon(recipientPublicKey, courseId);
  }

  private async recordProgressOnChain(studentPublicKey: string, courseId: string): Promise<void> {
    if (!this.contractId) {
      throw new Error('SOROBAN_CONTRACT_ID not configured');
    }

    const issuerKeypair = Keypair.fromSecret(this.configService.get<string>('stellar.secretKey'));
    const studentKeypair = Keypair.fromPublicKey(studentPublicKey);
    
    const source = await this.sorobanServer.getAccount(issuerKeypair.publicKey());
    
    const tx = new SorobanRpc.TransactionBuilder(source, {
      fee: BASE_FEE.toString(),
      networkPassphrase: this.networkPassphrase,
    })
      .setTimeout(30)
      .appendOperation(
        new SorobanRpc.InvokeContractOperation({
          contract: this.contractId,
          method: 'record_progress',
          args: [
            new SorobanRpc.Address(studentKeypair.publicKey()).toScVal(),
            new SorobanRpc.Symbol(courseId).toScVal(),
            SorobanRpc.xdr.Int32.of(100).toScVal(),
          ],
        }),
      )
      .build();

    const preparedTx = await this.sorobanServer.prepareTransaction(tx);
    preparedTx.sign(issuerKeypair);
    const result = await this.sorobanServer.sendTransaction(preparedTx);
    
    if (SorobanRpc.TxFailed(result)) {
      throw new Error(`Soroban contract call failed: ${result.hash}`);
    }
    
    this.logger.log(`Soroban contract call successful: ${result.hash}`);
  }

  private async issueCredentialFallback(recipientPublicKey: string, courseId: string): Promise<string> {
    const issuerKeypair = Keypair.fromSecret(this.configService.get<string>('stellar.secretKey'));
    const issuerAccount = await this.server.loadAccount(issuerKeypair.publicKey());

    const tx = new TransactionBuilder(issuerAccount, {
      fee: BASE_FEE,
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(
        Operation.manageData({
          name: `brain-storm:credential:${courseId}`,
          value: recipientPublicKey,
        }),
      )
      .setTimeout(30)
      .build();

    tx.sign(issuerKeypair);
    const result = await this.server.submitTransaction(tx);
    this.logger.log(`Credential issued via Horizon fallback: ${result.hash}`);
    return result.hash;
  }

  private async mintCredentialViaHorizon(recipientPublicKey: string, courseId: string): Promise<string> {
    const issuerKeypair = Keypair.fromSecret(this.configService.get<string>('stellar.secretKey'));
    const issuerAccount = await this.server.loadAccount(issuerKeypair.publicKey());

    const tx = new TransactionBuilder(issuerAccount, {
      fee: BASE_FEE,
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(
        Operation.manageData({
          name: `brain-storm:mint:${courseId}`,
          value: recipientPublicKey,
        }),
      )
      .setTimeout(30)
      .build();

    tx.sign(issuerKeypair);
    const result = await this.server.submitTransaction(tx);
    this.logger.log(`Credential minted: ${result.hash}`);
    return result.hash;
  }
}
