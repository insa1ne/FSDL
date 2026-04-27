import React, { useState, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import { Calculator, SplitSquareHorizontal } from 'lucide-react';

const ipToBin = (ipStr) => {
  if (!ipStr) return '';
  const parts = ipStr.split('.');
  if (parts.length !== 4) return '';
  return parts.map(p => parseInt(p).toString(2).padStart(8, '0')).join('');
};

const binToIp = (binStr) => {
  return [
    parseInt(binStr.substring(0, 8), 2),
    parseInt(binStr.substring(8, 16), 2),
    parseInt(binStr.substring(16, 24), 2),
    parseInt(binStr.substring(24, 32), 2)
  ].join('.');
};

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
        firstHost: binToIp(firstHostBin),
        lastHost: binToIp(lastHostBin),
        hosts: numHosts,
        prefix: prefixInput
      };
    } catch {
      return null;
    }
  }, [ipInput, prefixInput]);

  const handleSplit = () => {
    if (prefixInput < 30) {
      setPrefixInput(prev => prev + 1);
    }
  };

  const renderOctets = (binStr, prefixLength) => {
    const octets = [
      binStr.substring(0, 8),
      binStr.substring(8, 16),
      binStr.substring(16, 24),
      binStr.substring(24, 32)
    ];

    const colors = [
      "text-accent-primary font-bold", 
      "text-emerald-400 font-bold", 
      "text-amber-400 font-bold", 
      "text-cyan-400 font-bold"
    ];

    let bitsCounted = 0;

    return (
      <div className="flex bg-surface-root p-4 rounded-lg font-mono text-lg border border-border-subtle relative">
        {octets.map((oct, i) => (
          <div key={i} className="flex flex-col relative mr-6 last:mr-0">
            <div className={colors[i]}>{parseInt(oct, 2).toString().padStart(3, '0')}</div>
            <div className="flex mt-1">
              {oct.split('').map((bit, j) => {
                const currentBitIndex = bitsCounted++;
                const isNetwork = currentBitIndex < prefixLength;
                
                return (
                  <span 
                    key={j} 
                    className={`\${isNetwork ? 'text-content-primary' : 'text-slate-600'} 
                      \${currentBitIndex === prefixLength - 1 ? 'border-r-2 border-red-500 mr-0.5 pr-0.5' : ''}`}
                  >
                    {bit}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
        {prefixLength > 0 && prefixLength < 32 && (
          <div className="absolute top-1 left-4 text-xs text-red-500 font-sans mt-1">
            Network / Host split
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex bg-surface-root min-h-screen text-content-primary">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-content-primary mb-2 flex items-center gap-3">
              <Calculator className="text-accent-primary" />
              Subnet Calculator
            </h1>
            <p className="text-content-secondary">Instantly derive network boundaries and host ranges using pure client-side bit manipulation.</p>
          </header>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-surface-panel border border-border-subtle p-6 rounded-2xl shadow-xl">
              <label className="block text-sm font-medium text-content-secondary mb-2">IP Address</label>
              <input 
                value={ipInput}
                onChange={e => setIpInput(e.target.value)}
                className="w-full bg-surface-root border border-border-subtle p-3 rounded-lg text-content-primary font-mono focus:border-indigo-500 outline-none"
              />
            </div>
            <div className="bg-surface-panel border border-border-subtle p-6 rounded-2xl shadow-xl">
              <label className="block text-sm font-medium text-content-secondary mb-2">Prefix Length (/{prefixInput})</label>
              <input 
                type="range"
                min="0" max="32"
                value={prefixInput}
                onChange={e => setPrefixInput(Number(e.target.value))}
                className="w-full mt-3 accent-indigo-500"
              />
              <div className="flex justify-between text-xs text-content-muted mt-2">
                <span>/0</span>
                <span>/16</span>
                <span>/32</span>
              </div>
            </div>
          </div>

          {calc ? (
            <div className="space-y-6">
              
              <div className="bg-surface-panel border border-border-subtle p-6 rounded-2xl shadow-xl">
                <h3 className="text-lg font-semibold text-content-primary mb-4">Binary Layout</h3>
                {renderOctets(calc.ipBin, calc.prefix)}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-surface-panel border border-border-subtle p-6 rounded-2xl shadow-xl space-y-4">
                  <div>
                    <div className="text-xs text-content-secondary uppercase tracking-widest font-bold">Network Address</div>
                    <div className="text-xl font-mono text-emerald-400">{calc.networkId}</div>
                  </div>
                  <div>
                    <div className="text-xs text-content-secondary uppercase tracking-widest font-bold">Broadcast Address</div>
                    <div className="text-xl font-mono text-amber-400">{calc.broadcast}</div>
                  </div>
                  <div>
                    <div className="text-xs text-content-secondary uppercase tracking-widest font-bold">Subnet Mask</div>
                    <div className="text-xl font-mono text-accent-primary">{calc.mask}</div>
                  </div>
                </div>

                <div className="bg-surface-panel border border-border-subtle p-6 rounded-2xl shadow-xl space-y-4 flex flex-col">
                  <div>
                    <div className="text-xs text-content-secondary uppercase tracking-widest font-bold">Usable Host Range</div>
                    <div className="text-lg font-mono text-cyan-400">
                      {calc.hosts > 0 ? `${calc.firstHost} — ${calc.lastHost}` : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-content-secondary uppercase tracking-widest font-bold">Total Usable Hosts</div>
                    <div className="text-2xl font-bold text-content-primary">{calc.hosts.toLocaleString()}</div>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-border-subtle">
                    <button 
                      onClick={handleSplit}
                      disabled={prefixInput >= 30}
                      className="flex items-center gap-2 w-full justify-center bg-accent-primary/20 hover:bg-accent-primary/30 text-accent-primary disabled:opacity-50 border border-indigo-500/30 px-4 py-2 rounded-lg transition-colors"
                    >
                      <SplitSquareHorizontal className="w-5 h-5" />
                      Split Subnet (+1 bit)
                    </button>
                    <p className="text-xs text-center text-content-muted mt-2">
                       Splitting creates two child subnets each with half the hosts.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-surface-panel/50 rounded-2xl border border-border-subtle text-content-secondary">
              Please enter a valid IPv4 address.
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default SubnetCalcPage;
