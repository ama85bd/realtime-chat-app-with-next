'use client';
import { pusherClient } from '@/lib/pusher';
import { classNameHandler, toPusherKey } from '@/lib/utils';
import { Message } from '@/lib/validator/message';
import { format, toDate } from 'date-fns';
import Image from 'next/image';
import { FC, useEffect, useRef, useState } from 'react';

interface MessagesProps {
  initialMessages: Message[];
  sessionId: string;
  chatId: string;
  sessionImg: string | null | undefined;
  chatPartner: User;
}

const Messages: FC<MessagesProps> = ({
  initialMessages,
  sessionId,
  sessionImg,
  chatPartner,
  chatId,
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [dateCheck, setDateCheck] = useState<boolean>(false);
  const scrollDownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`chat:${chatId}`));

    const messageHandler = (message: Message) => {
      setMessages((prev) => [message, ...prev]);
    };

    pusherClient.bind('incoming_message', messageHandler);

    return () => {
      pusherClient.unsubscribe(toPusherKey(`chat:${chatId}`));
      pusherClient.unbind('incoming_message', messageHandler);
    };
  }, [chatId, sessionId]);

  const formatTimeStamp = (timestamp: number) => {
    const date = toDate(timestamp).toString();
    const nowD = new Date();
    const passedday = format(date, 'dd-MM-yyyy');
    const today = format(toDate(nowD.getTime()), 'dd-MM-yyyy');
    return today === passedday
      ? format(timestamp, 'HH:MM')
      : format(date, 'dd-MM-yyyy');
  };
  return (
    <>
      {dateCheck && (
        <hr className='h-px my-8 bg-gray-200 border-0 dark:bg-gray-700' />
      )}
      <div
        id='messages'
        className='flex h-full flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch'
      >
        <div ref={scrollDownRef} />

        {messages
          .filter((date) =>
            format(toDate(date.timestamp).toString(), 'dd-MM-yyyy')
          )
          .map((message, index) => {
            const isCurrentUser = message.senderId === sessionId;
            const hasNextMessageFromSameUser =
              messages[index - 1]?.senderId === messages[index]?.senderId;

            return (
              <div
                className='chat-message'
                key={`${message.id}-${message.timestamp}`}
              >
                {index === 0 && (
                  <p className='flex justify-center items-center'>
                    {format(
                      toDate(new Date().getTime()).toString(),
                      'do MMMM yyy'
                    )}
                  </p>
                )}

                <div
                  className={classNameHandler('flex items-end', {
                    'justify-end': isCurrentUser,
                  })}
                >
                  <div
                    className={classNameHandler(
                      'flex flex-col space-y-2 text-base max-w-xs mx-2',
                      {
                        'order-1 items-end': isCurrentUser,
                        'order-2 items-start': !isCurrentUser,
                      }
                    )}
                  >
                    <span
                      className={classNameHandler(
                        'px-4 py-2 rounded-lg inline-block',
                        {
                          'bg-indigo-600 text-white': isCurrentUser,
                          'bg-gray-200 text-gray-900': !isCurrentUser,
                          'rounded-br-none':
                            !hasNextMessageFromSameUser && isCurrentUser,
                          'rounded-bl-none':
                            !hasNextMessageFromSameUser && !isCurrentUser,
                        }
                      )}
                    >
                      {message.text}{' '}
                      <span className='ml-2 text-xs text-gray-400'>
                        {formatTimeStamp(message.timestamp)}
                      </span>
                    </span>
                  </div>

                  <div
                    className={classNameHandler('relative w-6 h-6', {
                      ' order-2': isCurrentUser,
                      ' order-1': !isCurrentUser,
                      invisible: hasNextMessageFromSameUser,
                    })}
                  >
                    <Image
                      fill
                      src={
                        isCurrentUser
                          ? (sessionImg as string)
                          : chatPartner.image
                      }
                      alt='Profile picture'
                      referrerPolicy='no-referrer'
                      className='rounded-full'
                    />
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </>
  );
};

export default Messages;
