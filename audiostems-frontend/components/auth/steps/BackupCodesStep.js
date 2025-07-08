import React, { useState, useEffect } from 'react';
import { Button, Alert, Card } from 'flowbite-react';
import { HiShield, HiDownload, HiCheck, HiEye, HiEyeOff } from 'react-icons/hi';

export default function BackupCodesStep({ formData, onComplete, onUpdate, isLoading }) {
  const [backupCodes, setBackupCodes] = useState([]);
  const [generatedCodes, setGeneratedCodes] = useState(false);
  const [showCodes, setShowCodes] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    generateBackupCodes();
  }, []);

  const generateBackupCodes = async () => {
    try {
      setError('');

      const response = await fetch('/api/auth/generate-backup-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBackupCodes(data.codes);
        setGeneratedCodes(true);
        
        // Update form data
        onUpdate({
          backupCodes: data.codes,
          backupCodesGenerated: true
        });
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to generate backup codes');
      }
    } catch (error) {
      setError('Failed to generate backup codes. Please try again.');
    }
  };

  const downloadBackupCodes = () => {
    const codesText = backupCodes.map((code, index) => `${index + 1}. ${code}`).join('\n');
    const blob = new Blob([
      `AudioStems Backup Codes\n`,
      `Generated: ${new Date().toLocaleDateString()}\n`,
      `\nKeep these codes safe. You can use them to recover your account.\n\n`,
      codesText
    ], { type: 'text/plain' });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'audiostems-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setDownloaded(true);
  };

  const handleComplete = () => {
    onComplete({
      backupCodes: {
        generated: true,
        codes: backupCodes,
        downloaded: downloaded
      }
    });
  };

  const regenerateCodes = () => {
    setGeneratedCodes(false);
    setDownloaded(false);
    setShowCodes(false);
    generateBackupCodes();
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
          <HiShield className="w-8 h-8 text-purple-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Generate Backup Codes
        </h3>
        <p className="text-gray-600">
          Create backup codes to recover your account if you lose access to your phone or email.
        </p>
      </div>

      {error && (
        <Alert color="failure" className="mb-6">
          <span>{error}</span>
        </Alert>
      )}

      {!generatedCodes ? (
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Generating your backup codes...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Backup Codes Display */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-900">Your Backup Codes</h4>
              <Button
                size="sm"
                color="gray"
                onClick={() => setShowCodes(!showCodes)}
                className="flex items-center gap-2"
              >
                {showCodes ? <HiEyeOff className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
                {showCodes ? 'Hide' : 'Show'} Codes
              </Button>
            </div>

            {showCodes && (
              <div className="grid grid-cols-2 gap-2 mb-4">
                {backupCodes.map((code, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 p-3 rounded text-center font-mono text-sm"
                  >
                    {code}
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-3">
              <Alert color="warning">
                <span className="font-medium">Important:</span>
                <ul className="mt-2 text-sm space-y-1">
                  <li>• Save these codes in a secure location</li>
                  <li>• Each code can only be used once</li>
                  <li>• Keep them separate from your main device</li>
                </ul>
              </Alert>

              <Button
                color="gray"
                onClick={downloadBackupCodes}
                className="w-full flex items-center justify-center gap-2"
                disabled={downloaded}
              >
                <HiDownload className="w-4 h-4" />
                {downloaded ? 'Downloaded' : 'Download Codes'}
              </Button>

              {downloaded && (
                <div className="flex items-center justify-center gap-2 text-green-600 text-sm">
                  <HiCheck className="w-4 h-4" />
                  Codes downloaded successfully
                </div>
              )}
            </div>
          </Card>

          {/* Regenerate Option */}
          <div className="text-center">
            <Button
              color="gray"
              size="sm"
              onClick={regenerateCodes}
              className="text-sm"
            >
              Generate New Codes
            </Button>
          </div>

          {/* Complete Button */}
          <Button
            color="blue"
            onClick={handleComplete}
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Continue to Artist Profile'}
          </Button>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Backup codes provide an additional layer of security for your account.</p>
        <p className="mt-1">
          Need help? <button className="text-blue-600 hover:underline">Contact Support</button>
        </p>
      </div>
    </div>
  );
} 