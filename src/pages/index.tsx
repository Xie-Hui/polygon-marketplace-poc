import { useEffect, useState } from 'react'
import axios from 'axios'
import { NftSwapV4, SwappableAssetV4, SwappableNftV4 } from '@traderxyz/nft-swap-sdk';

import { PostOrderResponsePayload } from '@traderxyz/nft-swap-sdk/dist/sdk/v4/orderbook';
import { utils } from '../client/alchemy'
import { getAccount, getProvider, fetchSigner } from '@wagmi/core'

import { getHumanReadableTime, getPolygonScanLink, isOrderExpired, shortenAddress } from '@/helpers'

type Orders = PostOrderResponsePayload[]

export default function Home() {
  const [orders, setOrders] = useState<Orders>([])
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  useEffect(() => {
    loadAccountInfo()
    loadOrders()
  }, [])

  const buyNFT = async (signedOrder: any, nft: SwappableNftV4, price: SwappableAssetV4) => {
    const provider = getProvider()
    const account = getAccount()
    const signer = await fetchSigner()
    if (!signer?._isSigner) {
      throw new Error('Signer is not a signer')
    }
    console.log(provider, account, signer)
    const nftSwapSdk = new NftSwapV4(provider, signer , 137); // 137 is the chainId for Polygon
    console.log(nftSwapSdk)
    // Check if we need to approve the NFT for swapping
    console.log(
      `Checking if ${price.tokenAddress} contract is approved to swap with 0x v4...`
    )
    console.log({nft, price})
    // check if ERC20 is native token
    const isErc20NativeToken =  nftSwapSdk.isErc20NativeToken(signedOrder);
    console.log(`Is ERC20: ${price.tokenAddress} native token: ${isErc20NativeToken}`)

    // The final step is the taker (User B) submitting the order.
    // The taker approves the trade transaction and it will be submitted on the blockchain for settlement.
    // Once the transaction is confirmed, the trade will be settled and cannot be reversed.
    console.log(`Submitting order to 0x v4...`);
    console.log(signedOrder);
    const fillTx = await nftSwapSdk.fillSignedOrder(signedOrder);
    console.log(fillTx.hash)
    const fillTxReceipt = await nftSwapSdk.awaitTransactionHash(fillTx.hash);
    console.log(`🎉 🥳 Order filled. TxHash: ${fillTxReceipt.transactionHash}`);
  }

  const loadAccountInfo = async () => {
    const address = getAccount()
    console.log(address)
  }

  const handleBuyClick = async (order: PostOrderResponsePayload) => {
    console.log("Buy NFT")
    console.log(order)

    const nftValue: SwappableNftV4 = {
      tokenAddress: order.nftToken,
      tokenId: order.nftTokenId,
      amount: order.nftTokenAmount,
      type: order.nftType as "ERC721" | "ERC1155",
    }

    const priceValue: SwappableAssetV4 = {
      tokenAddress: order.erc20Token, //polygon matic address
      amount: order.erc20TokenAmount,
      type: "ERC20",
    }
    await buyNFT(order.order, nftValue, priceValue)
    console.log("Bought NFT!")
  }


  const loadOrders = async () => {
    console.log("loading nfts")
    const {data: allOrders} = await axios.get('https://api.trader.xyz/orderbook/orders', {
      params: {
        chainId: 137,
        visibility: 'public',
        status: 'open'
      }
    });
    console.log(allOrders.orders.slice(0, 10))
    if (allOrders.orders.length > 0) {
      // filter any orders that are expired
      const orders: PostOrderResponsePayload[] = allOrders.orders.filter((order: PostOrderResponsePayload) => {
        return !isOrderExpired(order.order.expiry)
      })
      // sort order by expiry time ascending
      //orders.sort((a, b) => Number(b.order.expiry) - Number(a.order.expiry));

      // only show nft orders ERC721 or ERC1155
      const nftOrders: PostOrderResponsePayload[] = orders.length > 1 
        ? orders.filter(order => order.nftType === 'ERC721' || order.nftType === 'ERC1155')
        : []
      
      setOrders(nftOrders)
      //setNfts(nftMetadataMap)
      setLoadingState('loaded') 
      //console.log(nftMetadataMap)
      console.log("-----------------")
    }
  }

  if (loadingState === 'loaded' && !orders.length) return (<h1 className="px-20 py-10 text-3xl">No NFT orders in marketplace</h1>)
  return (
    <>
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
              <th scope="col" className="px-6 py-3">Buy Now</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 && orders.map((order: PostOrderResponsePayload, i) => order && (
              <tr key={i} className="bg-white whitespace-nowrap border-b dark:bg-gray-800 dark:border-gray-700">
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
                  {"Active"}
                </td>
                <td className="px-6 py-4">
                  {order.sellOrBuyNft === 'sell' && (
                    <button onClick={() => handleBuyClick(order)} className='inline-block rounded border-2 border-grey-600 px-6 pt-2 pb-[6px] text-xs font-medium uppercase leading-normal text-white-500 hover:border-neutral-100 hover:bg-neutral-100 hover:bg-opacity-8 hover:text-neutral-800'>
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
