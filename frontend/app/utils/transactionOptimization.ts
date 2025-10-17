import { Call } from "starknet";

/**
 * Bundles consecutive add_transaction or mine_block calls with the same chain_id
 */
export function applyBundling(calls: Call[]): Call[] {
  if (calls.length === 0) return calls;

  const result: Call[] = [];
  let i = 0;

  while (i < calls.length) {
    const call = calls[i];

    // Check if this is an add_transaction call
    if (call.entrypoint === "add_transaction") {
      const chainId = call.calldata![0];
      const txTypeIds: string[] = [call.calldata![1]];

      // Look ahead for consecutive add_transaction calls with same chain_id
      let j = i + 1;
      while (
        j < calls.length &&
        calls[j].entrypoint === "add_transaction" &&
        calls[j].calldata![0] === chainId
      ) {
        txTypeIds.push(calls[j].calldata![1]);
        j++;
      }

      // If we found multiple consecutive calls, bundle them
      if (txTypeIds.length > 1) {
        result.push({
          contractAddress: call.contractAddress,
          entrypoint: "add_transaction_bundled",
          calldata: [chainId, txTypeIds.length, ...txTypeIds],
        });
        i = j;
      } else {
        // Single call, keep as is
        result.push(call);
        i++;
      }
    }
    // Check if this is a mine_block call
    else if (call.entrypoint === "mine_block") {
      const chainId = call.calldata![0];
      let clicks = 1;

      // Look ahead for consecutive mine_block calls with same chain_id
      let j = i + 1;
      while (
        j < calls.length &&
        calls[j].entrypoint === "mine_block" &&
        calls[j].calldata![0] === chainId
      ) {
        clicks++;
        j++;
      }

      // If we found multiple consecutive calls, bundle them
      if (clicks > 1) {
        result.push({
          contractAddress: call.contractAddress,
          entrypoint: "mine_block_bundled",
          calldata: [chainId, clicks.toString()],
        });
        i = j;
      } else {
        // Single call, keep as is
        result.push(call);
        i++;
      }
    } else {
      // Not a bundleable call, keep as is
      result.push(call);
      i++;
    }
  }

  return result;
}

/**
 * Applies transaction optimizations based on enabled features
 */
export function optimizeTransactions(
  calls: Call[],
  bundlingEnabled: boolean,
): Call[] {
  let optimizedCalls = calls;

  // Apply bundling if enabled
  if (bundlingEnabled) {
    optimizedCalls = applyBundling(optimizedCalls);
  }

  return optimizedCalls;
}
