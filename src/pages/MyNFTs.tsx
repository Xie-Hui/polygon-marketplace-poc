import Image from 'next/image'

import { useEffect, useState } from 'react'

import { ethers } from 'ethers'
import axios from 'axios'
import Web3Modal from 'web3modal'
import { alchemy, utils } from '../client/alchemy'
import { getAccount, getProvider, fetchSigner } from '@wagmi/core'
import { NftSwapV4 } from '@traderxyz/nft-swap-sdk';
import { ipfsImageLoader } from '@/helpers'

export type nftObj = {
  tokenAddress: string;
  tokenId: string;
  type: string;
}

export type priceObj = {
  tokenAddress: string;
  amount: string;
  type: string;
}

export default function MyNFTs() {
  const [nfts, setNfts] = useState([])
  const [address, setAddress] = useState(null)
  const [pricesByRowId, setPricesByRowId] = useState({});

  useEffect(() => {
    loadAccountInfo()
    loadNFTs()
  }, [address])

  const buildNftOrder = async (nftObj: nftObj, priceObj: priceObj) => {
    console.log("Build and upload NFT order")
    const provider = getProvider()
    const account = getAccount()
    const signer = await fetchSigner()
    const nftSwapSdk = new NftSwapV4(provider, signer, 137); // 137 is the chainId for Polygon
    
    // Approve NFT to be transferred by the NFTSwap contract
    // Check if we need to approve the NFT for swapping
    const approvalStatusForUserA = await nftSwapSdk.loadApprovalStatus(
      nftObj,
      account.address
    );
    // If we do need to approve User A's CryptoPunk for swapping, let's do that now
    if (!approvalStatusForUserA.contractApproved) {
      const approvalTx = await nftSwapSdk.approveTokenOrNftByAsset(
        nftObj,
        account.address
      );
      const approvalTxReceipt = await approvalTx.wait();
      console.log(
        `Approved ${nftObj.tokenAddress} contract to swap with 0x v4 (txHash: ${approvalTxReceipt.transactionHash})`
      );
    }

    const order = nftSwapSdk.buildOrder(
      nftObj,
      priceObj,
      account.address
    );
  
    console.log({order})

    // sign the order
    const signedOrder = await nftSwapSdk.signOrder(order);
    console.log(signedOrder)
    const res = await nftSwapSdk.postOrder(signedOrder, 137, {"app": "hui-xie-test"});
    console.log('Order published! 🎉', res);

  }

  const loadAccountInfo = async () => {

    const address = getAccount()
    console.log(address); // prints the current connected wallet address
    setAddress(address.address)
  }

  const loadNFTs = async () => {
    if (address) {
      const nfts = await alchemy.nft.getNftsForOwner(address)
      setNfts(nfts.ownedNfts)
      console.log(nfts)
    }
  }
  const handleSellClick = async (price, nft) => {
    // Handle sell button click
    console.log(pricesByRowId)
    console.log(price)

    const nftValue: nftObj = {
      tokenAddress: nft.contract.address || "",
      tokenId: nft.tokenId,
      type: nft.tokenType,
    }
    const priceValue: priceObj = {
      tokenAddress: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", //polygon native matic address
      amount: utils.parseEther(price).toString(),
      type: "ERC20",
    }
    buildNftOrder(nftValue, priceValue)
    console.log("selling nft")
    console.log(nft)
  };

  return (
    <>
      <div className="container mx-auto">
        <table className="w-full table-fixed text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className='text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400'>
            <tr className="max-h-20">
              <th className="p-2">NFT Image</th>
              <th className="p-2">Title</th>
              <th className="p-2">Description</th>
              <th className="p-2">Price</th>
              <th className="p-2">Sell</th>
            </tr> 
          </thead>
          <tbody>
            {nfts.map((nft, id) => nft && (
              <tr key={id.toString()} className="max-h-20 h-20 bg-white whitespace-nowrap border-b dark:bg-gray-800 dark:border-gray-700">
                <td className="p-2">
                  <img src={ipfsImageLoader(nft.rawMetadata.image)} alt="NFT Image" className="w-24 h-24 object-cover"/>
                </td>
                <td className="p-2 overflow-hidden">{nft.title}</td>
                <td className="p-2 overflow-hidden">{nft.description}</td>
                <td className="p-2">
                  <input className="w-full border border-gray-400 p-1 rounded" type="number" placeholder="Enter price in Matic" min="0" step="0.0001" value={pricesByRowId?.[id]} onChange={(event) => setPricesByRowId({...pricesByRowId, [id]: event.target.value})} />
                </td>
                <td className="p-2">
                  <button onClick={event => handleSellClick(pricesByRowId?.[id], nft)} className="inline-block rounded border-2 border-grey-600 px-6 pt-2 pb-[6px] text-xs font-medium uppercase leading-normal text-white-500 hover:border-neutral-100 hover:bg-neutral-100 hover:bg-opacity-8 hover:text-neutral-800">
                    List for sell
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}