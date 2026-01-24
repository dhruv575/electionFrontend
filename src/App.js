import { useState, useMemo } from 'react';
import './App.css';
import electionData from './electionData.json';

function App() {
  const [activeTab, setActiveTab] = useState('explorer');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('combined_volume');
  const [sortDirection, setSortDirection] = useState('desc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredAndSortedData = useMemo(() => {
    let data = electionData.filter(row =>
      row.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    data.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (aVal === null) aVal = -Infinity;
      if (bVal === null) bVal = -Infinity;

      if (aVal === 'TRUE' || aVal === true) aVal = 1;
      if (aVal === 'FALSE' || aVal === false) aVal = 0;
      if (bVal === 'TRUE' || bVal === true) bVal = 1;
      if (bVal === 'FALSE' || bVal === false) bVal = 0;

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });

    return data;
  }, [searchTerm, sortField, sortDirection]);

  const formatProb = (prob) => {
    if (prob === null || prob === undefined) return '—';
    return (prob * 100).toFixed(1) + '%';
  };

  const formatVolume = (vol) => {
    if (vol >= 1e9) return '$' + (vol / 1e9).toFixed(2) + 'B';
    if (vol >= 1e6) return '$' + (vol / 1e6).toFixed(1) + 'M';
    if (vol >= 1e3) return '$' + (vol / 1e3).toFixed(0) + 'K';
    return '$' + vol.toFixed(0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return '—';
    }
  };

  const isDWon = (val) => val === 'TRUE' || val === true;

  // Compute statistics for visualizations
  const stats = useMemo(() => {
    const days = [7, 6, 5, 4, 3, 2, 1];
    const accuracy = {};
    const predictedDWins = {};
    let actualDWins = 0;
    let totalMarkets = 0;

    electionData.forEach(row => {
      const dWon = isDWon(row.d_won);
      if (dWon) actualDWins++;
      totalMarkets++;

      days.forEach(d => {
        const prob = row[`d_prob_${d}d`];
        if (prob !== null && prob !== undefined) {
          if (!accuracy[d]) accuracy[d] = { correct: 0, total: 0 };
          if (!predictedDWins[d]) predictedDWins[d] = 0;

          const predictedD = prob > 0.5;
          if (predictedD === dWon) accuracy[d].correct++;
          accuracy[d].total++;

          if (predictedD) predictedDWins[d]++;
        }
      });
    });

    const accuracyByDay = days.map(d => ({
      day: d,
      accuracy: accuracy[d] ? (accuracy[d].correct / accuracy[d].total * 100) : null,
      correct: accuracy[d]?.correct || 0,
      total: accuracy[d]?.total || 0,
    }));

    const winRates = days.map(d => ({
      day: d,
      predicted: predictedDWins[d] ? (predictedDWins[d] / (accuracy[d]?.total || 1) * 100) : null,
      actual: (actualDWins / totalMarkets * 100),
    }));

    return { accuracyByDay, winRates, actualDWins, totalMarkets };
  }, []);

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <span style={{ opacity: 0.3 }}>↕</span>;
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const headerStyle = {
    padding: '10px 8px',
    textAlign: 'center',
    fontWeight: 600,
    fontSize: '12px',
    cursor: 'pointer',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    borderBottom: '2px solid #333',
  };

  const cellStyle = {
    padding: '8px',
    textAlign: 'center',
    fontSize: '13px',
    borderBottom: '1px solid #eee',
  };

  const tabStyle = (isActive) => ({
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: 600,
    border: 'none',
    borderBottom: isActive ? '3px solid #3b82f6' : '3px solid transparent',
    background: 'none',
    color: isActive ? '#3b82f6' : '#666',
    cursor: 'pointer',
    marginRight: '8px',
  });

  // Failed predictions data
  const failedPredictions7d = [
    { name: 'Who will win the popular vote?', prob: '57.0%', actual: 'R', error: 'Predicted D, R won', volume: '$283.7M' },
    { name: 'Who will win Pennsylvania in the US Senate Election?', prob: '69.0%', actual: 'R', error: 'Predicted D, R won', volume: '$4.9M' },
    { name: 'Who will win the 2025 Virginia Attorney General election?', prob: '41.5%', actual: 'D', error: 'Predicted R, D won', volume: '$2.6M' },
  ];

  const failedPredictions1d = [
    { name: 'Who will win the popular vote?', prob: '74.2%', actual: 'R', error: 'Predicted D, R won', volume: '$283.7M' },
    { name: 'Who will win Michigan in the Presidential Election?', prob: '59.5%', actual: 'R', error: 'Predicted D, R won', volume: '$18.8M' },
    { name: 'Who will win Wisconsin in the Presidential Election?', prob: '58.5%', actual: 'R', error: 'Predicted D, R won', volume: '$9.3M' },
    { name: 'House control after 2024 election?', prob: '53.5%', actual: 'R', error: 'Predicted D, R won', volume: '$8.0M' },
    { name: 'Who will win Pennsylvania in the US Senate Election?', prob: '77.8%', actual: 'R', error: 'Predicted D, R won', volume: '$4.9M' },
    { name: 'Who will win the 2025 Virginia Attorney General election?', prob: '44.0%', actual: 'D', error: 'Predicted R, D won', volume: '$2.6M' },
  ];

  return (
    <div style={{
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      backgroundColor: '#fff',
      minHeight: '100vh',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
          <img src="/logo.png" alt="Logo" style={{ height: '40px', width: 'auto' }} />
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1a1a1a', margin: 0 }}>
            Polymarket Election Data
          </h1>
        </div>
        <p style={{ fontSize: '13px', color: '#666', margin: '0 0 16px 0' }}>
          Data and code available on{' '}
          <a
            href="https://github.com/dhruv575/electionFetchingCode"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 500 }}
          >
            GitHub
          </a>
        </p>

        {/* Tabs */}
        <div style={{ borderBottom: '1px solid #eee', marginBottom: '24px' }}>
          <button style={tabStyle(activeTab === 'explorer')} onClick={() => setActiveTab('explorer')}>
            Data Explorer
          </button>
          <button style={tabStyle(activeTab === 'visualizations')} onClick={() => setActiveTab('visualizations')}>
            Visualizations
          </button>
        </div>

        {/* Explorer Tab */}
        {activeTab === 'explorer' && (
          <div>
            <p style={{ fontSize: '14px', color: '#666', margin: '0 0 20px 0' }}>
              {filteredAndSortedData.length} markets • Click headers to sort
            </p>

            <input
              type="text"
              placeholder="Search markets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '300px',
                padding: '10px 14px',
                fontSize: '14px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                marginBottom: '20px',
                outline: 'none',
              }}
            />

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1300px' }}>
                <thead>
                  <tr style={{ background: '#1a1a1a', color: '#fff' }}>
                    <th style={{ ...headerStyle, textAlign: 'left', minWidth: '250px' }} onClick={() => handleSort('name')}>
                      Market <SortIcon field="name" />
                    </th>
                    <th style={{ ...headerStyle, width: '70px' }} onClick={() => handleSort('d_prob_7d')}>
                      7d <SortIcon field="d_prob_7d" />
                    </th>
                    <th style={{ ...headerStyle, width: '70px' }} onClick={() => handleSort('d_prob_6d')}>
                      6d <SortIcon field="d_prob_6d" />
                    </th>
                    <th style={{ ...headerStyle, width: '70px' }} onClick={() => handleSort('d_prob_5d')}>
                      5d <SortIcon field="d_prob_5d" />
                    </th>
                    <th style={{ ...headerStyle, width: '70px' }} onClick={() => handleSort('d_prob_4d')}>
                      4d <SortIcon field="d_prob_4d" />
                    </th>
                    <th style={{ ...headerStyle, width: '70px' }} onClick={() => handleSort('d_prob_3d')}>
                      3d <SortIcon field="d_prob_3d" />
                    </th>
                    <th style={{ ...headerStyle, width: '70px' }} onClick={() => handleSort('d_prob_2d')}>
                      2d <SortIcon field="d_prob_2d" />
                    </th>
                    <th style={{ ...headerStyle, width: '70px' }} onClick={() => handleSort('d_prob_1d')}>
                      1d <SortIcon field="d_prob_1d" />
                    </th>
                    <th style={{ ...headerStyle, width: '60px' }} onClick={() => handleSort('d_won')}>
                      Won <SortIcon field="d_won" />
                    </th>
                    <th style={{ ...headerStyle, width: '100px' }} onClick={() => handleSort('resolution_date')}>
                      Resolved <SortIcon field="resolution_date" />
                    </th>
                    <th style={{ ...headerStyle, width: '90px' }} onClick={() => handleSort('combined_volume')}>
                      Volume <SortIcon field="combined_volume" />
                    </th>
                    <th style={{ ...headerStyle, width: '80px' }}>
                      Links
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedData.map((row, idx) => {
                    const dWon = isDWon(row.d_won);
                    const predicted7d = row.d_prob_7d > 0.5 ? 'D' : 'R';
                    const predicted1d = row.d_prob_1d > 0.5 ? 'D' : 'R';
                    const actual = dWon ? 'D' : 'R';
                    const correct7d = predicted7d === actual;
                    const correct1d = predicted1d === actual;

                    return (
                      <tr key={idx} style={{ background: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                        <td style={{ ...cellStyle, textAlign: 'left', color: '#1a1a1a' }}>
                          {row.name}
                        </td>
                        <td style={{
                          ...cellStyle,
                          color: row.d_prob_7d > 0.5 ? '#3b82f6' : '#e74c3c',
                          fontWeight: 500,
                          background: correct7d ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'
                        }}>
                          {formatProb(row.d_prob_7d)}
                        </td>
                        <td style={{ ...cellStyle, color: row.d_prob_6d > 0.5 ? '#3b82f6' : '#e74c3c' }}>
                          {formatProb(row.d_prob_6d)}
                        </td>
                        <td style={{ ...cellStyle, color: row.d_prob_5d > 0.5 ? '#3b82f6' : '#e74c3c' }}>
                          {formatProb(row.d_prob_5d)}
                        </td>
                        <td style={{ ...cellStyle, color: row.d_prob_4d > 0.5 ? '#3b82f6' : '#e74c3c' }}>
                          {formatProb(row.d_prob_4d)}
                        </td>
                        <td style={{ ...cellStyle, color: row.d_prob_3d > 0.5 ? '#3b82f6' : '#e74c3c' }}>
                          {formatProb(row.d_prob_3d)}
                        </td>
                        <td style={{ ...cellStyle, color: row.d_prob_2d > 0.5 ? '#3b82f6' : '#e74c3c' }}>
                          {formatProb(row.d_prob_2d)}
                        </td>
                        <td style={{
                          ...cellStyle,
                          color: row.d_prob_1d > 0.5 ? '#3b82f6' : '#e74c3c',
                          fontWeight: 500,
                          background: correct1d ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'
                        }}>
                          {formatProb(row.d_prob_1d)}
                        </td>
                        <td style={{
                          ...cellStyle,
                          fontWeight: 700,
                          color: dWon ? '#3b82f6' : '#e74c3c'
                        }}>
                          {dWon ? 'D' : 'R'}
                        </td>
                        <td style={{ ...cellStyle, color: '#666', fontSize: '12px' }}>
                          {formatDate(row.resolution_date)}
                        </td>
                        <td style={{ ...cellStyle, color: '#666' }}>
                          {formatVolume(row.combined_volume)}
                        </td>
                        <td style={{ ...cellStyle }}>
                          {row.d_market_slug && (
                            <a
                              href={`https://polymarket.com/market/${row.d_market_slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'inline-block',
                                padding: '4px 8px',
                                fontSize: '11px',
                                fontWeight: 600,
                                color: '#fff',
                                background: '#3b82f6',
                                borderRadius: '4px',
                                textDecoration: 'none',
                                marginRight: '4px',
                              }}
                            >
                              D
                            </a>
                          )}
                          {row.r_market_slug && (
                            <a
                              href={`https://polymarket.com/market/${row.r_market_slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'inline-block',
                                padding: '4px 8px',
                                fontSize: '11px',
                                fontWeight: 600,
                                color: '#fff',
                                background: '#e74c3c',
                                borderRadius: '4px',
                                textDecoration: 'none',
                              }}
                            >
                              R
                            </a>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
              <strong>Legend:</strong> Probabilities show Democrat win chance.
              <span style={{ color: '#3b82f6', fontWeight: 600 }}> Blue = &gt;50% D</span>,
              <span style={{ color: '#e74c3c', fontWeight: 600 }}> Red = &gt;50% R</span>.
              Green background = correct prediction, red background = incorrect.
            </div>
          </div>
        )}

        {/* Visualizations Tab */}
        {activeTab === 'visualizations' && (
          <div>
            {/* Confusion Matrices */}
            <div style={{ maxWidth: '1000px', margin: '0 auto 60px auto' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#1a1a1a', margin: '0 0 4px 0', textAlign: 'center' }}>
                How accurate were the prediction markets?
              </h2>
              <p style={{ fontSize: '14px', color: '#666', margin: '0 0 32px 0', textAlign: 'center' }}>
                7 days before election (left) vs 1 day before election (right) • 80 markets total
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: '40px' }}>
                {/* 7-Day Confusion Matrix */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 0 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingRight: '12px', gap: '8px' }}>
                      <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <span style={{ fontSize: '12px', color: '#1a1a1a', textAlign: 'right', lineHeight: 1.3 }}>Republican<br/>Actually Won</span>
                      </div>
                      <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <span style={{ fontSize: '12px', color: '#1a1a1a', textAlign: 'right', lineHeight: 1.3 }}>Democrat<br/>Actually Won</span>
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <div style={{ width: '120px', textAlign: 'center', fontSize: '12px', color: '#1a1a1a', lineHeight: 1.3 }}>
                          Predicted<br/>Republican Win
                        </div>
                        <div style={{ width: '120px', textAlign: 'center', fontSize: '12px', color: '#1a1a1a', lineHeight: 1.3 }}>
                          Predicted<br/>Democrat Win
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <div style={{ width: '120px', height: '120px', background: 'rgba(52, 152, 219, 0.95)', borderRadius: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: '32px', fontWeight: 700, color: 'white' }}>46</span>
                          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)' }}>57.5%</span>
                        </div>
                        <div style={{ width: '120px', height: '120px', background: 'rgba(52, 152, 219, 0.25)', borderRadius: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: '32px', fontWeight: 700, color: '#1a1a1a' }}>2</span>
                          <span style={{ fontSize: '13px', color: '#1a1a1a' }}>2.5%</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <div style={{ width: '120px', height: '120px', background: 'rgba(52, 152, 219, 0.25)', borderRadius: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: '32px', fontWeight: 700, color: '#1a1a1a' }}>1</span>
                          <span style={{ fontSize: '13px', color: '#1a1a1a' }}>1.2%</span>
                        </div>
                        <div style={{ width: '120px', height: '120px', background: 'rgba(52, 152, 219, 0.7)', borderRadius: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: '32px', fontWeight: 700, color: 'white' }}>31</span>
                          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)' }}>38.8%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: '14px', color: '#1a1a1a', textAlign: 'center', marginTop: '12px', fontWeight: 600 }}>
                    7 days before • 96.2% accuracy
                  </p>
                </div>

                <div style={{ width: '1px', background: '#e0e0e0', alignSelf: 'stretch' }}></div>

                {/* 1-Day Confusion Matrix */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 0 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingRight: '12px', gap: '8px' }}>
                      <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <span style={{ fontSize: '12px', color: '#1a1a1a', textAlign: 'right', lineHeight: 1.3 }}>Republican<br/>Actually Won</span>
                      </div>
                      <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <span style={{ fontSize: '12px', color: '#1a1a1a', textAlign: 'right', lineHeight: 1.3 }}>Democrat<br/>Actually Won</span>
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <div style={{ width: '120px', textAlign: 'center', fontSize: '12px', color: '#1a1a1a', lineHeight: 1.3 }}>
                          Predicted<br/>Republican Win
                        </div>
                        <div style={{ width: '120px', textAlign: 'center', fontSize: '12px', color: '#1a1a1a', lineHeight: 1.3 }}>
                          Predicted<br/>Democrat Win
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <div style={{ width: '120px', height: '120px', background: 'rgba(231, 76, 60, 0.9)', borderRadius: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: '32px', fontWeight: 700, color: 'white' }}>43</span>
                          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)' }}>53.8%</span>
                        </div>
                        <div style={{ width: '120px', height: '120px', background: 'rgba(231, 76, 60, 0.3)', borderRadius: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: '32px', fontWeight: 700, color: '#1a1a1a' }}>5</span>
                          <span style={{ fontSize: '13px', color: '#1a1a1a' }}>6.2%</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <div style={{ width: '120px', height: '120px', background: 'rgba(231, 76, 60, 0.2)', borderRadius: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: '32px', fontWeight: 700, color: '#1a1a1a' }}>1</span>
                          <span style={{ fontSize: '13px', color: '#1a1a1a' }}>1.2%</span>
                        </div>
                        <div style={{ width: '120px', height: '120px', background: 'rgba(231, 76, 60, 0.7)', borderRadius: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: '32px', fontWeight: 700, color: 'white' }}>31</span>
                          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)' }}>38.8%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: '14px', color: '#1a1a1a', textAlign: 'center', marginTop: '12px', fontWeight: 600 }}>
                    1 day before • 92.5% accuracy
                  </p>
                </div>
              </div>
            </div>

            {/* Failed Predictions Tables */}
            <div style={{ maxWidth: '800px', margin: '0 auto 60px auto' }}>
              <div style={{ marginBottom: '48px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a1a', margin: '0 0 16px 0' }}>
                  Failed Predictions - 7 Days Before Election
                </h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ background: '#3498db', color: 'white' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Market</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, width: '80px' }}>D Prob</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, width: '60px' }}>Actual</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Error Type</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, width: '80px' }}>Volume</th>
                    </tr>
                  </thead>
                  <tbody>
                    {failedPredictions7d.map((row, idx) => (
                      <tr key={idx} style={{ background: idx % 2 === 0 ? '#fff' : '#f8f9fa' }}>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #eee', color: '#1a1a1a' }}>{row.name}</td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #eee', textAlign: 'center', color: '#1a1a1a' }}>{row.prob}</td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #eee', textAlign: 'center', color: row.actual === 'R' ? '#e74c3c' : '#3b82f6', fontWeight: 600 }}>{row.actual}</td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #eee', color: '#1a1a1a' }}>{row.error}</td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #eee', textAlign: 'right', color: '#1a1a1a' }}>{row.volume}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a1a', margin: '0 0 16px 0' }}>
                  Failed Predictions - 1 Day Before Election
                </h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ background: '#e74c3c', color: 'white' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Market</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, width: '80px' }}>D Prob</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, width: '60px' }}>Actual</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Error Type</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, width: '80px' }}>Volume</th>
                    </tr>
                  </thead>
                  <tbody>
                    {failedPredictions1d.map((row, idx) => (
                      <tr key={idx} style={{ background: idx % 2 === 0 ? '#fff' : '#f8f9fa' }}>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #eee', color: '#1a1a1a' }}>{row.name}</td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #eee', textAlign: 'center', color: '#1a1a1a' }}>{row.prob}</td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #eee', textAlign: 'center', color: row.actual === 'R' ? '#e74c3c' : '#3b82f6', fontWeight: 600 }}>{row.actual}</td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #eee', color: '#1a1a1a' }}>{row.error}</td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #eee', textAlign: 'right', color: '#1a1a1a' }}>{row.volume}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Directional Bias Chart */}
            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px 0' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1a1a1a', margin: '0 0 4px 0', textAlign: 'left' }}>
                How biased were the prediction markets?
              </h2>
              <p style={{ fontSize: '14px', color: '#666', margin: '0 0 32px 0' }}>
                Directional bias in percentage points (positive = overestimated Democrat chances)
              </p>

              <div style={{ marginLeft: '120px' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', height: '40px', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-120px', width: '110px', textAlign: 'right', fontSize: '14px', color: '#1a1a1a', fontWeight: 500 }}>
                    7 Days Before
                  </div>
                  <div style={{ width: '150px', height: '32px', display: 'flex', justifyContent: 'flex-end' }}></div>
                  <div style={{ width: '2px', height: '32px', background: '#333' }}></div>
                  <div style={{ width: '54px', height: '32px', background: '#3498db', borderRadius: '0 4px 4px 0' }}></div>
                  <div style={{ marginLeft: '8px', fontSize: '16px', fontWeight: 700, color: '#1a1a1a' }}>+3.6pp</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px', height: '40px', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-120px', width: '110px', textAlign: 'right', fontSize: '14px', color: '#1a1a1a', fontWeight: 500 }}>
                    1 Day Before
                  </div>
                  <div style={{ width: '150px', height: '32px', display: 'flex', justifyContent: 'flex-end' }}></div>
                  <div style={{ width: '2px', height: '32px', background: '#333' }}></div>
                  <div style={{ width: '95px', height: '32px', background: '#e74c3c', borderRadius: '0 4px 4px 0' }}></div>
                  <div style={{ marginLeft: '8px', fontSize: '16px', fontWeight: 700, color: '#1a1a1a' }}>+6.3pp</div>
                </div>

                <div style={{ display: 'flex', borderTop: '1px solid #eee', paddingTop: '8px' }}>
                  <div style={{ width: '150px', textAlign: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#666' }}>← Pro-Republican</span><br/>
                    <span style={{ fontSize: '11px', color: '#999' }}>(underestimated Democrats)</span>
                  </div>
                  <div style={{ width: '2px' }}></div>
                  <div style={{ width: '150px', textAlign: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#666' }}>Pro-Democrat →</span><br/>
                    <span style={{ fontSize: '11px', color: '#999' }}>(overestimated Democrats)</span>
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '13px', color: '#666', marginTop: '24px', lineHeight: 1.5 }}>
                <strong>Interpretation:</strong> Markets overestimated Democrat chances by ~3.6 percentage points a week out,
                increasing to ~6.3 percentage points the day before the election.
              </p>
            </div>

            {/* Accuracy Over Time Chart */}
            <div style={{ maxWidth: '700px', margin: '60px auto', padding: '24px 0' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1a1a1a', margin: '0 0 4px 0', textAlign: 'left' }}>
                Prediction Accuracy Over Time
              </h2>
              <p style={{ fontSize: '14px', color: '#666', margin: '0 0 32px 0' }}>
                How accurate were markets at each point before resolution?
              </p>

              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '200px', padding: '0 20px', borderBottom: '2px solid #333' }}>
                {stats.accuracyByDay.map((d, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#1a1a1a', marginBottom: '4px' }}>
                      {d.accuracy ? d.accuracy.toFixed(1) + '%' : '—'}
                    </span>
                    <div
                      style={{
                        width: '50px',
                        height: d.accuracy ? `${(d.accuracy - 80) * 6}px` : '0px',
                        background: d.day === 7 ? '#3498db' : d.day === 1 ? '#e74c3c' : '#95a5a6',
                        borderRadius: '4px 4px 0 0',
                        minHeight: d.accuracy ? '20px' : '0',
                      }}
                    />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 20px' }}>
                {stats.accuracyByDay.map((d, idx) => (
                  <div key={idx} style={{ flex: 1, textAlign: 'center', fontSize: '13px', color: '#666' }}>
                    {d.day}d
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '12px', color: '#666', textAlign: 'center', marginTop: '8px' }}>
                Days before market resolution
              </p>
            </div>

            {/* Predicted vs Actual D Win Rate */}
            <div style={{ maxWidth: '600px', margin: '60px auto', padding: '24px 0' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1a1a1a', margin: '0 0 4px 0', textAlign: 'left' }}>
                Predicted vs Actual Democrat Win Rate
              </h2>
              <p style={{ fontSize: '14px', color: '#666', margin: '0 0 32px 0' }}>
                What percentage of races did markets predict Democrats would win vs actually won?
              </p>

              <div style={{ display: 'flex', gap: '40px', justifyContent: 'center' }}>
                {/* 7 Days Before */}
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a', margin: '0 0 16px 0' }}>7 Days Before</p>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', height: '150px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>
                        {stats.winRates[0]?.predicted?.toFixed(1)}%
                      </span>
                      <div style={{
                        width: '60px',
                        height: `${(stats.winRates[0]?.predicted || 0) * 1.5}px`,
                        background: '#3b82f6',
                        borderRadius: '4px 4px 0 0',
                      }} />
                      <span style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>Predicted</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>
                        {stats.winRates[0]?.actual?.toFixed(1)}%
                      </span>
                      <div style={{
                        width: '60px',
                        height: `${(stats.winRates[0]?.actual || 0) * 1.5}px`,
                        background: '#22c55e',
                        borderRadius: '4px 4px 0 0',
                      }} />
                      <span style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>Actual</span>
                    </div>
                  </div>
                </div>

                <div style={{ width: '1px', background: '#e0e0e0' }} />

                {/* 1 Day Before */}
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a', margin: '0 0 16px 0' }}>1 Day Before</p>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', height: '150px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>
                        {stats.winRates[6]?.predicted?.toFixed(1)}%
                      </span>
                      <div style={{
                        width: '60px',
                        height: `${(stats.winRates[6]?.predicted || 0) * 1.5}px`,
                        background: '#3b82f6',
                        borderRadius: '4px 4px 0 0',
                      }} />
                      <span style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>Predicted</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>
                        {stats.winRates[6]?.actual?.toFixed(1)}%
                      </span>
                      <div style={{
                        width: '60px',
                        height: `${(stats.winRates[6]?.actual || 0) * 1.5}px`,
                        background: '#22c55e',
                        borderRadius: '4px 4px 0 0',
                      }} />
                      <span style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>Actual</span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '16px', height: '16px', background: '#3b82f6', borderRadius: '2px' }} />
                  <span style={{ fontSize: '13px', color: '#666' }}>Predicted D Win Rate</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '16px', height: '16px', background: '#22c55e', borderRadius: '2px' }} />
                  <span style={{ fontSize: '13px', color: '#666' }}>Actual D Win Rate</span>
                </div>
              </div>

              <p style={{ fontSize: '13px', color: '#666', marginTop: '24px', lineHeight: 1.5 }}>
                <strong>Interpretation:</strong> Markets predicted Democrats would win more races than they actually did,
                consistent with the pro-Democrat bias observed in the directional analysis above.
              </p>
            </div>

            {/* Summary Stats */}
            <div style={{ maxWidth: '600px', margin: '60px auto', padding: '24px', background: '#f8f9fa', borderRadius: '8px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a1a', margin: '0 0 16px 0' }}>
                Dataset Summary
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: '#1a1a1a' }}>{stats.totalMarkets}</div>
                  <div style={{ fontSize: '13px', color: '#666' }}>Total Markets</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: '#3b82f6' }}>{stats.actualDWins}</div>
                  <div style={{ fontSize: '13px', color: '#666' }}>Democrat Wins</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: '#e74c3c' }}>{stats.totalMarkets - stats.actualDWins}</div>
                  <div style={{ fontSize: '13px', color: '#666' }}>Republican Wins</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
