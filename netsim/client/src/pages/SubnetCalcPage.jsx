import React, { useState, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import { SplitSquareHorizontal } from 'lucide-react';

/* ─── Utility: IP ↔ Binary helpers (unchanged logic) ──────────────────── */
const ipToBin = (ipStr) => {
  if (!ipStr) return '';
  const parts = ipStr.split('.');
  if (parts.length !== 4) return '';
  return parts.map(p => parseInt(p).toString(2).padStart(8, '0')).join('');
};
const binToIp = (binStr) => [
  parseInt(binStr.substring(0, 8), 2),
  parseInt(binStr.substring(8, 16), 2),
  parseInt(binStr.substring(16, 24), 2),
  parseInt(binStr.substring(24, 32), 2),
].join('.');

const sgFont = { fontFamily: "'Space Grotesk', sans-serif" };

const SubnetCalcPage = () => {
  const [ipInput, setIpInput] = useState('192.168.1.0');
  const [prefixInput, setPrefixInput] = useState(24);

  const calc = useMemo(() => {
    try {
      const parts = ipInput.split('.').map(Number);
      if (parts.length !== 4 || parts.some(isNaN) || parts.some(p => p < 0 || p > 255)) return null;
      if (prefixInput < 0 || prefixInput > 32) return null;

      const ipBin = ipToBin(ipInput);
      const networkBin = ipBin.substring(0, prefixInput) + '0'.repeat(32 - prefixInput);
      const broadcastBin = ipBin.substring(0, prefixInput) + '1'.repeat(32 - prefixInput);
      const maskBin = '1'.repeat(prefixInput) + '0'.repeat(32 - prefixInput);
      const firstHostBin = networkBin.substring(0, 31) + '1';
      const lastHostBin = broadcastBin.substring(0, 31) + '0';
      const numHosts = Math.max(0, Math.pow(2, 32 - prefixInput) - 2);
      return {
        ipBin,
        networkId: binToIp(networkBin),
        broadcast: binToIp(broadcastBin),
        mask: binToIp(maskBin),
        wildcard: binToIp('0'.repeat(prefixInput) + '1'.repeat(32 - prefixInput)),
        firstHost: binToIp(firstHostBin),
        lastHost: binToIp(lastHostBin),
        hosts: numHosts,
        prefix: prefixInput,
      };
    } catch { return null; }
  }, [ipInput, prefixInput]);

  /* Binary octets renderer — Stitch style */
  const renderOctets = (binStr, prefixLength, colorVar = 'var(--accent-primary)', dimColor = 'var(--content-secondary)') => {
    const octets = [
      binStr.substring(0, 8),
      binStr.substring(8, 16),
      binStr.substring(16, 24),
      binStr.substring(24, 32),
    ];
    let bitsCounted = 0;
    return (
      <div className="flex gap-2 flex-wrap font-mono text-sm">
        {octets.map((oct, i) => (
          <React.Fragment key={i}>
            <div className="flex gap-px">
              {oct.split('').map((bit, j) => {
                const idx = bitsCounted++;
                const isNetwork = idx < prefixLength;
                return (
                  <span key={j}
                    style={{
                      color: isNetwork ? colorVar : dimColor,
                      borderRight: idx === prefixLength - 1 ? '2px solid var(--accent-hover)' : undefined,
                      paddingRight: idx === prefixLength - 1 ? 2 : undefined,
                      marginRight: idx === prefixLength - 1 ? 2 : undefined,
                    }}>
                    {bit}
                  </span>
                );
              })}
            </div>
            {i < 3 && <span style={{ color: 'var(--border-default)' }}>.</span>}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const StatCard = ({ label, value, color = 'var(--accent-primary)' }) => (
    <div className="p-4 rounded-lg relative overflow-hidden group"
      style={{ background: 'var(--surface-hover)', border: '1px solid var(--border-subtle)' }}>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: `rgba(183,109,255,0.04)` }} />
      <div className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--border-default)', ...sgFont }}>
        {label}
      </div>
      <div className="font-mono text-sm font-medium" style={{ color }}>{value}</div>
    </div>
  );

  return (
    <div className="flex min-h-screen" style={{ background: 'transparent' }}>
      <Sidebar />
      <main className="ml-64 flex-1 p-16 max-w-7xl">
        {/* Header */}
        <header className="mb-12">
          <h1 className="text-3xl font-semibold mb-1" style={{ ...sgFont, color: 'var(--accent-primary)', letterSpacing: '-0.02em' }}>
            Subnet Calculator
          </h1>
          <p className="text-sm" style={{ color: 'var(--content-secondary)' }}>
            Advanced CIDR routing analysis and binary visualization tool for network topology planning.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ── Input Panel ── */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-panel rounded-xl p-6">
              <label className="block text-xs font-medium mb-2 uppercase tracking-wider"
                style={{ color: 'var(--accent-primary)', ...sgFont }}>
                Network Address
              </label>
              <input
                type="text"
                value={ipInput}
                onChange={e => setIpInput(e.target.value)}
                className="w-full px-4 py-2.5 text-sm rounded-lg mb-6 font-mono"
                style={{ background: 'var(--surface-panel)', border: '1px solid var(--border-default)', color: 'var(--content-primary)' }}
              />

              <label className="block text-xs font-medium mb-3 uppercase tracking-wider"
                style={{ color: 'var(--accent-primary)', ...sgFont }}>
                CIDR Prefix &nbsp;
                <span className="font-mono px-2 py-0.5 rounded ml-1"
                  style={{ background: 'rgba(183,109,255,0.1)', color: 'var(--accent-primary)' }}>
                  /{prefixInput}
                </span>
              </label>
              <div className="flex items-center gap-3 mb-6">
                <input type="range" min="0" max="32"
                  value={prefixInput}
                  onChange={e => setPrefixInput(Number(e.target.value))}
                  className="flex-1" style={{ accentColor: 'var(--accent-primary)' }}
                />
              </div>

              {calc && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)' }}>
                    <div className="text-xs mb-1" style={{ color: 'var(--border-default)', ...sgFont }}>Subnet Mask</div>
                    <div className="font-mono text-xs" style={{ color: 'var(--content-primary)' }}>{calc.mask}</div>
                  </div>
                  <div className="p-3 rounded-lg" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)' }}>
                    <div className="text-xs mb-1" style={{ color: 'var(--border-default)', ...sgFont }}>Wildcard</div>
                    <div className="font-mono text-xs" style={{ color: 'var(--content-primary)' }}>{calc.wildcard}</div>
                  </div>
                </div>
              )}

              <div className="mt-5 pt-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                <button
                  onClick={() => prefixInput < 30 && setPrefixInput(p => p + 1)}
                  disabled={prefixInput >= 30}
                  className="flex items-center gap-2 w-full justify-center text-sm py-2 rounded-lg border transition-all disabled:opacity-40"
                  style={{ ...sgFont, color: 'var(--accent-primary)', borderColor: 'rgba(183,109,255,0.3)', background: 'rgba(183,109,255,0.08)' }}
                  onMouseEnter={e => !e.currentTarget.disabled && (e.currentTarget.style.background = 'rgba(183,109,255,0.15)')}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(183,109,255,0.08)'}>
                  <SplitSquareHorizontal className="w-4 h-4" />
                  Split Subnet (+1 bit)
                </button>
                <p className="text-xs text-center mt-2" style={{ color: 'var(--content-muted)' }}>
                  Creates two subnets each with half the hosts.
                </p>
              </div>
            </div>
          </div>

          {/* ── Analysis Panel ── */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {calc ? (
              <>
                {/* Network Details */}
                <div className="glass-panel rounded-xl p-6">
                  <h3 className="text-base font-semibold mb-5 flex items-center gap-2" style={{ ...sgFont, color: 'var(--content-primary)' }}>
                    <span className="material-symbols-outlined text-lg" style={{ color: 'var(--accent-primary)', fontSize: 20 }}>data_object</span>
                    Network Details
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard label="Network IP"   value={calc.networkId}  color="var(--accent-primary)" />
                    <StatCard label="Broadcast IP"  value={calc.broadcast}  color="var(--accent-hover)" />
                    <StatCard label="Total Hosts"   value={Math.pow(2, 32-prefixInput).toLocaleString()} color="var(--accent-primary)" />
                    <StatCard label="Usable Hosts"  value={calc.hosts.toLocaleString()} color="var(--content-primary)" />
                  </div>
                  <div className="mt-4 flex justify-between items-center p-4 rounded-lg"
                    style={{ background: 'var(--surface-hover)', border: '1px solid var(--border-subtle)' }}>
                    <div>
                      <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--border-default)', ...sgFont }}>Host Range</div>
                      <div className="font-mono text-sm" style={{ color: 'var(--content-primary)' }}>
                        {calc.hosts > 0 ? `${calc.firstHost} — ${calc.lastHost}` : 'No usable hosts'}
                      </div>
                    </div>
                    <button onClick={() => navigator.clipboard?.writeText(`${calc.firstHost} - ${calc.lastHost}`)}
                      style={{ color: 'var(--accent-primary)' }} className="transition-colors hover:opacity-70">
                      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>content_copy</span>
                    </button>
                  </div>
                </div>

                {/* Binary Map */}
                <div className="glass-panel rounded-xl p-6">
                  <h3 className="text-base font-semibold mb-5 flex items-center gap-2" style={{ ...sgFont, color: 'var(--content-primary)' }}>
                    <span className="material-symbols-outlined text-lg" style={{ color: 'var(--accent-hover)', fontSize: 20 }}>code_blocks</span>
                    Binary Map
                  </h3>
                  <div className="flex flex-col gap-4">
                    <div>
                      <div className="text-xs mb-2 uppercase tracking-wider" style={{ color: 'var(--border-default)', ...sgFont }}>IP Address</div>
                      {renderOctets(calc.ipBin, calc.prefix, 'var(--accent-primary)', 'var(--content-secondary)')}
                    </div>
                    <div>
                      <div className="text-xs mb-2 uppercase tracking-wider" style={{ color: 'var(--border-default)', ...sgFont }}>Subnet Mask</div>
                      {renderOctets(ipToBin(calc.mask), calc.prefix, 'var(--accent-hover)', 'var(--border-default)')}
                    </div>
                    <div className="relative h-6 mt-1">
                      <div className="absolute top-1/2 left-0 w-full h-px" style={{ background: 'var(--border-subtle)' }} />
                      <div className="absolute top-0 bottom-0 w-0.5 shadow-md"
                        style={{ left: `calc(${(calc.prefix / 32) * 100}%)`, background: 'var(--accent-hover)', boxShadow: '0 0 8px rgba(183,109,255,0.4)' }} />
                      <span className="absolute top-0 text-xs font-mono"
                        style={{ left: `calc(${(calc.prefix / 32) * 100}% + 8px)`, color: 'var(--accent-hover)', ...sgFont, fontSize: 10 }}>
                        Network | Host
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="glass-panel rounded-xl flex items-center justify-center p-16 text-center"
                style={{ color: 'var(--content-muted)', ...sgFont }}>
                Please enter a valid IPv4 address to calculate subnet details.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SubnetCalcPage;
