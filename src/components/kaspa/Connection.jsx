import React, { useState, useEffect, useRef } from 'react';
import { Card, Row, Col, Typography } from 'antd';
import { FaDiceD20, FaPause, FaPlay } from 'react-icons/fa';
import moment from 'moment';
import { useRpcClient } from './RpcContext';
import { fetchBlocksAndTransactions } from './useFetchBlocks';

// Helper function to serialize BigInt values to strings
const serializeBigInt = (obj) => {
  return JSON.parse(JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
};

const { Title, Text } = Typography;

const Connection = () => {
  const { rpcClient, error } = useRpcClient();
  const [tempBlocks, setTempBlocks] = useState([]);
  const [keepUpdating, setKeepUpdating] = useState(true);
  const [newBlockHashes, setNewBlockHashes] = useState(new Set());
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const keepUpdatingRef = useRef();
  keepUpdatingRef.current = keepUpdating;

  const handleBlockClick = (blockHash) => {
    window.open(`https://explorer.kaspa.org/blocks/${blockHash}`, '_blank');
  };

  
  useEffect(() => {
    console.log(`RPC Connection Status: ${connectionStatus} at ${new Date().toLocaleString()}`);
  }, [connectionStatus]);

  // Fetch blocks periodically
  useEffect(() => {
    if (!rpcClient) {
      setConnectionStatus('Disconnected');
      return;
    }

    const fetchData = async () => {
      try {
        setConnectionStatus('Connecting');
        const blockDagInfo = await rpcClient.getBlockDagInfo();
        const virtualSelectedParentHash = blockDagInfo.virtualParentHashes[0];

        const { blocks } = await fetchBlocksAndTransactions(
          rpcClient,
          virtualSelectedParentHash
        );

        setConnectionStatus(blocks.length > 0 ? 'Connected' : 'Connected (No blocks fetched)');

        if (keepUpdatingRef.current && blocks.length > 0) {
          const serializedBlocks = blocks.map(serializeBigInt);
          const currentBlockHashes = new Set(tempBlocks.map((block) => block.blockHash));
          const newBlocksFiltered = serializedBlocks.filter((block) => !currentBlockHashes.has(block.blockHash));
          if (newBlocksFiltered.length > 0) {
            setNewBlockHashes(new Set(newBlocksFiltered.map((block) => block.blockHash)));
            setTempBlocks((prev) => {
              const updated = [...newBlocksFiltered, ...prev].slice(0, 10);
              return updated.filter(
                (block, index, self) => self.findIndex((t) => t.blockHash === block.blockHash) === index
              );
            });
          }
        }
      } catch (err) {
        console.error('Error fetching new blocks:', err);
        setConnectionStatus(`Error: ${err.message}`);
      }
    };

    fetchData(); // Initial fetch ( after connection check)
    const interval = setInterval(fetchData, 5000); // Fetch every 5 seconds ( you can change it your desire)

    return () => clearInterval(interval);
  }, [rpcClient]);

  // Sort blocks by timestamp in descending order
  const sortedBlocks = [...tempBlocks].sort((a, b) => parseInt(b.timestamp) - parseInt(a.timestamp));

  return (
    <div style={{
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f2f5',
      width: '100vw',
      boxSizing: 'border-box',
    }}>
      <h1 style={{ color: '#1a5c4f', marginBottom: '10px', textAlign: 'center' }}>Kaspa Block Explorer</h1>
      <p style={{
        color: connectionStatus.startsWith('Connected') ? '#1a5c4f' : connectionStatus.startsWith('Error') ? 'red' : '#666',
        marginBottom: '20px',
        fontWeight: 'bold',
        textAlign: 'center',
      }}>
        RPC Connection Status: {connectionStatus}
      </p>
      {error && <p style={{ color: 'red', marginBottom: '20px', textAlign: 'center' }}>{error}</p>}
      <Card
        style={{ backgroundColor: '#1a5c4f', border: 'none', borderRadius: '8px', width: '100%' }}
        bodyStyle={{ padding: '16px' }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          marginBottom: '16px',
        }}>
          <div style={{ minWidth: '40px', display: 'flex', justifyContent: 'flex-start' }}>
            {!keepUpdating ? (
              <FaPlay
                style={{ cursor: 'pointer', color: '#fff' }}
                onClick={() => setKeepUpdating(true)}
              />
            ) : (
              <FaPause
                style={{ cursor: 'pointer', color: '#fff' }}
                onClick={() => setKeepUpdating(false)}
              />
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            <Title
              level={3}
              style={{
                color: '#fff',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textTransform: 'capitalize',
              }}
            >
              <FaDiceD20
                className={keepUpdating ? 'rotate' : ''}
                size="1.7rem"
                style={{ marginRight: '8px' }}
              />
              BLOCKS
            </Title>
          </div>
          <div style={{ minWidth: '40px' }} />
        </div>
        <Row style={{ background: '#002c26', padding: '10px', color: '#fff', fontWeight: 'bold' }}>
          <Col span={14}><Text style={{ color: '#fff', display: 'block', textAlign: 'left' }}>Hash</Text></Col>
          <Col span={4}><Text style={{ color: '#fff', display: 'block', textAlign: 'center' }}>TXs</Text></Col>
          <Col span={6}><Text style={{ color: '#fff', display: 'block', textAlign: 'right' }}>Timestamp</Text></Col>
        </Row>
        {sortedBlocks.length > 0 ? (
          sortedBlocks.slice(0, 10).map((block) => {
            // Log block details with current time
            console.log(`Block Displayed: Hash=${block.blockHash}, Timestamp=${moment(parseInt(block.timestamp)).format('YYYY-MM-DD HH:mm:ss')} at ${new Date().toLocaleString()}`);
            return (
              <Row
                key={block.blockHash}
                style={{
                  padding: '10px',
                  color: '#fff',
                  borderBottom: '1px solid #49EACB33',
                  cursor: 'pointer',
                  textAlign: 'left',
                  animation: newBlockHashes.has(block.blockHash) ? 'flash 1s ease-in-out' : 'none',
                }}
                onClick={() => handleBlockClick(block.blockHash)}
              >
                <Col span={14}>
                  <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'left', fontSize: '12px' }}>
                    {block.blockHash}
                  </Text>
                </Col>
                <Col span={4}>
                  <Text style={{ color: '#fff', display: 'block', textAlign: 'center' }}>
                    {block.transactionCount}
                  </Text>
                </Col>
                <Col span={6}>
                  <Text style={{ color: '#fff', display: 'block', textAlign: 'right' }}>
                    {moment(parseInt(block.timestamp)).format('YYYY-MM-DD HH:mm:ss')}
                  </Text>
                </Col>
              </Row>
            );
          })
        ) : (
          <Row style={{ padding: '10px', color: '#fff', display: 'block', textAlign: 'center' }}>
            <Col span={24}>
              <Text style={{ color: '#fff' }}>No relevant blocks available</Text>
            </Col>
          </Row>
        )}
      </Card>
    </div>
  );
};

export default Connection;