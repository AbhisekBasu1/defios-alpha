import React, { useEffect, useState } from 'react';
import type { NextPageWithLayout } from '@/types';
import { NextSeo } from 'next-seo';
import RootLayout from '@/layouts/_root-layout';
import Button from '@/components/ui/button/button';
import StackedSwitch from '@/components/custom/stacked-switch';
import { SearchIcon } from '@/components/icons/search';
import { PlusCircle } from '@/components/icons/plus-circle';
import IssuesList from '@/components/issues/list';
import { Close } from '@/components/icons/close';
import Input from '@/components/ui/forms/input';

import OpenIssueExpand from '@/components/issues/open-issues-expand';
import VotingExpand from '@/components/issues/voting-expand';
import WinnerDeclaredExpand from '@/components/issues/winner-declared-expand';
import ClosedIssueExpand from '@/components/issues/closed-issue-expand';

import EmptyList from '@/components/icons/EmptyList';
import Spinner from '@/components/custom/spinner';
import axios from 'axios';

import { useAppSelector, useAppDispatch } from '@/store/store';
import { reset } from '@/store/notifClickSlice';
import { resetRefetch } from '@/store/refetchSlice';

import { Tooltip } from 'flowbite-react';
import { InfoCircle } from '@/components/icons/info-circle';

import { useDrawer } from '@/components/drawer-views/context';

interface searchProps {
  placeholder?: string;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  setTriggerSearch: React.Dispatch<React.SetStateAction<boolean>>;
}

