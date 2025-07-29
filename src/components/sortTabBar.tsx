import { Bell, Search, UserRound } from 'lucide-react';

const tab = ['베스트셀러', '신간추천', '리뷰 순위', '좋아요 순위'];

export const SortTabBar = () => {
  return (
    <nav className="h-8 flex justify-between items-center bottom-0.5 border-b-2 border-black text-sm ">
      <Search className="w-5" />
      <div className="flex justify-center items-center">
        {tab.map((name) => {
          return (
            <div className=" px-4" key={name}>
              {name}
            </div>
          );
        })}
      </div>
      <div className="flex justify-center">
        <div>
          <Bell className="w-5" />
        </div>
        <UserRound className="w-5 ml-4" />
      </div>
    </nav>
  );
};
