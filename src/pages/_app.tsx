import { ethereumClient, projectId, wagmiClient } from '@/client/ethereum';
import Layout from '@/components/Layout'
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { useEffect, useState } from "react";
import { WagmiConfig } from 'wagmi'
import { Web3Modal } from '@web3modal/react'

export default function App({ Component, pageProps }: AppProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  return (
    <>
    {ready ? (
      <WagmiConfig client={wagmiClient}>
        <Layout>
          <Component {...pageProps}/>
        </Layout>
      </WagmiConfig>
    ) : null}

    <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
    </>
    
)}