const Search: React.FC<searchProps> = ({
  placeholder,
  search,
  setSearch,
  setTriggerSearch,
}) => {
  const tooltipVal =
    'direct issue title search or using keys\n====Search==>\n<key>:<value> separated by ;\n====keys==>\nid,\nissue_project_id,\nissue_project_name,\nstate,\nstake_amount,\nstake_token_symbol,\nnum_prs,\ncreator_gh,\nissue_tags, order_by';
  return (
    <div className="relative flex w-full items-center rounded-full">
      <label className="relative flex w-full items-center">
        <Input
          className="w-full"
          placeholder={placeholder || 'Search'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoComplete="off"
        />
        <Close
          onClick={() => setSearch('')}
          className="absolute right-3 h-4 w-4"
        />
      </label>
      <Button
        shape="rounded"
        size="small"
        className="mx-2 mr-5 flex items-center justify-center"
        onClick={() => setTriggerSearch(true)}
      >
        <SearchIcon className="h-4 w-4" />
      </Button>
      <Tooltip
        content={tooltipVal}
        placement="right-start"
        style="light"
        className="!whitespace-pre-wrap text-black"
        arrow={false}
      >
        <InfoCircle />
      </Tooltip>
    </div>
  );
};

const IssuesPage: NextPageWithLayout = () => {
  const { openDrawer } = useDrawer();

  const [isMine, setIsMine] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [triggerSearch, setTriggerSearch] = useState(false);

  const [initExapand, setInitExpand] = useState(false);
  const searchQuery = useAppSelector((state) => state.notifClick.searchQuery);
  const setSearchQuery = useAppSelector(
    (state) => state.notifClick.setSearchQuery
  );
  const expandFirst = useAppSelector((state) => state.notifClick.expandFirst);
  const clickPathname = useAppSelector((state) => state.notifClick.pathname);

  const refetchPart = useAppSelector((state) => state.refetch.refetchPart);

  const dispatch = useAppDispatch();

  const firebase_jwt = useAppSelector(
    (state) => state.firebaseTokens.firebaseTokens.auth_creds
  );

  const [issuesData, setIssuesData] = useState<any>([]);

  useEffect(() => {
    if (firebase_jwt === '' || firebase_jwt === null) return;
    setIsLoading(true);
    axios
      .get('https://api-v1.defi-os.com/issues', {
        params: {
          'filter.pageno': '1',
          'filter.pagesize': 30,
        },
        headers: {
          Authorization: firebase_jwt,
        },
      })
      .then((res) => {
        setIssuesData(res.data.issues);
        setIsLoading(false);
      })
      .catch((err) => {
        console.log(err.message);
        setIsLoading(false);
      });
  }, [firebase_jwt]);

  useEffect(() => {
    if (firebase_jwt === '' || firebase_jwt === null) return;
    setIsLoading(true);
    const searchParams: any = {
      'filter.pageno': '1',
      'filter.pagesize': 30,
    };
    if (isMine) {
      searchParams['filter.mine'] = true;
    }
    if (search !== '') {
      if (search.includes(';')) {
        const searchArray = search.trim().split(';');
        searchArray.map((item) => {
          const [key, value] = item.trim().split(':');
          if (key === 'id') {
            searchParams['first_id'] = value;
          }
          if (key === 'issue_project_id') {
            searchParams['search.issue_project_id'] = value;
          }
          if (key === 'issue_project_name') {
            searchParams['search.issue_project_name'] = value;
          }
          if (key === 'state') {
            searchParams['search.issue_state'] = value;
          }
          if (key === 'stake_amount') {
            searchParams['search.issue_stake_amount'] = parseInt(value);
          }
          if (key === 'stake_token_symbol') {
            searchParams['search.issue_stake_token_symbol'] = value;
          }
          if (key === 'num_prs') {
            searchParams['search.issue_num_prs'] = parseInt(value);
          }
          if (key === 'creator_gh') {
            searchParams['search.issue_creator_gh'] = parseInt(value);
          }
          if (key === 'issue_tags') {
            searchParams['search.issue_tags'] = value;
          }
          if (key === 'order_by') {
            searchParams['filter.order_by'] = value;
          }
        });
      } else if (search.includes(':') && !search.includes(';')) {
        const [key, value] = search.trim().split(':');
        if (key === 'id') {
          searchParams['first_id'] = value;
        }
        if (key === 'issue_project_id') {
          searchParams['search.issue_project_id'] = value;
        }
        if (key === 'issue_project_name') {
          searchParams['search.issue_project_name'] = value;
        }
        if (key === 'state') {
          searchParams['search.issue_state'] = value;
        }
        if (key === 'stake_amount') {
          searchParams['search.issue_stake_amount'] = parseInt(value);
        }
        if (key === 'stake_token_symbol') {
          searchParams['search.issue_stake_token_symbol'] = value;
        }
        if (key === 'num_prs') {
          searchParams['search.issue_num_prs'] = parseInt(value);
        }
        if (key === 'creator_gh') {
          searchParams['search.issue_creator_gh'] = parseInt(value);
        }
        if (key === 'issue_tags') {
          searchParams['search.issue_tags'] = value;
        }
        if (key === 'order_by') {
          searchParams['filter.order_by'] = value;
        }
      } else if (!search.includes(':') && !search.includes(';')) {
        searchParams['search.issue_title'] = search.trim();
      }
    }
    axios
      .get('https://api-v1.defi-os.com/issues', {
        params: searchParams,
        headers: {
          Authorization: firebase_jwt,
        },
      })
      .then((res) => {
        setIssuesData(res.data.issues);
        setIsLoading(false);
      })
      .catch((err) => {
        console.log(err.message);
        setIsLoading(false);
      });
    setInitExpand(false);
  }, [isMine, firebase_jwt]);

  useEffect(() => {
    if (firebase_jwt === '' || firebase_jwt === null) return;
    if (triggerSearch === true) {
      setIsLoading(true);
      const searchParams: any = {
        'filter.pageno': '1',
        'filter.pagesize': 30,
      };
      if (isMine) {
        searchParams['filter.mine'] = true;
      }
      if (search !== '') {
        if (search.includes(';')) {
          const searchArray = search.trim().split(';');
          searchArray.map((item) => {
            const [key, value] = item.trim().split(':');
            if (key === 'id') {
              searchParams['first_id'] = value;
            }
            if (key === 'issue_project_id') {
              searchParams['search.issue_project_id'] = value;
            }
            if (key === 'issue_project_name') {
              searchParams['search.issue_project_name'] = value;
            }
            if (key === 'state') {
              searchParams['search.issue_state'] = value;
            }
            if (key === 'stake_amount') {
              searchParams['search.issue_stake_amount'] = parseInt(value);
            }
            if (key === 'stake_token_symbol') {
              searchParams['search.issue_stake_token_symbol'] = value;
            }
            if (key === 'num_prs') {
              searchParams['search.issue_num_prs'] = parseInt(value);
            }
            if (key === 'creator_gh') {
              searchParams['search.issue_creator_gh'] = parseInt(value);
            }
            if (key === 'issue_tags') {
              searchParams['search.issue_tags'] = value;
            }
            if (key === 'order_by') {
              searchParams['filter.order_by'] = value;
            }
          });
        } else if (search.includes(':') && !search.includes(';')) {
          const [key, value] = search.trim().split(':');
          if (key === 'id') {
            searchParams['first_id'] = value;
          }
          if (key === 'issue_project_id') {
            searchParams['search.issue_project_id'] = value;
          }
          if (key === 'issue_project_name') {
            searchParams['search.issue_project_name'] = value;
          }
          if (key === 'state') {
            searchParams['search.issue_state'] = value;
          }
          if (key === 'stake_amount') {
            searchParams['search.issue_stake_amount'] = parseInt(value);
          }
          if (key === 'stake_token_symbol') {
            searchParams['search.issue_stake_token_symbol'] = value;
          }
          if (key === 'num_prs') {
            searchParams['search.issue_num_prs'] = parseInt(value);
          }
          if (key === 'creator_gh') {
            searchParams['search.issue_creator_gh'] = parseInt(value);
          }
          if (key === 'issue_tags') {
            searchParams['search.issue_tags'] = value;
          }
          if (key === 'order_by') {
            searchParams['filter.order_by'] = value;
          }
        } else if (!search.includes(':') && !search.includes(';')) {
          searchParams['search.issue_title'] = search.trim();
        }
      }

      axios
        .get('https://api-v1.defi-os.com/issues', {
          params: searchParams,
          headers: {
            Authorization: firebase_jwt,
          },
        })
        .then((res) => {
          setIssuesData(res.data.issues);
          setIsLoading(false);
          setTriggerSearch(false);
        })
        .catch((err) => {
          console.log(err.message);
          setIsLoading(false);
          setTriggerSearch(false);
        });
    }
    setInitExpand(false);
  }, [triggerSearch, firebase_jwt]);

  useEffect(() => {
    if (issuesData.length === 0) return;
    if (searchQuery !== '' && setSearchQuery && clickPathname === '/issues') {
      setSearch(searchQuery);
      setInitExpand(expandFirst);
      setTriggerSearch(true);
      dispatch(reset());
    }
    if (refetchPart === 'issue') {
      setTriggerSearch(true);
      dispatch(resetRefetch());
    }
  }, [
    issuesData,
    searchQuery,
    setSearchQuery,
    expandFirst,
    dispatch,
    refetchPart,
  ]);

  return (
    <>
      <NextSeo
        title="Issues"
        description="DefiOS - Scaling Layer for Open Source Collaboration."
      />
      <div className="flex items-center justify-start">
        <div className="flex h-full w-full flex-col">
          <div className="mb-2 flex w-full items-center gap-5">
            <Search
              placeholder="Search Issues"
              search={search}
              setSearch={setSearch}
              setTriggerSearch={setTriggerSearch}
            />
            <div className="w-52">
              <StackedSwitch
                isStacked={isMine}
                setIsStacked={setIsMine}
                label="My Issues"
              />
            </div>
            <Button
              onClick={() =>
                openDrawer('ISSUE_CREATE', 'right', 'transparent-glass')
              }
              color="info"
              shape="rounded"
              size="small"
            >
              <div className="flex flex-row items-center justify-center gap-2">
                <PlusCircle />
                New Issue
              </div>
            </Button>
          </div>
          <div className="my-3 grid grid-cols-7 items-center gap-6 rounded-xl border-b-3 border-gray-600 bg-light-dark text-2xs uppercase shadow-card xl:text-xs 2xl:text-sm">
            <span className="col-span-2 px-6 py-3 tracking-wider text-gray-300 xl:py-3.5 3xl:py-4">
              Issue Title
            </span>
            <span className="py-3 text-center tracking-wider text-gray-300 xl:py-3.5 3xl:py-4">
              Issue State
            </span>
            <span className="py-3 text-center tracking-wider text-gray-300 xl:py-3.5 3xl:py-4">
              Project Name
            </span>
            <span className="col-span-2 py-3 text-center tracking-wider text-gray-300 xl:py-3.5 3xl:py-4">
              Staked Tokens
            </span>
            <span className="py-3 px-6 text-center tracking-wider text-gray-300 xl:py-3.5 3xl:py-4">
              Tags
            </span>
          </div>
          {!isLoading &&
            issuesData?.length !== 0 &&
            issuesData.map((issue: any, idx: number) => (
              <IssuesList
                data={issue}
                key={idx}
                initExpand={idx == 0 ? initExapand : false}
                last={issuesData.length === idx + 1}
                first={idx === 0}
              >
                {issue?.issue_state === 'open' && (
                  <OpenIssueExpand
                    issueDesc={issue?.issue_summary}
                    link={issue?.issue_gh_url}
                    account={issue?.issue_account}
                  />
                )}
                {issue?.issue_state === 'voting' && (
                  <VotingExpand PRData={issue?.issue_prs} />
                )}
                {issue?.issue_state === 'winner_declared' && (
                  <WinnerDeclaredExpand
                    data={issue}
                    issueAccount={issue?.issue_account}
                  />
                )}
                {issue?.issue_state === 'closed' && (
                  <ClosedIssueExpand data={issue} />
                )}
              </IssuesList>
            ))}
          {!isLoading && issuesData.length === 0 && (
            <div className="mt-16 flex w-full flex-col items-center justify-center gap-5">
              <EmptyList />
              <div className="text-lg text-gray-500">
                No Issues found that match your filter and search settings
              </div>
              <Button
                onClick={() =>
                  openDrawer('ISSUE_CREATE', 'right', 'transparent-glass')
                }
                color="info"
                shape="rounded"
                size="small"
              >
                <div className="flex flex-row items-center justify-center gap-2">
                  <PlusCircle />
                  Create New Issue
                </div>
              </Button>
            </div>
          )}
          {isLoading && (
            <div className="mt-10 flex h-full w-full items-center justify-center">
              <Spinner />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

IssuesPage.getLayout = function getLayout(page) {
  return <RootLayout>{page}</RootLayout>;
};

export default IssuesPage;
