import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { entities } from '@/api/entities';
import { useSafeSave } from '@/lib/saveUtils';
import { Save, KeyRound, Users, ShieldAlert, Eye, EyeOff, AlertTriangle } from 'lucide-react';

export default function PassSection({ restaurant, onRefresh }) {
  const [locked, setLocked] = useState(true);
  const [lockPassword, setLockPassword] = useState('');
  const [lockError, setLockError] = useState('');

  // Password manager fields
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [developerPassword, setDeveloperPassword] = useState('');

  // Icon access control
  const [maxUsers, setMaxUsers] = useState(3);
  const [currentUsage, setCurrentUsage] = useState(0);

  // Revoke section
  const [revokePassword, setRevokePassword] = useState('');
  const [revokeError, setRevokeError] = useState('');
  const [revokeSuccess, setRevokeSuccess] = useState('');

  // Toggle password visibility
  const [showAdminPwd, setShowAdminPwd] = useState(false);
  const [showDevPwd, setShowDevPwd] = useState(false);

  const { saving, saved, error, save } = useSafeSave();

  useEffect(() => {
    if (restaurant) {
      const locks = restaurant.feature_locks || {};
      setAdminUsername(restaurant.admin_username || '');
      setAdminPassword(restaurant.admin_password || '');
      setDeveloperPassword(restaurant.developer_password || 'saas');
      setMaxUsers(parseInt(locks.icon_max_users || '3', 10));
    }
    // Read current usage from localStorage
    setCurrentUsage(parseInt(localStorage.getItem('icon_usage_count') || '0', 10));
  }, [restaurant]);

  const handleUnlockSection = () => {
    if (lockPassword === 'sne') {
      setLocked(false);
      setLockError('');
      setLockPassword('');
    } else {
      setLockError('Incorrect password');
    }
  };

  const handleLockKeyDown = (e) => {
    if (e.key === 'Enter') handleUnlockSection();
  };

  const handleSave = () => {
    const locks = restaurant?.feature_locks || {};
    locks.icon_max_users = String(maxUsers);

    save(entities.Restaurant.update(restaurant.id, {
      admin_username: adminUsername,
      admin_password: adminPassword,
      developer_password: developerPassword,
      feature_locks: locks,
    }), onRefresh);
  };

  const handleRevokeAll = () => {
    if (revokePassword !== 'rt') {
      setRevokeError('Incorrect password');
      return;
    }

    // Clear all icon-related localStorage
    localStorage.removeItem('icon_unlocked');
    localStorage.removeItem('icon_unlocked_at');
    localStorage.setItem('icon_usage_count', '0');
    setCurrentUsage(0);

    // Write icon_revoked_at to feature_locks
    const locks = restaurant?.feature_locks || {};
    locks.icon_revoked_at = new Date().toISOString();
    entities.Restaurant.update(restaurant.id, { feature_locks: locks }).then(() => {
      onRefresh?.();
    });

    setRevokeSuccess('All icon access has been revoked successfully.');
    setRevokePassword('');
    setRevokeError('');
    setTimeout(() => setRevokeSuccess(''), 3000);
  };

  const handleRevokeKeyDown = (e) => {
    if (e.key === 'Enter') handleRevokeAll();
  };

  // Locked state — password gate
  if (locked) {
    return (
      <div className="space-y-6">
        <h2 className="font-display text-2xl font-semibold">Pass</h2>
        <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <KeyRound className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">This section is locked</p>
            <p className="text-xs text-muted-foreground">Enter the section password to continue</p>
          </div>
        </div>
        <div className="space-y-3">
          <Input
            type="password"
            value={lockPassword}
            onChange={e => { setLockPassword(e.target.value); setLockError(''); }}
            onKeyDown={handleLockKeyDown}
            placeholder="Section password"
            className="bg-secondary"
          />
          {lockError && <p className="text-xs text-destructive">{lockError}</p>}
          <Button onClick={handleUnlockSection} className="bg-primary text-primary-foreground">
            Unlock
          </Button>
        </div>
      </div>
    );
  }

  // Unlocked state — full section
  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-semibold">Pass</h2>

      {/* Password Manager */}
      <div className="p-5 rounded-xl bg-card border border-border space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <KeyRound className="w-4 h-4 text-primary" />
          <h3 className="font-display text-sm font-semibold">Password Manager</h3>
        </div>

        <div className="space-y-3">
          <div>
            <Label className="text-xs">Admin Username</Label>
            <Input
              value={adminUsername}
              onChange={e => setAdminUsername(e.target.value)}
              className="mt-1 bg-secondary text-sm"
              placeholder="admin"
            />
          </div>

          <div>
            <Label className="text-xs">Admin Password</Label>
            <div className="relative mt-1">
              <Input
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
                className="bg-secondary text-sm pr-10"
                type={showAdminPwd ? 'text' : 'password'}
                placeholder="••••••"
              />
              <button
                type="button"
                onClick={() => setShowAdminPwd(!showAdminPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showAdminPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <Label className="text-xs">Developer Password</Label>
            <div className="relative mt-1">
              <Input
                value={developerPassword}
                onChange={e => setDeveloperPassword(e.target.value)}
                className="bg-secondary text-sm pr-10"
                type={showDevPwd ? 'text' : 'password'}
                placeholder="saas"
              />
              <button
                type="button"
                onClick={() => setShowDevPwd(!showDevPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showDevPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Icon Access Control */}
      <div className="p-5 rounded-xl bg-card border border-border space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-4 h-4 text-primary" />
          <h3 className="font-display text-sm font-semibold">User Icon Access Control</h3>
        </div>

        <div className="space-y-3">
          <div>
            <Label className="text-xs">Max Users Allowed</Label>
            <Input
              type="number"
              min={1}
              max={100}
              value={maxUsers}
              onChange={e => setMaxUsers(parseInt(e.target.value, 10) || 3)}
              className="mt-1 bg-secondary text-sm w-24"
            />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Current usage:</span>
            <span className="font-semibold text-foreground">{currentUsage} / {maxUsers}</span>
          </div>
          {currentUsage >= maxUsers && (
            <div className="flex items-center gap-2 text-xs text-amber-500">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>User limit reached. Revoke access or increase the limit.</span>
            </div>
          )}
        </div>
      </div>

      {/* Revoke All Icon Access */}
      <div className="p-5 rounded-xl bg-destructive/5 border border-destructive/20 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <ShieldAlert className="w-4 h-4 text-destructive" />
          <h3 className="font-display text-sm font-semibold text-destructive">Revoke All Icon Access</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          This will immediately revoke icon access for all users. They will need to re-enter the unlock password. The usage counter will be reset.
        </p>
        <div className="space-y-2">
          <Input
            type="password"
            value={revokePassword}
            onChange={e => { setRevokePassword(e.target.value); setRevokeError(''); }}
            onKeyDown={handleRevokeKeyDown}
            placeholder="Revoke password"
            className="bg-secondary text-sm"
          />
          {revokeError && <p className="text-xs text-destructive">{revokeError}</p>}
          {revokeSuccess && <p className="text-xs text-green-500">{revokeSuccess}</p>}
          <Button
            variant="destructive"
            size="sm"
            onClick={handleRevokeAll}
            className="gap-2"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Revoke All Access
          </Button>
        </div>
      </div>

      {/* Save Button */}
      <Button onClick={handleSave} disabled={saving} className="gap-2 bg-primary text-primary-foreground">
        <Save className="w-4 h-4" />
        <span>{saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save'}</span>
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
