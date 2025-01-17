import dynamic from 'next/dynamic';
import Loader from '@/components/ui/loader';
import { useIsMounted } from '@/lib/hooks/use-is-mounted';
import { useWallet } from '@solana/wallet-adapter-react';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { getFirebaseJwt } from '@/store/firebaseTokensSlice';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { setGithub } from '@/store/userInfoSlice';
import axios from 'axios';

import ContractProcess from '@/components/contract-overlay/contract-process';
// dynamic imports
const ModernLayout = dynamic(() => import('@/layouts/_modern'), {
  loading: () => <FallbackLoader />,
});

function FallbackLoader() {
  return (
    <div className="fixed z-50 grid h-full w-full place-content-center">
      <Loader variant="blink" />
    </div>
  );
}

export default function RootLayout({
  children,
  contentClassName,
}: React.PropsWithChildren<{ contentClassName?: string }>) {
  const isMounted = useIsMounted();
  const wallet = useWallet();
  const { data: session } = useSession();
  const dispatch = useAppDispatch();
  const firebase_jwt = useAppSelector(
    (state) => state.firebaseTokens.firebaseTokens.auth_creds
  );
  const githubInfo = useAppSelector((state) => state.userInfo.githubInfo);
  useEffect(() => {
    if (
      firebase_jwt === null &&
      //@ts-ignore
      session?.user?.id &&
      //@ts-ignore
      session?.accessToken
    ) {
      const notifToken = sessionStorage.getItem('browser-notif-token');
      dispatch(
        getFirebaseJwt({
          //@ts-ignore
          github_id: session.user.id,
          //@ts-ignore
          firebase_uid: notifToken !== null ? notifToken : session.user.id,
          //@ts-ignore
          user_gh_access_token: session.accessToken,
          //@ts-ignore
          pub_key: wallet.publicKey || '',
        })
      );
    }
  }, [session, wallet, dispatch, firebase_jwt]);

  useEffect(() => {
    if (
      //@ts-ignore
      session?.accessToken &&
      (githubInfo === null ||
        //@ts-ignore
        session?.user?.id !== githubInfo.id)
    ) {
      axios
        .get('https://api.github.com/user', {
          headers: {
            //@ts-ignore
            Authorization: `Bearer ${session?.accessToken}`,
          },
        })
        .then((res) => dispatch(setGithub(res.data)))
        .catch((err) => console.log(err));
    }
  }, [session, dispatch]);

  // fix the `Hydration failed because the initial UI does not match` issue
  if (!isMounted) return null;

  // render default layout which is modern
  return (
    <>
      <ModernLayout contentClassName={contentClassName}>
        {children}
      </ModernLayout>
      <ContractProcess />
    </>
  );
}
