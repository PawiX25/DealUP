import Image from "next/image";
import DealList from '@/components/DealList';
import CreateDealButton from '@/components/CreateDealButton';

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <main className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Latest Deals</h1>
        <CreateDealButton />
        <DealList />
      </main>
    </div>
  );
}
