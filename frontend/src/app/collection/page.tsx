"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import StylingResults from '../../components/StylingResults';

export default function CollectionPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const savedProfile = sessionStorage.getItem('aura_styling_profile');
    if (!savedProfile) {
      router.push('/scan');
      return;
    }
    setProfile(JSON.parse(savedProfile));
  }, [router]);

  const handleReset = () => {
    sessionStorage.removeItem('aura_source_b64');
    sessionStorage.removeItem('aura_styling_profile');
    router.push('/');
  };

  if (!profile) return null;

  return (
    <div className="w-full min-h-screen bg-[#e5e6e8] text-black flex flex-col items-center justify-start pt-6 pb-24 overflow-x-hidden">
      <StylingResults profile={profile} onReset={handleReset} />
    </div>
  );
}
