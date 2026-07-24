import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Login } from './Login';
import { MapChart } from '../components/MapChart';
import '../styles/dashboard.css';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { Eye, Users, MousePointerClick, ShoppingBag, ArrowUpRight, MoreHorizontal, Calendar, Filter, RefreshCw, Download } from 'lucide-react';

const COLORS = ['#4318ff', '#6ad2ff', '#e2e8f0', '#05cd99', '#ffb547'];
const LANG_COLORS = ['#4318ff', '#6ad2ff', '#05cd99', '#ffb547', '#ff6b6b'];

export const Dashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [data, setData] = useState({ responses: [], mapping: [] });
  const [loading, setLoading] = useState(true);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  
  const [filters, setFilters] = useState({
    region: '', territory: '', tsm: '', state: '', district: '', crop: '', product: '', language: '', startDate: '', endDate: ''
  });

  useEffect(() => {
    if (!isLoggedIn) return;
    fetchData();
  }, [isLoggedIn]);

  const fetchData = async () => {
    setLoading(true);
    const [responsesRes, mappingRes] = await Promise.all([
      supabase.from('responses').select('*').order('created_at', { ascending: false }),
      supabase.from('tsm_mapping').select('*')
    ]);

    setData({
      responses: responsesRes.data || [],
      mapping: mappingRes.data || []
    });
    setLoading(false);
  };

  const normalizeTSM = (name) => {
    if (!name) return '';
    return name.replace(/-/g, ' ').trim().toLowerCase();
  };

  const enrichedResponses = useMemo(() => {
    const tsmMap = {};
    data.mapping.forEach(m => {
      if (m.tsm_name) tsmMap[normalizeTSM(m.tsm_name)] = m;
    });

    return data.responses.map(r => {
      const tsmInfo = tsmMap[normalizeTSM(r.tsm_name)] || { territory: 'Unknown', region: 'Unknown' };
      return { 
        ...r, 
        ...tsmInfo, 
        tsm_name_display: (r.tsm_name || '').replace(/-/g, ' '),
        real_product: r.product === 'Others' ? r.other_product : r.product,
        date_obj: new Date(r.created_at)
      };
    });
  }, [data]);

  const passesFilters = (r) => {
    if (filters.region && r.region !== filters.region) return false;
    if (filters.territory && r.territory !== filters.territory) return false;
    if (filters.tsm && r.tsm_name_display !== filters.tsm) return false;
    if (filters.state && r.state !== filters.state) return false;
    if (filters.district && r.district !== filters.district) return false;
    if (filters.crop && r.crop !== filters.crop) return false;
    if (filters.product && r.real_product !== filters.product) return false;
    if (filters.language && r.language !== filters.language) return false;
    if (filters.startDate && r.date_obj < new Date(filters.startDate)) return false;
    if (filters.endDate && r.date_obj > new Date(filters.endDate)) return false;
    return true;
  };

  const filteredData = useMemo(() => enrichedResponses.filter(r => passesFilters(r)), [enrichedResponses, filters]);

  const metrics = useMemo(() => {
    const regionCounts = {}; const cropCounts = {}; const dateCounts = {}; const languageCounts = {}; const stateCounts = {};
    const tsmStats = {};

    filteredData.forEach(d => {
      regionCounts[d.region] = (regionCounts[d.region] || 0) + 1;
      cropCounts[d.crop] = (cropCounts[d.crop] || 0) + 1;
      if (d.language) languageCounts[d.language] = (languageCounts[d.language] || 0) + 1;
      if (d.state) stateCounts[d.state] = (stateCounts[d.state] || 0) + 1;
      
      const dateStr = d.date_obj.toLocaleDateString();
      dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;

      const key = d.tsm_name_display;
      if (!tsmStats[key]) tsmStats[key] = { tsm: key, territory: d.territory, region: d.region, count: 0 };
      tsmStats[key].count += 1;
    });

    return {
      totalFarmers: filteredData.length,
      activeTsms: Object.keys(tsmStats).length,
      topRegion: Object.keys(regionCounts).sort((a, b) => regionCounts[b] - regionCounts[a])[0] || 'N/A',
      topCrop: Object.keys(cropCounts).sort((a, b) => cropCounts[b] - cropCounts[a])[0] || 'N/A',
      cropChartData: Object.keys(cropCounts).map(k => ({ name: k, value: cropCounts[k] })),
      languageChartData: Object.keys(languageCounts).map(k => ({ name: k, value: languageCounts[k] })),
      mapData: Object.keys(stateCounts).map(k => ({ state: k, count: stateCounts[k] })),
      trendChartData: Object.keys(dateCounts).sort((a, b) => new Date(a) - new Date(b)).map(k => ({ date: k, count: dateCounts[k] })),
      tsmChartData: Object.values(tsmStats).sort((a, b) => b.count - a.count).slice(0, 10),
      tsmTableData: Object.values(tsmStats).sort((a, b) => b.count - a.count).slice(0, 5)
    };
  }, [filteredData]);

  const handleFilterChange = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));
  const resetFilters = () => setFilters({ region: '', territory: '', tsm: '', state: '', district: '', crop: '', product: '', language: '', startDate: '', endDate: '' });

  const triggerDownload = () => {
    const isFiltered = Object.values(filters).some(val => val !== '');
    if (isFiltered) {
      setShowDownloadModal(true);
    } else {
      executeDownload(enrichedResponses);
    }
  };

  const executeDownload = (datasetToDownload) => {
    if (datasetToDownload.length === 0) {
      alert("No data available to download.");
      setShowDownloadModal(false);
      return;
    }

    const headers = ['Date', 'Farmer Name', 'Mobile', 'Language', 'Crop', 'Product', 'State', 'District', 'TSM', 'Territory', 'Region'];
    const rows = datasetToDownload.map(r => [
      `"${r.date_obj ? r.date_obj.toLocaleDateString() : ''}"`,
      `"${r.farmer_name || ''}"`,
      `"${r.mobile || ''}"`,
      `"${r.language || ''}"`,
      `"${r.crop || ''}"`,
      `"${r.real_product || ''}"`,
      `"${r.state || ''}"`,
      `"${r.district || ''}"`,
      `"${r.tsm_name_display || ''}"`,
      `"${r.territory || ''}"`,
      `"${r.region || ''}"`
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ews_campaign_responses_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowDownloadModal(false);
  };

  // Options for selects
  const getUnique = (key) => [...new Set(enrichedResponses.map(r => key === 'tsm' ? r.tsm_name_display : r[key]).filter(Boolean))].sort();

  if (!isLoggedIn) return <Login onLogin={() => setIsLoggedIn(true)} />;
  if (loading) return <div style={{height:'100vh', display:'flex', alignItems:'center', justifyContent:'center'}}><RefreshCw className="animate-spin" color="#4318ff" size={40} /></div>;

  return (
    <div className="dashboard-container">
      
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <img src="/ews_seeds_logo.jpeg" alt="EWS" className="sidebar-logo" onError={(e)=>{e.target.style.display='none'}} />
          <h1 className="page-title">Dashboard</h1>
        </div>

        <div className="header-actions">
          <button className="btn-primary" onClick={resetFilters}>
            <RefreshCw size={16} /> Reset
          </button>
          <button className="btn-primary" onClick={triggerDownload} style={{ background: '#05cd99', boxShadow: '0px 4px 10px rgba(5, 205, 153, 0.3)' }}>
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filters-bar">
        <div className="filter-pill">
          <Calendar size={16} />
          <input type="date" className="filter-input" value={filters.startDate} onChange={e => handleFilterChange('startDate', e.target.value)} />
          <span>-</span>
          <input type="date" className="filter-input" value={filters.endDate} onChange={e => handleFilterChange('endDate', e.target.value)} />
        </div>

        <div className="filter-pill">
          <Filter size={16} />
          <select className="filter-input" value={filters.region} onChange={e => handleFilterChange('region', e.target.value)}>
            <option value="">All Regions</option>
            {getUnique('region').map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="filter-pill">
          <Filter size={16} />
          <select className="filter-input" value={filters.territory} onChange={e => handleFilterChange('territory', e.target.value)}>
            <option value="">All Territories</option>
            {getUnique('territory').map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="filter-pill">
          <Filter size={16} />
          <select className="filter-input" value={filters.tsm} onChange={e => handleFilterChange('tsm', e.target.value)}>
            <option value="">All TSMs</option>
            {getUnique('tsm').map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="filter-pill">
          <Filter size={16} />
          <select className="filter-input" value={filters.state} onChange={e => handleFilterChange('state', e.target.value)}>
            <option value="">All States</option>
            {getUnique('state').map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="filter-pill">
          <Filter size={16} />
          <select className="filter-input" value={filters.district} onChange={e => handleFilterChange('district', e.target.value)}>
            <option value="">All Districts</option>
            {getUnique('district').map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="filter-pill">
          <Filter size={16} />
          <select className="filter-input" value={filters.crop} onChange={e => handleFilterChange('crop', e.target.value)}>
            <option value="">All Crops</option>
            {getUnique('crop').map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="filter-pill">
          <Filter size={16} />
          <select className="filter-input" value={filters.product} onChange={e => handleFilterChange('product', e.target.value)}>
            <option value="">All Products</option>
            {getUnique('product').map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="filter-pill">
          <Filter size={16} />
          <select className="filter-input" value={filters.language} onChange={e => handleFilterChange('language', e.target.value)}>
            <option value="">All Languages</option>
            {getUnique('language').map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* 4 KPIs */}
      <div className="kpi-grid">
        <div className="clean-card kpi-card">
          <div className="kpi-top">
            <span className="kpi-title">Total Farmers</span>
            <Users className="kpi-icon" size={24} />
          </div>
          <div className="kpi-middle">
            <span className="kpi-value">{metrics.totalFarmers.toLocaleString()}</span>
            <span className="kpi-badge"><ArrowUpRight size={14} /> 12.5%</span>
          </div>
          <span className="kpi-bottom">vs. previous period</span>
        </div>

        <div className="clean-card kpi-card">
          <div className="kpi-top">
            <span className="kpi-title">Active TSMs</span>
            <Eye className="kpi-icon" size={24} />
          </div>
          <div className="kpi-middle">
            <span className="kpi-value">{metrics.activeTsms}</span>
            <span className="kpi-badge"><ArrowUpRight size={14} /> 8.4%</span>
          </div>
          <span className="kpi-bottom">vs. previous period</span>
        </div>

        <div className="clean-card kpi-card">
          <div className="kpi-top">
            <span className="kpi-title">Top Region</span>
            <MousePointerClick className="kpi-icon" size={24} />
          </div>
          <div className="kpi-middle">
            <span className="kpi-value">{metrics.topRegion}</span>
          </div>
          <span className="kpi-bottom">Highest engagement</span>
        </div>

        <div className="clean-card kpi-card">
          <div className="kpi-top">
            <span className="kpi-title">Top Crop</span>
            <ShoppingBag className="kpi-icon" size={24} />
          </div>
          <div className="kpi-middle">
            <span className="kpi-value">{metrics.topCrop}</span>
          </div>
          <span className="kpi-bottom">Most popular choice</span>
        </div>
      </div>

      {/* Main Charts Layout */}
      <div className="charts-layout">
        <div className="clean-card">
          <div className="chart-header">
            <h3 className="chart-title">Responses Trend</h3>
            <MoreHorizontal className="chart-action" />
          </div>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.trendChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{fontSize: 12, fill: '#a3aed0'}} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{fontSize: 12, fill: '#a3aed0'}} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                <Line type="monotone" dataKey="count" stroke="#4318ff" strokeWidth={4} dot={false} activeDot={{r: 8}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="clean-card">
          <div className="chart-header">
            <h3 className="chart-title">Responses Map</h3>
            <MoreHorizontal className="chart-action" />
          </div>
          <div style={{ height: 280 }}>
            <MapChart data={metrics.mapData} />
          </div>
        </div>
      </div>

      <div className="charts-grid-3">
        <div className="clean-card">
          <div className="chart-header">
            <h3 className="chart-title">Crop Distribution</h3>
            <MoreHorizontal className="chart-action" />
          </div>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={metrics.cropChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                  {metrics.cropChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="clean-card">
          <div className="chart-header">
            <h3 className="chart-title">Language Analysis</h3>
            <MoreHorizontal className="chart-action" />
          </div>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.languageChartData} layout="vertical" margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                <XAxis type="number" tick={{fontSize: 12, fill: '#a3aed0'}} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{fontSize: 12, fill: '#2b3674', fontWeight: 600}} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f4f7fe'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="value" fill="#6ad2ff" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="clean-card">
          <div className="chart-header">
            <h3 className="chart-title">Top TSMs</h3>
            <MoreHorizontal className="chart-action" />
          </div>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.tsmChartData} layout="vertical" margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                <XAxis type="number" tick={{fontSize: 12, fill: '#a3aed0'}} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="tsm" tick={{fontSize: 12, fill: '#2b3674', fontWeight: 600}} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f4f7fe'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="count" fill="#05cd99" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="charts-layout">
        <div className="clean-card" style={{ padding: '24px 0' }}>
          <div className="chart-header" style={{ padding: '0 24px' }}>
            <h3 className="chart-title">Recent Submissions</h3>
            <MoreHorizontal className="chart-action" />
          </div>
          <div className="table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>FARMER NAME</th>
                  <th>CROP</th>
                  <th>DATE</th>
                  <th>TSM</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.slice(0, 5).map((row, i) => (
                  <tr key={i}>
                    <td>
                      {row.farmer_name}
                      <span className="table-subtext">{row.mobile}</span>
                    </td>
                    <td>
                      {row.crop}
                      <span className="table-subtext">{row.real_product}</span>
                    </td>
                    <td>{row.date_obj.toLocaleDateString()}</td>
                    <td>
                      {row.tsm_name_display}
                      <span className="table-subtext">{row.region}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="clean-card" style={{ padding: '24px 0' }}>
          <div className="chart-header" style={{ padding: '0 24px' }}>
            <h3 className="chart-title">Top TSMs Data</h3>
            <MoreHorizontal className="chart-action" />
          </div>
          <div className="table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>TSM</th>
                  <th>COUNT</th>
                </tr>
              </thead>
              <tbody>
                {metrics.tsmTableData.map((row, i) => (
                  <tr key={i}>
                    <td>
                      {row.tsm}
                      <span className="table-subtext">{row.region}</span>
                    </td>
                    <td className="badge-text">{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Download Modal */}
      {showDownloadModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(112, 144, 176, 0.4)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="clean-card" style={{ maxWidth: '420px', width: '90%', display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeInUp 0.3s ease-out' }}>
            <div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#2b3674' }}>Export Data</h3>
              <p style={{ margin: 0, color: '#a3aed0', fontSize: '14px', lineHeight: '1.5' }}>
                You currently have active filters applied. Which dataset would you like to download?
              </p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button className="btn-primary" onClick={() => executeDownload(filteredData)} style={{ justifyContent: 'center', padding: '14px' }}>
                Download Filtered Data ({filteredData.length} rows)
              </button>
              
              <button className="btn-primary" onClick={() => executeDownload(enrichedResponses)} style={{ background: '#f4f7fe', color: '#4318ff', boxShadow: 'none', justifyContent: 'center', padding: '14px' }}>
                Download Entire Dataset ({enrichedResponses.length} rows)
              </button>
              
              <button className="btn-primary" onClick={() => setShowDownloadModal(false)} style={{ background: 'transparent', color: '#a3aed0', boxShadow: 'none', justifyContent: 'center', padding: '14px' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
