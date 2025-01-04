/* eslint-disable @stylistic/comma-dangle */
/* eslint-disable @stylistic/array-bracket-spacing */
import React from 'react';

import { retry } from 'lib/api/useQueryClientConfig';
import { SECOND } from 'lib/consts';
import { publicClient } from 'lib/web3/client';
import { UTXOTX } from 'stubs/tx';
import { generateListStub } from 'stubs/utils';
import type { QueryWithPagesResult } from 'ui/shared/pagination/useQueryWithPages';
import useQueryWithPages from 'ui/shared/pagination/useQueryWithPages';

import type { UTXOBlockQuery } from './useUTXOBlockQuery';
export type BlockTxsQuery = QueryWithPagesResult<'qitmeer_block_txs'> & {
  isDegradedData: boolean;
};
interface Params {
  heightOrHash: string;
  blockQuery: UTXOBlockQuery;
  tab: string;
}
export default function useUTXOBlockTxsQuery({
  heightOrHash,
  blockQuery,
  tab,
}: Params): BlockTxsQuery {
  const [isRefetchEnabled, setRefetchEnabled] = React.useState(false);
  const apiQuery = useQueryWithPages({
    resourceName: 'qitmeer_block_txs',
    pathParams: { height_or_hash: heightOrHash },
    options: {
      enabled: Boolean(
        tab === 'txs' &&
          !blockQuery.isPlaceholderData &&
          !blockQuery.isDegradedData
      ),
      placeholderData: generateListStub<'qitmeer_block_txs'>(
        UTXOTX as never,
        50,
        {
          next_page_params: {
            block_number: 9004925,
            index: 49,
            items_count: 50,
          } as never,
        }
      ) as never,
      refetchOnMount: false,
      retry: (failureCount, error) => {
        if (isRefetchEnabled) {
          return false;
        }
        return retry(failureCount, error);
      },
      refetchInterval: (): number | false => {
        return isRefetchEnabled ? 15 * SECOND : false;
      },
    },
  });
  // const rpcQuery = useQuery<
  //   RpcResponseType,
  //   unknown,
  //   BlockTransactionsResponse | null
  // >({
  //   queryKey: ['RPC', 'block_txs', { heightOrHash }],
  //   queryFn: async () => {
  //     if (!publicClient) {
  //       return null;
  //     }
  //     const blockParams = heightOrHash.startsWith('0x')
  //       ? {
  //           blockHash: heightOrHash as `0x${string}`,
  //           includeTransactions: true,
  //         }
  //       : { blockNumber: BigInt(heightOrHash), includeTransactions: true };
  //     return publicClient.getBlock(blockParams).catch(() => null);
  //   },
  //   select: (block) => {
  //     if (!block) {
  //       return null;
  //     }
  //     return {
  //       items: block.transactions
  //         .map((tx) => {
  //           if (typeof tx === 'string') {
  //             return;
  //           }
  //           return {
  //             from: { ...unknownAddress, hash: tx.from as string },
  //             to: tx.to ? { ...unknownAddress, hash: tx.to as string } : null,
  //             hash: tx.hash as string,
  //             timestamp: block?.timestamp
  //               ? dayjs.unix(Number(block.timestamp)).format()
  //               : null,
  //             confirmation_duration: null,
  //             status: undefined,
  //             block_number: Number(block.number),
  //             value: tx.value.toString(),
  //             gas_price: tx.gasPrice?.toString() ?? null,
  //             base_fee_per_gas: block?.baseFeePerGas?.toString() ?? null,
  //             max_fee_per_gas: tx.maxFeePerGas?.toString() ?? null,
  //             max_priority_fee_per_gas:
  //               tx.maxPriorityFeePerGas?.toString() ?? null,
  //             nonce: tx.nonce,
  //             position: tx.transactionIndex,
  //             type: tx.typeHex ? hexToDecimal(tx.typeHex) : null,
  //             raw_input: tx.input,
  //             gas_used: null,
  //             gas_limit: tx.gas.toString(),
  //             confirmations: 0,
  //             fee: {
  //               value: null,
  //               type: 'actual',
  //             },
  //             created_contract: null,
  //             result: '',
  //             priority_fee: null,
  //             tx_burnt_fee: null,
  //             revert_reason: null,
  //             decoded_input: null,
  //             has_error_in_internal_transactions: null,
  //             token_transfers: null,
  //             token_transfers_overflow: false,
  //             exchange_rate: null,
  //             method: null,
  //             transaction_types: [],
  //             transaction_tag: null,
  //             actions: [],
  //           };
  //         })
  //         .filter(Boolean),
  //       next_page_params: null,
  //     };
  //   },
  //   placeholderData: GET_BLOCK_WITH_TRANSACTIONS,
  //   enabled:
  //     publicClient !== undefined &&
  //     tab === 'txs' &&
  //     (blockQuery.isDegradedData ||
  //       apiQuery.isError ||
  //       apiQuery.errorUpdateCount > 0),
  //   retry: false,
  //   refetchOnMount: false,
  // });
  React.useEffect(() => {
    if (apiQuery.isPlaceholderData || !publicClient) {
      return;
    }
    if (apiQuery.isError && apiQuery.errorUpdateCount === 1) {
      setRefetchEnabled(true);
    } else if (!apiQuery.isError) {
      setRefetchEnabled(false);
    }
  }, [apiQuery.errorUpdateCount, apiQuery.isError, apiQuery.isPlaceholderData]);
  React.useEffect(() => {
    // if (!rpcQuery.isPlaceholderData && !rpcQuery.data) {
    setRefetchEnabled(false);
    // }
  }, []);
  // const isRpcQuery = Boolean(
  //   (blockQuery.isDegradedData ||
  //     ((apiQuery.isError || apiQuery.isPlaceholderData) &&
  //       apiQuery.errorUpdateCount > 0)) &&
  //     rpcQuery.data &&
  //     publicClient
  // );
  // const rpcQueryWithPages: QueryWithPagesResult<'block_txs'> = {
  //   ...(rpcQuery as UseQueryResult<BlockTransactionsResponse, ResourceError>),
  //   pagination: emptyPagination,
  //   onFilterChange: () => {},
  //   onSortingChange: () => {},
  // };
  const query = apiQuery;
  return {
    ...query,
    isDegradedData: false,
  };
}