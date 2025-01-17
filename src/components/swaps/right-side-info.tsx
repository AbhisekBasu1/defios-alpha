import React, { useEffect, useState } from 'react';
import cn from 'classnames';
import Scrollbar from '@/components/ui/scrollbar';
import HoldersChart from '@/components/swaps/holders-chart';
//images
import TransactionInfo from '@/components/ui/transaction-info';
import PriceChart from '@/components/ui/chats/price-chart';
import Image from 'next/image';
import Spinner from '../custom/spinner';

import { useAppSelector } from '@/store/store';
import axios from 'axios';

export default function RightSideInfo({
  className,
  coin,
}: {
  className?: string;
  coin: any;
}) {
  const [coinInfo, setCoinInfo] = useState<any>(null);
  const [priceChartData, setPriceChartData] = useState<any>(null);
  const [pieChartData, setPieChartData] = useState<any>(null);
  const [tokenImgUrl, setTokenImgUrl] = useState('');

  const auth_cred = useAppSelector(
    (state) => state.firebaseTokens.firebaseTokens.auth_creds
  );

  useEffect(() => {
    setCoinInfo(null);
    if (auth_cred === null || coin === null) return;
    axios
      .get('https://api-v1.defi-os.com/swap/profile', {
        params: {
          token_symbol: coin.token_symbol,
        },
        headers: {
          Authorization: auth_cred,
        },
      })
      .then((res) => {
        setCoinInfo(res.data?.details);
      })
      .catch((err) => console.log(err.message));
  }, [coin, auth_cred]);

  useEffect(() => {
    setPriceChartData(null);
    if (coinInfo === null) return;
    if (coinInfo?.token_price_feed && coinInfo.token_price_feed === '') return;
    axios
      .post('api/token/price-chart', {
        price_url: coinInfo?.token_price_feed,
      })
      .then((res) => {
        setPriceChartData(res.data);
      })
      .catch((err) => console.log(err));
  }, [coinInfo]);

  useEffect(() => {
    if (coinInfo === undefined || typeof coinInfo?.token_image_url !== 'string')
      return;
    const _url = coinInfo?.token_image_url;
    const IpfsNewGateway = _url.replace('gateway.pinata.cloud', 'ipfs.io');
    if (_url.includes('gateway.pinata.cloud')) {
      axios
        .get(IpfsNewGateway)
        .then((res) => {
          if (typeof res.data === 'object') {
            if (res.data.image) {
              setTokenImgUrl(res.data.image);
            } else {
              setTokenImgUrl(coinInfo?.token_image_url);
            }
          } else {
            setTokenImgUrl(coinInfo?.token_image_url);
          }
        })
        .catch((err) => {
          console.log(err);
          setTokenImgUrl(coinInfo?.token_image_url);
        });
    }
    if (_url == '') {
      axios
        .get(
          `https://public-api.solscan.io/token/meta?tokenAddress=${coinInfo?.token_spl_addr}`,
          {
            headers: {
              token: process.env.SOLSCAN_TOKEN,
            },
          }
        )
        .then((res) => {
          if (res.data.icon) {
            setTokenImgUrl(res.data.icon);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [coinInfo]);

  useEffect(() => {
    setPieChartData(null);
    if (coin === null) return;
    if (coin?.token_spl_addr && coin.token_spl_addr === '') return;
    axios
      .post('api/token/holders-data', {
        token_address: coin?.token_spl_addr,
      })
      .then((res) => {
        setPieChartData({ chartData: res.data, coin: coin });
      })
      .catch((err) => console.log(err));
  }, [coin]);

  return (
    <aside
      className={cn(
        'fixed top-0 right-0 z-20 h-full w-[18.5rem] max-w-full border-l border-dashed border-gray-700 pt-12 xl:w-[20.75rem] xl:pt-16 2xl:w-[23.5rem] 3xl:w-[25rem]',
        className
      )}
    >
      <Scrollbar style={{ height: 'calc(100% - 20px)' }}>
        <div className="relative z-20 h-screen pb-5">
          <div className="flex h-full flex-col justify-between overflow-x-hidden rounded-xl bg-transparent py-8  px-2 lg:px-3 xl:px-4 2xl:px-5">
            {coinInfo !== null ? (
              <div className="w-full w-full">
                {coinInfo?.token_image_url && (
                  <Image
                    src={tokenImgUrl || ''}
                    alt={coinInfo?.token_symbol || ''}
                    width={80}
                    height={80}
                    className="mx-auto mb-6 rounded-full"
                  />
                )}
                <div className="m-3.5 text-center text-xs xl:m-4 xl:text-sm 2xl:my-5 2xl:text-base">
                  {coinInfo?.token_name} - {coinInfo?.token_symbol}
                </div>
                <TransactionInfo
                  className="m-3.5 xl:m-4 2xl:my-5"
                  label={'Created By'}
                  value={
                    coinInfo?.token_creator_name?.slice(0, 8) +
                    '...' +
                    coinInfo?.token_creator_name?.slice(36, 44)
                  }
                />
                <TransactionInfo
                  className="m-3.5 xl:m-4 2xl:my-5"
                  label={'Created At'}
                  value={new Date(
                    coinInfo?.token_creation_date
                  ).toLocaleDateString('en-IN')}
                />
                <TransactionInfo
                  className="m-3.5 xl:m-4 2xl:my-5"
                  label={'Total Supply'}
                  value={coinInfo?.token_total_supply}
                />
                <TransactionInfo
                  className="m-3.5 xl:m-4 2xl:my-5"
                  label={'Circulating Supply'}
                  value={coinInfo?.token_circulating_supply}
                />
                <div className="m-3.5 flex w-full items-center gap-2 xl:m-4 2xl:my-5">
                  <TransactionInfo
                    className="w-full"
                    label={'Last Traded Price'}
                    value={'$' + Math.round(coinInfo?.token_ltp * 100) / 100}
                  />
                  <div
                    className={cn({
                      'text-red-500': coinInfo?.token_ltp_24h_change < 0,
                      'text-new-green': coinInfo?.token_ltp_24h_change > 0,
                    })}
                  >{`(${coinInfo?.token_ltp_24h_change >= 0 ? '+' : ''}${
                    Math.round(coinInfo?.token_ltp_24h_change * 100) / 100
                  }%)`}</div>
                </div>

                {priceChartData !== null && (
                  <PriceChart
                    chartData={priceChartData.data}
                    change={priceChartData.change}
                  />
                )}
                <div>
                  <span className="-mx-6 block border-t border-dashed border-t-gray-700 4xl:-mx-8" />
                </div>
                <span className="-mx-6 block border-t border-dashed border-t-gray-700 4xl:-mx-8" />
              </div>
            ) : (
              <Spinner />
            )}
            {pieChartData !== null ? (
              <div className="mt-6 w-full lg:mt-8 lg:w-full">
                <HoldersChart chartData={pieChartData} />
              </div>
            ) : (
              <Spinner />
            )}
          </div>
        </div>
      </Scrollbar>
    </aside>
  );
}
