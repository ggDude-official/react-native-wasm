//src/components/explorer/useFetchBlocks.jsx
export const fetchBlocksAndTransactions = async (
  rpcClient,
  virtualSelectedParentHash,
  detectBotActivity = () => {}
) => {
  if (!rpcClient) return { blocks: [], transactions: [] };

  const maxRetries = 8;
  let attempts = 0;
  let allFetchedBlocks = [];
  let allTransactions = [];

  while (attempts < maxRetries) {
    try {
      const rawBlocks = await rpcClient.getBlocks({
        lowHash: virtualSelectedParentHash,
        includeBlocks: true,
        includeTransactions: true,
        limit: 10,
      });
    //  console.log('Raw Blocks:', rawBlocks);

      function replacer(key, value) {
        if (typeof value === 'bigint') {
          return value.toString();
        }
        return value;
      }

      allFetchedBlocks = allFetchedBlocks.concat(
        rawBlocks.blocks.map((block) => {
          // console.log('Processing Block:', JSON.stringify(block, replacer, 2));
          return {
            blockHash: block.header.hash,
            transactionCount: block.transactions.length,
            timestamp: block.header.timestamp,
            version: block.header.version,
            hashMerkleRoot: block.header.hashMerkleRoot,
            acceptedIdMerkleRoot: block.header.acceptedIdMerkleRoot,
            utxoCommitment: block.header.utxoCommitment,
            daaScore: block.header.daaScore,
            blueWork: block.header.blueWork,
            pruningPoint: block.header.pruningPoint,
            parents: block.verboseData.mergeSetBluesHashes,
            child: block.verboseData.childrenHashes,
            blueScore: block.header.blueScore,
            difficulty: block.verboseData.difficulty,
            bits: block.header.bits,
            nonce: block.header.nonce,
            isChainBlock: block.verboseData.isChainBlock,
            transactions: block.transactions.map((tx) => ({
              txId: tx.verboseData.transactionId,
              inputs: tx.inputs,
              outputs: tx.outputs,
            })),
          };
        })
      );

      if (rawBlocks.blocks.length > 0) {
        virtualSelectedParentHash = rawBlocks.blocks[rawBlocks.blocks.length - 1].header.hash;

        rawBlocks.blocks.forEach((block) => {
          block.transactions.forEach((tx) => {
            const scriptData = tx.inputs?.[0]?.signatureScript || '';
            const address = tx.outputs?.[0]?.verboseData?.scriptPublicKeyAddress;
            const txId = tx.verboseData.transactionId;
        //    console.log(`Tx ${txId}: address=${address}, script=${scriptData}`);
            if (
              tx.inputs?.length === 1 &&
              scriptData.includes('6b6173706c6578')
            ) {
              const tokenMatch = scriptData.match(/(?:tick|token):([a-zA-Z0-9]+)[,;]amt:([0-9]+)(?:,op:([a-zA-Z]+))?/i) ||
                                scriptData.match(/op:mint[,;]tick:([a-zA-Z0-9]+)[,;]amt:([0-9]+)/i) ||
                                scriptData.match(/krc20:mint:([a-zA-Z0-9]+):([0-9]+)/i);
              if (address && tokenMatch) {
                const tokenData = {
                  tokenId: tokenMatch[1],
                  amount: parseInt(tokenMatch[2], 10),
                  op: tokenMatch[3] || (scriptData.includes('mint') ? 'mint' : 'transfer'),
                };
                // Track mint counts
                if (tokenData.op === 'mint') {
                  addressMintCounts[address] = (addressMintCounts[address] || 0) + 1;
                  if (addressMintCounts[address] > 1) {
                   // console.log(`Suspicious: ${address} has ${addressMintCounts[address]} mints`);
                  }
                }
                detectBotActivity(address, {
                  txId,
                  tokenData,
                  timestamp: block.header.timestamp,
                });
                //console.log(`Called detectBotActivity for address ${address} with tx ${txId}`);
              } else {
               // console.warn(`No address or token data for tx ${txId}: address=${address}, script=${scriptData}`);
              }
            }
          });
        });
      } else {
        break;
      }

      allTransactions = allTransactions.concat(
        rawBlocks.blocks.flatMap((block) =>
          block.transactions.map((tx) => ({
            txId: tx.verboseData.transactionId,
            inputs: tx.inputs,
            outputs: tx.outputs,
          }))
        )
      );

      if (allFetchedBlocks.length) {
        break;
      }
    } catch (err) {
      attempts += 1;
      console.error('Error fetching data:', err);
      if (attempts >= maxRetries) {
        throw new Error('Failed to fetch data after multiple attempts.');
      }
      await new Promise((res) => setTimeout(res, 2000));
    }
  }

  const latestBlocks = allFetchedBlocks.filter(
    (block, index, self) =>
      index === self.findIndex((t) => t.blockHash === block.blockHash)
  );

  const uniqueTransactions = allTransactions.filter(
    (tx, index, self) =>
      index === self.findIndex((t) => t.txId === tx.txId)
  );

  //console.log('Returning Blocks:', latestBlocks);
  //console.log('Returning Transactions:', uniqueTransactions);

  return {
    blocks: latestBlocks,
    transactions: uniqueTransactions.slice(0, 10),
  };
};