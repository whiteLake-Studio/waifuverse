import { createPublicClient, http, defineChain, type PublicClient, type Hash } from 'viem';

export const farcasterChain = defineChain({
  id: 1,
  name: 'Farcaster',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://mainnet.infura.io/v3/your-project-id'],
      webSocket: ['wss://mainnet.infura.io/ws/v3/your-project-id'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Etherscan',
      url: 'https://etherscan.io',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 14353601,
    },
  },
});

export function getFarcasterChainConfig() {
  return farcasterChain;
}

export function createFarcasterClient(): PublicClient {
  const chain = getFarcasterChainConfig();
  
  return createPublicClient({
    chain,
    transport: http(),
  });
}

export interface TransactionVerificationResult {
  exists: boolean;
  isValid: boolean;
  error?: string;
  transaction?: {
    hash: string;
    from: string;
    to: string;
    value: string;
    blockNumber: string;
    blockHash: string;
    transactionIndex: number;
    gas: string;
    gasPrice: string;
    status: string;
    timestamp: number;
  };
}

export async function verifyTransactionOnBlockchain(
  txHash: Hash
): Promise<TransactionVerificationResult> {
  try {
    const client = createFarcasterClient();
    
    const transaction = await client.getTransaction({ hash: txHash });
    
    if (!transaction) {
      return {
        exists: false,
        isValid: false,
        error: 'Transaction not found on blockchain',
      };
    }

    const receipt = await client.getTransactionReceipt({ hash: txHash });
    const block = await client.getBlock({ blockNumber: receipt.blockNumber });
    
    return {
      exists: true,
      isValid: receipt.status === 'success',
      transaction: {
        hash: transaction.hash,
        from: transaction.from,
        to: transaction.to || '0x0000000000000000000000000000000000000000',
        value: transaction.value.toString(),
        blockNumber: receipt.blockNumber.toString(),
        blockHash: receipt.blockHash,
        transactionIndex: receipt.transactionIndex,
        gas: transaction.gas.toString(),
        gasPrice: (transaction.gasPrice || BigInt(0)).toString(),
        status: receipt.status,
        timestamp: Number(block.timestamp),
      },
    };
  } catch (error) {
    console.error('Blockchain verification error:', error);
    
    return {
      exists: false,
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown blockchain error',
    };
  }
}

export async function getChainInfo() {
  try {
    const client = createFarcasterClient();
    const chainId = await client.getChainId();
    const blockNumber = await client.getBlockNumber();
    
    return {
      chainId,
      currentBlock: blockNumber,
      chain: getFarcasterChainConfig(),
    };
  } catch (error) {
    console.error('Error getting chain info:', error);
    throw new Error('Failed to get blockchain information');
  }
}