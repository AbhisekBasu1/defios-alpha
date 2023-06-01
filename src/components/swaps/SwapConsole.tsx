import { useState, useEffect } from 'react';
import type { NextPageWithLayout } from '@/types';
import cn from 'classnames';
import Button from '@/components/ui/button';
import CoinInput from '@/components/ui/coin-input';
import TransactionInfo from '@/components/ui/transaction-info';
import { SwapIcon } from '@/components/icons/swap-icon';
import Trade from '@/components/ui/trade';

import RightSideInfo from '@/components/swaps/right-side-info';
import Spinner from '@/components/custom/spinner';

import { onLoading, onFailure, onSuccess } from '@/store/callLoaderSlice';
import { useAppSelector, useAppDispatch } from '@/store/store';
import axios from 'axios';

import {
  calculateBuyAmount,
  calculateSellAmount,
  getAmtOfBuy,
  getAmtOfSell,
  getSupplyModified,
  swapTransaction,
} from '@/lib/helpers/contractInteract';
import { PublicKey } from '@solana/web3.js';
import { BN } from '@project-serum/anchor';
import { useWallet } from '@solana/wallet-adapter-react';

interface SwapConsoleProps {
  setConsoleType: React.Dispatch<React.SetStateAction<'swap' | 'buy'>>;
}

