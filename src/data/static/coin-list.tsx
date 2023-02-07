import { Bitcoin } from '@/components/icons/bitcoin';
import { Ethereum } from '@/components/icons/ethereum';
import { Tether } from '@/components/icons/tether';
import { Bnb } from '@/components/icons/bnb';
import { Usdc } from '@/components/icons/usdc';
import { Cardano } from '@/components/icons/cardano';
import { Doge } from '@/components/icons/doge';

export const coinList = [
  {
    icon: <Bitcoin />,
    code: 'BTC',
    name: 'Bitcoin',
    price: 19076.29,
  },
  {
    icon: <Ethereum />,
    code: 'ETH',
    name: 'Ethereum',
    price: 1053.28,
  },
  {
    icon: <Tether />,
    code: 'USDT',
    name: 'Tether USD',
    price: 0.999,
  },
  {
    icon: <Bnb />,
    code: 'BNB',
    name: 'Binance Coin',
    price: 214.96,
  },
  {
    icon: <Usdc />,
    code: 'USDC',
    name: 'USD Coin',
    price: 1.001,
  },
  {
    icon: <Cardano />,
    code: 'ADA',
    name: 'Cardano',
    price: 0.448,
  },
  {
    icon: <Doge />,
    code: 'DOGE',
    name: 'Doge Coin',
    price: 0.065,
  },
];

export const coinListBig = [
  {
    icon: <Bitcoin className="h-10 w-10" />,
    code: 'BTC',
    name: 'Bitcoin',
  },
  {
    icon: <Ethereum className="h-10 w-10" />,
    code: 'ETH',
    name: 'Ethereum',
  },
  {
    icon: <Tether className="h-10 w-10" />,
    code: 'USDT',
    name: 'Tether USD',
  },
  {
    icon: <Bnb className="h-10 w-10" />,
    code: 'BNB',
    name: 'Binance Coin',
  },
  {
    icon: <Usdc className="h-10 w-10" />,
    code: 'USDC',
    name: 'USD Coin',
  },
  {
    icon: <Cardano className="h-10 w-10" />,
    code: 'ADA',
    name: 'Cardano',
  },
  {
    icon: <Doge className="h-10 w-10" />,
    code: 'DOGE',
    name: 'Doge Coin',
  },
];
