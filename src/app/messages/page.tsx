import Messages from '@/components/pages/Messages';
import ProtectedRoute from '@/components/Common/ProtectedRoute';

export const dynamic = 'force-dynamic';

export default function MessagesPage() {
  return (
    <ProtectedRoute>
      <div className="relative h-[calc(100vh-140px)] overflow-hidden">
        <Messages />
      </div>
    </ProtectedRoute>
  );
}