const SwapConsole: React.FC<SwapConsoleProps> = ({ setConsoleType }) => {
  const dispatch = useAppDispatch();
  const stateLoading = useAppSelector((state) => state.callLoader.callState);
  const wallet = useWallet();

  const [toggleCoin, setToggleCoin] = useState(false);
  const [coinList, setCoinList] = useState<any>([]);
  const [fromCoin, setFromCoin] = useState<any>(null);
  const [toCoin, setToCoin] = useState<any>(null);

  const [sellSupply, setSellSupply] = useState<BN>(new BN(0));
  const [buySupply, setBuySupply] = useState<BN>(new BN(0));

  const [sellAmt, setSellAmt] = useState<string>('0');
  const [buyAmt, setBuyAmt] = useState<string>('0');

  const [buyAmtBN, setBuyAmtBN] = useState<BN>(new BN(0));
  const [sellAmtBN, setSellAmtBN] = useState<BN>(new BN(0));

  const handleFromChange = (e: any) => {
    const sellAmount = e.target.value.toString();
    const value = calculateSellAmount(sellSupply, new BN(sellAmount));
    const buyAmount = getAmtOfBuy(buySupply, value);

    setSellAmt(e.target.value);
    setSellAmtBN(new BN(sellAmount).mul(new BN(10).pow(new BN(9))));
    setBuyAmtBN(buyAmount.mul(new BN(10).pow(new BN(9))));
    setBuyAmt(parseInt(buyAmount.toString()).toString());
  };

  const handleToChange = (e: any) => {
    const buyAmount = e.target.value.toString();
    const value = calculateBuyAmount(buySupply, new BN(buyAmount));
    const sellAmount = getAmtOfSell(sellSupply, value);

    setBuyAmt(e.target.value);
    setBuyAmtBN(new BN(buyAmount).mul(new BN(10).pow(new BN(9))));
    setSellAmtBN(sellAmount.mul(new BN(10).pow(new BN(9))));
    setSellAmt(parseInt(sellAmount.toString()).toString());
  };

  const auth_cred = useAppSelector(
    (state) => state.firebaseTokens.firebaseTokens.auth_creds
  );

  useEffect(() => {
    if (fromCoin === null) return;
    if (
      fromCoin.token_spl_addr === undefined ||
      fromCoin.token_spl_addr === null
    )
      return;
    getSupplyModified(fromCoin.token_spl_addr)
      .then((res) => {
        setSellSupply(res.div(new BN(10).pow(new BN(9))));
        setSellAmt('0');
        setBuyAmt('0');
        setSellAmtBN(new BN(0));
        setBuyAmtBN(new BN(0));
      })
      .catch((err) => console.log(err));
  }, [fromCoin]);

  useEffect(() => {
    if (toCoin === null) return;
    if (toCoin.token_spl_addr === undefined || toCoin.token_spl_addr === null)
      return;
    getSupplyModified(toCoin.token_spl_addr)
      .then((res) => {
        setBuySupply(res.div(new BN(10).pow(new BN(9))));
        setSellAmt('0');
        setBuyAmt('0');
        setSellAmtBN(new BN(0));
        setBuyAmtBN(new BN(0));
      })
      .catch((err) => console.log(err));
  }, [toCoin]);

  useEffect(() => {
    if (auth_cred === null) return;
    axios
      .get('https://api-v1.defi-os.com/swap/list', {
        headers: {
          Authorization: auth_cred,
        },
      })
      .then((res) => {
        setCoinList(res.data);
      })
      .catch((err) => console.log(err.message));
  }, [auth_cred]);

  const handleSwapTransaction = () => {
    if (buyAmtBN.eq(new BN(0)) || sellAmtBN.eq(new BN(0))) return;
    let resCalled = false;
    dispatch(
      onLoading(
        `Swapping ${sellAmt} ${fromCoin.token_symbol} --> ${buyAmt} ${toCoin.token_symbol} ...`
      )
    );
    swapTransaction(
      new PublicKey(fromCoin.repository),
      new PublicKey(toCoin.repository),
      sellAmtBN,
      buyAmtBN
    )
      .then((res) => {
        resCalled = true;
        dispatch(
          onSuccess({
            label: `Swapping ${sellAmt} ${fromCoin.token_symbol} --> ${buyAmt} ${toCoin.token_symbol} Successful`,
            description: 'check out the tx at',
            buttonText: 'Continue',
            redirect: null,
            link: res
              ? `https://solscan.io/account/${res.toString()}?cluster=devnet`
              : '',
          })
        );
      })
      .catch((err) => {
        resCalled = true;
        dispatch(
          onFailure({
            label: `Swapping ${sellAmt} ${fromCoin.token_symbol} --> ${buyAmt} ${toCoin.token_symbol} Failed`,
            description: err.message,
            redirect: null,
            buttonText: 'Continue',
            link: '',
          })
        );
      })
      .finally(() => {
        if (!resCalled) {
          dispatch(
            onSuccess({
              label: `Swapping ${sellAmt} ${fromCoin.token_symbol} --> ${buyAmt} ${toCoin.token_symbol} Successful`,
              description: '',
              buttonText: 'Continue',
              redirect: null,
              link: '',
            })
          );
        }
      });
  };

  return (
    <div className="flex h-full w-full items-center justify-between">
      <Trade>
        <div className="mb-3 w-[18.7rem] border-b border-dashed border-gray-800 pb-2 xl:mb-5 xl:w-[20.2rem] xl:pb-4 2xl:w-[22.7rem] 3xl:mb-7 3xl:w-[24.2rem] 3xl:pb-6">
          <div className="mb-5 flex items-center gap-5">
            <Button color="info" shape="rounded" size="mini">
              Swap
            </Button>
            <Button
              onClick={() => setConsoleType('buy')}
              shape="rounded"
              size="mini"
            >
              Buy
            </Button>
          </div>
          {coinList.length !== 0 ? (
            <div
              className={cn(
                'relative flex gap-3',
                toggleCoin ? 'flex-col-reverse' : 'flex-col'
              )}
            >
              <CoinInput
                label={'From'}
                exchangeRate={0.0}
                value={sellAmt}
                type="number"
                handleOnChange={handleFromChange}
                defaultCoinIndex={0}
                getCoinValue={(data) => console.log('Coin Changed')}
                coinList={coinList}
                selectedCoin={fromCoin}
                setSelectedCoin={setFromCoin}
              />
              <div className="absolute top-1/2 left-1/2 z-[1] -mt-4 -ml-4 rounded-full bg-gray-600 shadow-large">
                <Button
                  size="mini"
                  color="gray"
                  shape="circle"
                  variant="transparent"
                  onClick={() => setToggleCoin(!toggleCoin)}
                >
                  <SwapIcon className="h-auto w-3" />
                </Button>
              </div>
              <CoinInput
                label={'To'}
                exchangeRate={0.0}
                value={buyAmt}
                type="number"
                handleOnChange={handleToChange}
                defaultCoinIndex={1}
                getCoinValue={(data) => console.log('Coin Changed')}
                coinList={coinList}
                selectedCoin={toCoin}
                setSelectedCoin={setToCoin}
              />
            </div>
          ) : (
            <Spinner />
          )}
        </div>
        <div className="flex flex-col gap-3 xl:gap-3.5 3xl:gap-4">
          <TransactionInfo label={'Min. Received'} />
          <TransactionInfo label={'Rate'} />
          <TransactionInfo label={'Offered by'} />
          <TransactionInfo label={'Price Slippage'} value={'1%'} />
          <TransactionInfo label={'Network Fee'} />
          <TransactionInfo label={'DefiOS Fee'} />
        </div>
        <Button
          size="large"
          shape="rounded"
          fullWidth={true}
          className="mt-4 uppercase xs:tracking-widest xl:mt-6 3xl:mt-8"
          color="info"
          onClick={handleSwapTransaction}
          isLoading={stateLoading === 'loading'}
        >
          SWAP
        </Button>
      </Trade>
      <RightSideInfo coin={toCoin} />
    </div>
  );
};

export default SwapConsole;