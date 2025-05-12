'use client';

import react from 'react'
import { useState, useEffect, useCallback } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import NavigationBar from '@/components/NavigationBar';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/context/ToastContext';
import { TaskProvider } from '@/context/TaskContext';
import LicenseUpgradeModal from '@/components/LicenseUpgradeModel';
import CalendarView from '@/components/CalendarView'; // Import the CalendarView component
import { useRouter } from 'next/navigation'

const API_BASE_URL = 'http://localhost:3000';

export default function CalendarPage() {
  const [licenseKey, setLicenseKey] = useState('');
  const [licenseKeyType, setLicenseKeyType] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [formError, setFormError] = useState('');
  const [token, setToken] = useState('');

  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('accessToken');
      setToken(accessToken);
    }
  }, []); 


  useEffect(() => {
    const fetchLicense = async () => {
      try {
        if (!token) return;

        const response = await fetch(
          `${API_BASE_URL}/api/license`,
          {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
          }
        );
        const data = await response.json();

        console.log(data);

        setLicenseKey(data.licenseKey);
        setLicenseKeyType(data.licenseType);

        // Show upgrade window if the license key is not valid
        if (data.licenseKeyType !== "premium") {
          setShowUpgradeModal(true);
        }
      } catch (error) {
        console.error('Fail to obtain License Key:', error);
      }
    };
    fetchLicense();
  }, [token]);

  const handleUpgrade = async (newKey) => {
    try {
      setFormError('');

      const res = await fetch(`${API_BASE_URL}/api/license`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newKey })
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.message);
        return;
      }

      setLicenseKey(newKey);
      setLicenseKeyType('premium');
      setShowUpgradeModal(false);

    } catch (error) {
      setFormError('Network error, please try again');
    }
  };

  return (
    <ThemeProvider>
      <ToastProvider>
        <TaskProvider>
          <div className="flex h-screen bg-gray-50 dark:bg-zinc-950">
            <NavigationBar />
            <main className="flex-1 overflow-auto">
              {licenseKeyType === 'premium' ? (
                <CalendarView />
              ) : (
                <></>
              )}
              <LicenseUpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                onUpgrade={handleUpgrade}
                formError={formError}
              />
            </main>

          </div>
        </TaskProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}