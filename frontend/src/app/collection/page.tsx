"use client";

import { useEffect, useState } from 'react';
import StylingResults from '../../components/StylingResults';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

export default function CollectionPage() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const rawData = sessionStorage.getItem('aura_styling_profile');
    if (rawData) {
      setProfile(JSON.parse(rawData));
    }
  }, []);

  const handleReset = () => {
    sessionStorage.clear();
    window.location.href = '/scan';
  };

  if (!profile) return null;

  return (
    <div className="w-full min-h-screen overflow-y-auto relative flex flex-col bg-background">
      <StylingResults profile={profile} onReset={handleReset} />
    </div>
  );
}
