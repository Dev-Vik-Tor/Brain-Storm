import { Injectable, Logger } from '@nestjs/common';
import { Horizon, Keypair, Networks, TransactionBuilder, BASE_FEE, Operation, Asset } from '@stellar/stellar-sdk';

@Injectable()
export class StellarService {
  private readonly logger = new Logger(StellarService.name);
  private server: Horizon.Server;
  private network: string;

  constructor() {
    const isTestnet = process.env.STELLAR_NETWORK !== 'mainnet';
    this.server = new Horizon.Server(
      isTestnet ? 'https://horizon-testnet.stellar.org' : 'https://horizon.stellar.org',
    );
    this.network = isTestnet ? Networks.TESTNET : Networks.PUBLIC;
  }

  async getAccountBalance(publicKey: string) {
    const account = await this.server.loadAccount(publicKey);
    return account.balances;
  }

  async issueCredential(recipientPublicKey: string, courseId: string): Promise<string> {
    const issuerKeypair = Keypair.fromSecret(process.env.STELLAR_SECRET_KEY!);
    const issuerAccount = await this.server.loadAccount(issuerKeypair.publicKey());

    const tx = new TransactionBuilder(issuerAccount, {
      fee: BASE_FEE,
      networkPassphrase: this.network,
    })
      .addOperation(
        Operation.manageData({
          name: `bluecollar:credential:${courseId}`,
          value: recipientPublicKey,
        }),
      )
      .setTimeout(30)
      .build();

    tx.sign(issuerKeypair);
    const result = await this.server.submitTransaction(tx);
    this.logger.log(`Credential issued: ${result.hash}`);
    return result.hash;
  }
}
