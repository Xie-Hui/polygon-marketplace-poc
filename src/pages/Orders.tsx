import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import axios from 'axios'
import { NftSwapV4 } from '@traderxyz/nft-swap-sdk';
import Web3Modal from 'web3modal'
import { alchemy, utils } from '../client/alchemy'
import { getHumanReadableTime, getPolygonScanLink, isOrderExpired, shortenAddress } from '@/helpers'

const network = "mainnet";

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    console.log("loading nfts")
    try {
      const {data: allOrders} = await axios.get('https://api.trader.xyz/orderbook/orders', {
        params: {
          chainId: 137,
          visibility: 'public',
          status: 'open'
        }
      });
      console.log(allOrders.orders)
      if (allOrders.orders.length > 0) {
        // filter any orders that are expired
        const orders = allOrders.orders.filter(order => {
          return isOrderExpired(order.order.expiry)
        })
        console.log(orders);
        // sort order by expiry time ascending
        orders.sort((a, b) => Number(b.order.expiry) - Number(a.order.expiry));
  
        // only show nft orders ERC721 or ERC1155
        const nftOrders = orders.length > 1 
          ? orders.filter(order => order.nftType === 'ERC721' || order.nftType === 'ERC1155')
          : []
        /* 
        // batch fetch nft metadata
        const nftTokens = nftOrders.map(order => ({
          contractAddress: order.nftToken,
          tokenId: order.nftTokenId,
          nftType: order.nftType
        }))

        console.log("nftTokens")
        console.log(nftTokens)
        
        const nftMetadata = await alchemy.nft.getNftMetadataBatch(nftTokens)
        const nftMetadataMap = {}
        nftMetadata.forEach(nft => {
          nftMetadataMap[`${nft.contract.address}-${nft.tokenId}`] = nft
        }) */
        
        setOrders(nftOrders)
        //setNfts(nftMetadataMap)
        setLoadingState('loaded') 
        //console.log(nftMetadataMap)
        console.log("-----------------")
      }
    } catch (error) {
      console.log(error)
    }
  }

  if (loadingState === 'loaded' && !orders.length) return (<h1 className="px-20 py-10 text-3xl">No NFT orders in marketplace</h1>)
  return (
    <>
      <div className='flex m-4 items-center justify-between'>
        <h1 className="text-3xl font-bold dark:text-gray-200" onClick={() => loadOrders()}>
          NFT Sniper 🎯
        </h1>
      </div>
      <div className='relative overflow-x-auto'>
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className='text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400'>
            <tr>
              <th scope="col" className="px-6 py-3">Action</th>
              <th scope="col" className="px-6 py-3">NFT address</th>
              <th scope="col" className="px-6 py-3">Token ID</th>
              <th scope="col" className="px-6 py-3">Type</th>
              <th scope="col" className="px-6 py-3">Price</th>
              <th scope="col" className="px-6 py-3">Expiry date</th>
              <th scope="col" className="px-6 py-3">Maker Address</th>
              <th scope="col" className="px-6 py-3">Order Status</th>
              <th scope="col" className="px-6 py-3">Tx</th>
              <th scope="col" className="px-6 py-3">Buy Now</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 && orders.map((order, i) => (
              <tr key={i} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                <td className="px-6 py-4">
                  {order.sellOrBuyNft.toUpperCase()}
                </td>
                <td className="px-6 py-4">
                  <a href={getPolygonScanLink(order.nftToken, "address")} target="_blank">
                    {shortenAddress(order.nftToken)}
                  </a>
                </td>
                <td className="px-6 py-4">
                  {shortenAddress(order.nftTokenId)}
                </td>
                <td className="px-6 py-4">
                  {order.nftType}
                </td>
                <td className="px-6 py-4">
                  {`${utils.formatEther(order.erc20TokenAmount)} MATIC`}
                </td>
                <td className="px-6 py-4">
                  {getHumanReadableTime(order.order.expiry)}
                </td>
                <td className="px-6 py-4">
                  <a href={getPolygonScanLink(order.order.maker, "address")} target="_blank">
                    {shortenAddress(order.order.maker)}
                  </a>
                </td>
                <td className="px-6 py-4">
                  {order.orderStatus.status || "Active"}
                </td>
                <td className="px-6 py-4">
                  <a href={getPolygonScanLink(order.orderStatus.transactionHash, "tx")} target="_blank">
                    {shortenAddress(order.orderStatus.transactionHash)}
                  </a>
                </td>
                <td className="px-6 py-4">
                  {order.sellOrBuyNft === 'sell' && (
                    <button className='inline-block rounded border-2 border-grey-600 px-6 pt-2 pb-[6px] text-xs font-medium uppercase leading-normal text-white-500 hover:border-neutral-100 hover:bg-neutral-100 hover:bg-opacity-8 hover:text-neutral-800'>
                      Buy Now
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
