import { useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';

interface PaymentRequest {
  reference: string;
  to: string;
  tokens: Array<{
    symbol: string;
    token_amount: string;
  }>;
  description: string;
}

interface PaymentResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

export function usePayment() {
  const { sendTransaction, data: hash, isPending, error } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const sendPayment = async (request: PaymentRequest): Promise<PaymentResult> => {
    try {
      // Use ETH token from the request
      const ethToken = request.tokens.find(t => t.symbol === 'ETH');
      if (!ethToken) {
        throw new Error('ETH token not found in payment request');
      }

      sendTransaction({
        to: request.to as `0x${string}`,
        value: parseEther((parseFloat(ethToken.token_amount) / 1e18).toString()),
      });

      // Wait for the transaction to be sent
      // Note: We return immediately here, but you could wait for confirmation
      return {
        success: true,
        txHash: hash,
      };

    } catch (error) {
      console.error('Payment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed'
      };
    }
  };

  return {
    sendPayment,
    isSending: isPending,
    isConfirming,
    isConfirmed,
    txHash: hash,
  };
}