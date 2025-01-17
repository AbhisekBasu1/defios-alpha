import Image from 'next/image';
import { useRouter } from 'next/router';
type AuthorCardProps = {
  image: string;
  name?: string;
  role?: string;
};

export default function AuthorCard({ image, name, role }: AuthorCardProps) {
  const router = useRouter();
  const { pathname } = router;
  return (
    <div
      className={`flex items-center rounded-xl border border-transparent px-3 py-3 2xl:px-3 2xl:py-4 ${
        name ? 'bg-light-dark' : 'justify-center bg-none'
      } ${pathname === '/profile' ? 'border-primary' : 'hover:border-white'}`}
    >
      <div className="relative h-11 w-11 2xl:h-14 2xl:w-14">
        <Image
          src={image}
          alt={name || ''}
          fill
          className="rounded-full border-2 border-gray-400 object-cover"
        />
      </div>
      <div className="pl-3">
        <h3 className="text-xs font-medium uppercase tracking-wide text-white 2xl:text-sm">
          {name}
        </h3>
        <span className="mt-1 block text-2xs text-gray-400 2xl:text-xs">
          {role}
        </span>
      </div>
    </div>
  );
}
