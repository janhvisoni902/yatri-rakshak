import { Gateway, Wallets } from 'fabric-network';
import path from 'path';

export class AuthService {
  private contract: any = null;
  private gateway: Gateway | null = null;
  private static instance: AuthService;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async initialize() {
    try {
      if (this.contract) {
        return; // Already initialized
      }

      const channelName = 'user-authentication';
      const chaincodeName = 'user-authentication';
      const walletPath = path.join(process.cwd(), 'wallet');
      const orgUserId = 'appUser';

      // Create a new file system based wallet for managing identities
      const wallet = await Wallets.newFileSystemWallet(walletPath);

      // Check to see if we've already enrolled the user
      const identity = await wallet.get(orgUserId);
      if (!identity) {
        throw new Error(`An identity for the user ${orgUserId} does not exist in the wallet`);
      }

      // Create a new gateway for connecting to our peer node
      this.gateway = new Gateway();
      
      // Load connection profile - adjust path as needed
      const ccpPath = path.resolve(__dirname, '..', '..', '..', 'network', 'network-config.yaml');
      
      await this.gateway.connect(ccpPath, {
        wallet,
        identity: orgUserId,
        discovery: { enabled: true, asLocalhost: true }
      });

      // Get the network (channel) our contract is deployed to
      const network = await this.gateway.getNetwork(channelName);

      // Get the contract from the network
      this.contract = network.getContract(chaincodeName);

      console.log('Successfully connected to Fabric network');
    } catch (error) {
      console.error(`Failed to initialize AuthService: ${error}`);
      throw error;
    }
  }

  async disconnect() {
    if (this.gateway) {
      this.gateway.disconnect();
      this.gateway = null;
      this.contract = null;
    }
  }

  async registerUser(email: string, phoneNumber: string, passwordHash: string, userType: string, kycData: string) {
    await this.ensureConnection();
    
    const result = await this.contract.submitTransaction(
      'registerUser',
      email,
      phoneNumber,
      passwordHash,
      userType,
      kycData
    );
    
    return JSON.parse(result.toString());
  }

  async authenticateUser(email: string, passwordHash: string) {
    await this.ensureConnection();
    
    const result = await this.contract.submitTransaction(
      'authenticateUser',
      email,
      passwordHash
    );
    
    return JSON.parse(result.toString());
  }

  async validateSession(sessionId: string) {
    await this.ensureConnection();
    
    const result = await this.contract.evaluateTransaction('validateSession', sessionId);
    return JSON.parse(result.toString());
  }

  async logout(sessionId: string) {
    await this.ensureConnection();
    
    const result = await this.contract.submitTransaction('logout', sessionId);
    return JSON.parse(result.toString());
  }

  async verifyEmail(userId: string, verificationCode: string) {
    await this.ensureConnection();
    
    const result = await this.contract.submitTransaction(
      'verifyEmail',
      userId,
      verificationCode
    );
    
    return JSON.parse(result.toString());
  }

  async verifyPhone(userId: string, verificationCode: string) {
    await this.ensureConnection();
    
    const result = await this.contract.submitTransaction(
      'verifyPhone',
      userId,
      verificationCode
    );
    
    return JSON.parse(result.toString());
  }

  async getUser(userId: string) {
    await this.ensureConnection();
    
    const result = await this.contract.evaluateTransaction('getUser', userId);
    return JSON.parse(result.toString());
  }

  async updateUserProfile(userId: string, profileData: string) {
    await this.ensureConnection();
    
    const result = await this.contract.submitTransaction(
      'updateUserProfile',
      userId,
      profileData
    );
    
    return JSON.parse(result.toString());
  }

  async updateKYCStatus(userId: string, kycStatus: string, verifiedBy: string, kycDocuments: string) {
    await this.ensureConnection();
    
    const result = await this.contract.submitTransaction(
      'updateKYCStatus',
      userId,
      kycStatus,
      verifiedBy,
      kycDocuments
    );
    
    return JSON.parse(result.toString());
  }

  async resetPassword(email: string, newPasswordHash: string, resetToken: string) {
    await this.ensureConnection();
    
    const result = await this.contract.submitTransaction(
      'resetPassword',
      email,
      newPasswordHash,
      resetToken
    );
    
    return JSON.parse(result.toString());
  }

  async getUsersByStatus(status: string) {
    await this.ensureConnection();
    
    const result = await this.contract.evaluateTransaction('getUsersByStatus', status);
    return JSON.parse(result.toString());
  }

  async getUserAnalytics(startDate: string, endDate: string) {
    await this.ensureConnection();
    
    const result = await this.contract.evaluateTransaction(
      'getUserAnalytics',
      startDate,
      endDate
    );
    
    return JSON.parse(result.toString());
  }

  private async ensureConnection() {
    if (!this.contract) {
      await this.initialize();
    }
  }
}

export default AuthService;