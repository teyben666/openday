'use client';

import { ApplicationForm } from '@/components/application-form';
import { useDiscovery } from '@/store/use-discovery';

export default function ApplyPage() {
  const { selectedProgramme } = useDiscovery();
  return <ApplicationForm preSelectedProgramme={selectedProgramme || undefined} />;
}
