import { useState } from 'react';

export default function useSupportModal() {
  const [showSupport, setShowSupport] = useState(false);

  const toggleSupportModal = () => {
    setShowSupport(prev => !prev);
  };

  return { showSupport, toggleSupportModal };
}
