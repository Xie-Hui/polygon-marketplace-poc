import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { configureChains, createClient, WagmiConfig } from 'wagmi'
import { polygon } from 'wagmi/chains'

const chains = [polygon]
if (!process.env.WALLET_CONNECT_PROJECT_ID) {
  throw new Error("You need to provide NEXT_PUBLIC_PROJECT_ID env variable");
}
const projectId = process.env.WALLET_CONNECT_PROJECT_ID

const { provider } = configureChains(chains, [w3mProvider({ projectId })])
const wagmiClient = createClient({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, version: 1, chains }),
  provider
})
export { provider, wagmiClient, projectId }
export const ethereumClient = new EthereumClient(wagmiClient, chains)