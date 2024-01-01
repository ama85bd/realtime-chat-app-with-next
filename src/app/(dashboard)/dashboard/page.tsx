import { authOptions } from '@/auth';
import Button from '@/components/ui/Button';
import { getServerSession } from 'next-auth';
import { FC } from 'react';

interface pageProps {}

const page = async ({}) => {
  const session = await getServerSession(authOptions);
  return <pre>Dashboard</pre>;
};

export default page;
