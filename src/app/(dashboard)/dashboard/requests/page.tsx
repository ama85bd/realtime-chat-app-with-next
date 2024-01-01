import { authOptions } from '@/auth';
import FriendRequest from '@/components/FriendRequest';
import { fetchRedis } from '@/helpers/redis';
import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';

const page = async () => {
  const session = await getServerSession(authOptions);
  if (!session) notFound();

  // ids of people who sent current logged in user a friend request
  const incomingSenderIds = (await fetchRedis(
    'smembers',
    `user:${session.user.id}:incoming_friend_requests`
  )) as string[];

  const incomingFrinedRequests = await Promise.all(
    incomingSenderIds.map(async (senderId) => {
      const sender = (await fetchRedis('get', `user:${senderId}`)) as string;
      const senderParsed = JSON.parse(sender) as User;
      return {
        senderId,
        senderEmail: senderParsed.email,
        senderName: senderParsed.name,
      };
    })
  );

  return (
    <main className='pt-8 px-6'>
      <h1 className='font-bold text-5xl mb-8'>Add a friend</h1>
      <div className='flex flex-col gap-4'>
        <FriendRequest
          incomingFriendRequest={incomingFrinedRequests}
          sessionId={session.user.id}
        />
      </div>
    </main>
  );
};

export default page;
