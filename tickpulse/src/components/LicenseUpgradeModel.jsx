import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'

// const API_BASE_URL = 'http://localhost:3000';
export default function LicenseUpgradeModal({ isOpen, onUpgrade, formError }) {
  const [inputKey, setInputKey] = useState('');
  // const [token, setToken] = useState('');
  // const [formError, setFormError] = useState('');
  const router = useRouter();

  // useEffect(() => {
  //   if (typeof window !== 'undefined') {
  //     const accessToken = localStorage.getItem('accessToken');
  //     setToken(accessToken);
  //   }
  // }, []);

 

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpgrade(inputKey); 
  };

  if (!isOpen) 
    return (<></>);

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit}>
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg w-120">
          <h2 className="text-xl font-bold mb-4">License Upgrade</h2>
          <p className="mb-4">
            Currnent license does not support calendar feature. Please enter advanced license key:
            {/* <span className="block mt-2 text-sm text-blue-600">
              Valid advanced license key:<br />
              B2N8-LM9S-DH4Y-CQ1W<br />
              NBUN-JW8N-SUIS-451N

            </span> */}
          </p>

          <input
            type="text"
            className="w-full p-2 border rounded mb-4"
            placeholder="Enter new license key"
            value={inputKey}
            onChange={(event) => {
              // 1. Only keep alphabet and numbers
              let rawValue = event.target.value
                .replace(/[^a-zA-Z0-9]/g, '') // Delete all non-alphanumeric characters
                .toUpperCase();

              // 2. Insert "-" automatically every 4 characters
              let formattedValue = '';
              for (let i = 0; i < rawValue.length; i++) {
                if (i > 0 && i % 4 === 0 && i < 16) {
                  formattedValue += '-';
                }
                formattedValue += rawValue[i];
              }

              // 3. Maximum 19 characters for the license key 
              //    4 + 1 + 4 + 1 + 4 + 1 + 4
              if (formattedValue.length > 19) {
                formattedValue = formattedValue.slice(0, 19);
              }

              setInputKey(formattedValue);
            }}
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="px-4 py-2 text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Upgrade
            </button>
          </div>
          {formError && (
            <p className="mt-2 text-center text-red-500 text-sm">
              {formError}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}