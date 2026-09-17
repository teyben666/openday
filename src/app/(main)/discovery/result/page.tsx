'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDiscovery } from '@/store/use-discovery';
import { DiscoveryResultView } from '@/components/discovery-result';

export default function DiscoveryResultPage() {
  const router = useRouter();
  const { result, resultUnlocked } = useDiscovery();

  useEffect(() => {
    if (!resultUnlocked || !result) {
      router.replace('/discovery');
    }
  }, [resultUnlocked, result, router]);

  if (!resultUnlocked || !result) {
    return (
      <div className="py-24 text-center text-muted-foreground">
        Redirecting...
      </div>
    );
  }

  return <DiscoveryResultView result={result} />;
}
