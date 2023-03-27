import { Network, Alchemy, Utils } from "alchemy-sdk";

const settings: { apiKey: string | undefined, network: Network } = {
  apiKey: process.env.ALCHEMY_API_KEY, // Replace with your Alchemy API Key.
  network: Network.MATIC_MAINNET, // Polygon network.
};

export const alchemy = new Alchemy(settings);
export const utils = Utils;
