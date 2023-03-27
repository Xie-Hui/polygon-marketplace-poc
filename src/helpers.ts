import moment from 'moment';

export const getHumanReadableTime = (timestamp: string) => {
  const momentObj = moment.unix(Number(timestamp));
  const duration = moment.duration(momentObj.diff(moment()));
  return duration.humanize(true);
}

export const isOrderExpired = (timestamp: string) => {
  return moment.unix(Number(timestamp)).isBefore(moment());
}

export const shortenAddress = (address: string) => {
  if (!address) return '';
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export const getPolygonScanLink = (address: string, type: string) => {
  return `https://polygonscan.com/${type}/${address}`;
}

export const ipfsImageLoader = (src: string) => {
  if (!src || "ipfs"!==src.slice(0,4)) return src;
  return `https://ipfs.io/ipfs/${src.slice(7)}`;
}

