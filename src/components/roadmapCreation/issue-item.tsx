import React from 'react';
import GithubLogo from '@/assets/images/github-mark-white.svg';
import Image from 'next/image';
import AnchorLink from '@/components/ui/links/anchor-link';
import { LinkIcon } from '@/components/icons/link-icon';
import cn from 'classnames';

interface IssueItemProps {
  issue: any;
  setIssue: React.Dispatch<React.SetStateAction<any>>;
  data: any;
}

const IssueItem: React.FC<IssueItemProps> = ({ issue, setIssue, data }) => {
  return (
    <div
      className={cn(
        'my-2 flex h-28 w-full flex-col rounded-xl border border-gray-600 p-2',
        { 'gradient-border-box': issue?.issue_gh_url === data?.issue_gh_url }
      )}
      onClick={() => setIssue(data)}
    >
      <div className="mb-1 flex items-start justify-between">
        <div className="flex items-center rounded-full bg-black px-4 py-2">
          <Image
            src={GithubLogo}
            alt="github logo"
            className="mr-1 h-3 w-3 xl:h-3.5 xl:w-3.5 3xl:h-4 3xl:w-4"
          />
          <div className="text-3xs xl:text-2xs 3xl:text-xs">
            {data?.issue_gh_url?.replace('https://github.com', '')}
          </div>
        </div>
        <AnchorLink
          onClick={(e) => e.stopPropagation()}
          href={data?.issue_gh_url || ''}
          target="_blank"
        >
          <LinkIcon />
        </AnchorLink>
      </div>
      <div className="h-9 w-full px-2 text-3xs xl:text-2xs 3xl:text-xs">
        {data?.issue_summary && data?.issue_summary.length > 140
          ? data?.issue_summary.slice(0, 140) + '...'
          : data?.issue_summary}
        {data?.issue_summary === null && (
          <div className="text-3xs text-gray-500 xl:text-2xs 3xl:text-xs">
            No Issue Summary.
          </div>
        )}
      </div>
      {data?.issue_summary === '' && (
        <div className="h-9 w-full px-2 text-3xs text-gray-500 xl:text-2xs 3xl:text-xs">
          No Issue Summary Provided
        </div>
      )}
    </div>
  );
};

export default IssueItem;
