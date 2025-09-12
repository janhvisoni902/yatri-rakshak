import { Gateway, Wallets } from 'fabric-network';
import path from 'path';

export class OnboardingService {
  private contract: any = null;
  private touristIdentityContract: any = null;
  private gateway: Gateway | null = null;
  private static instance: OnboardingService;

  private constructor() {}

  public static getInstance(): OnboardingService {
    if (!OnboardingService.instance) {
      OnboardingService.instance = new OnboardingService();
    }
    return OnboardingService.instance;
  }

  async initialize() {
    try {
      if (this.contract) {
        return; // Already initialized
      }

      const channelName = 'onboarding-workflow';
      const chaincodeName = 'onboarding-workflow';
      const touristIdentityChannel = 'tourist-identity';
      const touristIdentityChaincode = 'tourist-identity';
      const walletPath = path.join(process.cwd(), 'wallet');
      const orgUserId = 'appUser';

      const wallet = await Wallets.newFileSystemWallet(walletPath);

      const identity = await wallet.get(orgUserId);
      if (!identity) {
        throw new Error(`An identity for the user ${orgUserId} does not exist in the wallet`);
      }

      this.gateway = new Gateway();
      
      const ccpPath = path.resolve(__dirname, '..', '..', '..', 'network', 'network-config.yaml');
      
      await this.gateway.connect(ccpPath, {
        wallet,
        identity: orgUserId,
        discovery: { enabled: true, asLocalhost: true }
      });

      // Get onboarding workflow contract
      const network = await this.gateway.getNetwork(channelName);
      this.contract = network.getContract(chaincodeName);

      // Get tourist identity contract
      const touristNetwork = await this.gateway.getNetwork(touristIdentityChannel);
      this.touristIdentityContract = touristNetwork.getContract(touristIdentityChaincode);

      console.log('Successfully connected to Fabric network for onboarding');
    } catch (error) {
      console.error(`Failed to initialize OnboardingService: ${error}`);
      throw error;
    }
  }

  async disconnect() {
    if (this.gateway) {
      this.gateway.disconnect();
      this.gateway = null;
      this.contract = null;
      this.touristIdentityContract = null;
    }
  }

  async startOnboarding(userId: string, workflowId: string, entryPoint: string, metadata: string) {
    await this.ensureConnection();
    
    const result = await this.contract.submitTransaction(
      'startOnboarding',
      userId,
      workflowId,
      entryPoint,
      metadata
    );
    
    return JSON.parse(result.toString());
  }

  async getOnboardingByUser(userId: string) {
    await this.ensureConnection();
    
    const result = await this.contract.evaluateTransaction(
      'getOnboardingByUser',
      userId
    );
    
    return JSON.parse(result.toString());
  }

  async completeStep(onboardingId: string, stepId: string, stepData: string, completedBy: string) {
    await this.ensureConnection();
    
    const result = await this.contract.submitTransaction(
      'completeStep',
      onboardingId,
      stepId,
      stepData,
      completedBy
    );
    
    return JSON.parse(result.toString());
  }

  async addStepNote(onboardingId: string, stepId: string, note: string, addedBy: string) {
    await this.ensureConnection();
    
    const result = await this.contract.submitTransaction(
      'addStepNote',
      onboardingId,
      stepId,
      note,
      addedBy
    );
    
    return JSON.parse(result.toString());
  }

  async addBlocker(onboardingId: string, blockerId: string, description: string, severity: string, assignedTo: string) {
    await this.ensureConnection();
    
    const result = await this.contract.submitTransaction(
      'addBlocker',
      onboardingId,
      blockerId,
      description,
      severity,
      assignedTo
    );
    
    return JSON.parse(result.toString());
  }

  async resolveBlocker(onboardingId: string, blockerId: string, resolution: string, resolvedBy: string) {
    await this.ensureConnection();
    
    const result = await this.contract.submitTransaction(
      'resolveBlocker',
      onboardingId,
      blockerId,
      resolution,
      resolvedBy
    );
    
    return JSON.parse(result.toString());
  }

  async getOnboardingsByStatus(status: string) {
    await this.ensureConnection();
    
    const result = await this.contract.evaluateTransaction(
      'getOnboardingsByStatus',
      status
    );
    
    return JSON.parse(result.toString());
  }

  async getOnboardingsByEntryPoint(entryPoint: string) {
    await this.ensureConnection();
    
    const result = await this.contract.evaluateTransaction(
      'getOnboardingsByEntryPoint',
      entryPoint
    );
    
    return JSON.parse(result.toString());
  }

  async getOnboardingAnalytics(startDate: string, endDate: string) {
    await this.ensureConnection();
    
    const result = await this.contract.evaluateTransaction(
      'getOnboardingAnalytics',
      startDate,
      endDate
    );
    
    return JSON.parse(result.toString());
  }

  async getAllWorkflows() {
    await this.ensureConnection();
    
    const result = await this.contract.evaluateTransaction('getAllWorkflows');
    return JSON.parse(result.toString());
  }

  // Tourist Identity Contract Methods
  async createTouristIdentity(touristId: string, kycData: string, itinerary: string, emergencyContacts: string, validFrom: string, validTo: string) {
    await this.ensureConnection();
    
    const result = await this.touristIdentityContract.submitTransaction(
      'createTouristIdentity',
      touristId,
      kycData,
      itinerary,
      emergencyContacts,
      validFrom,
      validTo
    );
    
    return JSON.parse(result.toString());
  }

  async getTouristIdentity(touristId: string) {
    await this.ensureConnection();
    
    const result = await this.touristIdentityContract.evaluateTransaction(
      'getTouristIdentity',
      touristId
    );
    
    return JSON.parse(result.toString());
  }

  async validateTouristIdentity(touristId: string) {
    await this.ensureConnection();
    
    const result = await this.touristIdentityContract.evaluateTransaction(
      'validateTouristIdentity',
      touristId
    );
    
    return JSON.parse(result.toString());
  }

  private async ensureConnection() {
    if (!this.contract) {
      await this.initialize();
    }
  }
}

export default OnboardingService;