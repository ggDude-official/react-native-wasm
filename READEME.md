# REACT-NATIVE-WASM

A lightweight **React Native + kaspa-wasm** project that demonstrates a live blockchain connection to the Kaspa network. This app provides a modular way to build mobile dashboards, connect to Kaspa RPC, and [ explore real-time KRC-20 token data and blocks.] (https://static.kaspaprice.site/explorer/Dashboard)

## 📱 Features

- 🔗 Live connection to Kaspa network using `kaspa-wasm`
- 📦 React Context for RPC management
- 🧱 Simple layout with menu links to useful Kaspa resources
- 🧑‍💻 Easily extendable for dashboards, token explorers, and visualizers

---

## 🚀 Quick Start

```bash
# Clone the repo
git clone https://github.com/ggDude-official/REACT-NATIVE-WASM.git

# Install dependencies
cd REACT-NATIVE-WASM
npm install

# Start the development server
npm start

# Dependencies
npm install antd moment react-icons react-router-dom

# 🔗 Useful Links
-------------------------------------------------------------------------------------- |
| 🌐 Kaspa Official   | [kaspa.org](https://kaspa.org)                                                         |
| 📊 KRC-20 Dashboard | [KRC-20 Explorer](https://static.kaspaprice.site/explorer/Dashboard)                   |
| 🧠 Kaspa GitHub     | [Rusty Kaspa WASM](https://github.com/kaspanet/rusty-kaspa/blob/master/wasm/README.md) |
| ⚙️ WASM SDK         | [Kaspa WASM SDK (Aspectron)](https://aspectron.org/en/projects/kaspa-wasm.html)        |
| 📚 Documentation    | [Aspectron Docs](https://kaspa.aspectron.org/docs/)                                    |
| 📦 NPM Package      | [kaspa-wasm on NPM](https://www.npmjs.com/package/kaspa-wasm)                          |


# 🧩 Project Structure (Core)

KaspaMobileConnect/
├── components/
│   └── kaspa/
│       ├── RpcContext.jsx      # Manages RPC client context
│       └── Connection.jsx      # Main UI showing Kaspa RPC data
├── App.js                      # Main app layout with Ant Design
├── App.css                     # Styling
└── public/
    └── kaspa.png               # Kaspa logo