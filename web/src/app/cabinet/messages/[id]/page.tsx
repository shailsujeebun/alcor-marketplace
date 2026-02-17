'use client';

import { use } from 'react';
import { ConversationDetail } from '@/components/cabinet/conversation-detail';

export default function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ConversationDetail id={id} />;
}
