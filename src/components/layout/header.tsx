import Image from 'next/image';
import Link from 'next/link';

export const Header = () => {
  return (
    <header className="h-20 flex justify-center items-center bottom-0.5 border-b-[0.4mm]	border-[#DBDBDB]">
      <Link href={'/'}>
        <Image
          src="/logo.png"
          alt="logo"
          className="h-10"
          width={80}
          height={10}
        />
        {/* <img src="/logo.png" alt="logo" className="h-10" /> */}
      </Link>
    </header>
  );
};
