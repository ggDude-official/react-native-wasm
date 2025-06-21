import React from 'react';
import { RpcClientProvider } from './components/kaspa/RpcContext';
import Connection from './components/kaspa/Connection';
import { Layout, Menu } from 'antd';
import './App.css'; // Import the CSS file

const { Header, Content } = Layout;

const menuItems = [
    {
    key: 'krc20',
    className: 'krc20-menu-item', 
    label: (
      <a href="https://static.kaspaprice.site/explorer/Dashboard" target="_blank" rel="noopener noreferrer">
        KRC-20 Dashboard
      </a>
    ),
  },
  {
    key: 'github',
    label: (
      <a href="https://github.com/kaspanet/rusty-kaspa/blob/master/wasm/README.md" target="_blank" rel="noopener noreferrer">
        Kaspa GitHub
      </a>
    ),
  },
  {
    key: 'wasm-sdk',
    label: (
      <a href="https://aspectron.org/en/projects/kaspa-wasm.html" target="_blank" rel="noopener noreferrer">
        Kaspa WASM SDK
      </a>
    ),
  },

  {
    key: 'docs',
    label: (
      <a href="https://kaspa.aspectron.org/docs/" target="_blank" rel="noopener noreferrer">
        Documentation
      </a>
    ),
  },
  {
    key: 'npm',
    label: (
      <a href="https://www.npmjs.com/package/kaspa-wasm" target="_blank" rel="noopener noreferrer">
        NPM Package
      </a>
    ),
  },
];

function App() {
  return (
    <RpcClientProvider>
      <Layout>
       <Header
  style={{
    backgroundColor: '#1a5c4f',
    padding: '50px',
    
    display: 'flex',
    alignItems: 'center', 
    justifyContent: 'center',
    gap: '20px', 
  }}
>
  <a
    href="https://kaspa.org"
    target="_blank"
    rel="noopener noreferrer"
    style={{ display: 'flex', alignItems: 'center' }}
  >
    <img
      src="/kaspa.png"
      alt="Kaspa Logo"
      style={{
      width: '100px',
	height: 'auto',
        cursor: 'pointer',
      }}
    />
  </a>

  <Menu
    mode="horizontal"
    items={menuItems}
    style={{
      backgroundColor: '#1a5c4f',
      borderBottom: 'none',
      flexGrow: 1, // allow menu to take up remaining space if needed
      justifyContent: 'center',
      display: 'flex',
    }}
    theme="dark"
    selectable={false}
  />
</Header>

        <Content style={{ backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
          <Connection />
        </Content>
      </Layout>
    </RpcClientProvider>
  );
}

export default App;