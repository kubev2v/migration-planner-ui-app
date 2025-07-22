import React, { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import {
  Button,
  Spinner,
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
} from '@patternfly/react-core';
import { DownloadIcon } from '@patternfly/react-icons';

import type { Source } from '@migration-planner-ui/api-client/models';

import './DownloadPDFStyles.css';

interface EnhancedDownloadButtonProps {
  elementId: string;
  componentToRender: React.ReactNode;
  sourceData?: Source;
}

const EnhancedDownloadButton: React.FC<EnhancedDownloadButtonProps> = ({
  elementId,
  componentToRender,
  sourceData,
}) => {
  const hiddenContainerRef = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleDownloadPDF = async () => {
    try {
      setIsLoading(true);
      const originalWarn = console.warn;
      console.warn = () => {};

      const hiddenContainer = hiddenContainerRef.current;
      if (!hiddenContainer) return;
      hiddenContainer.innerHTML = '';

      const tempDiv = document.createElement('div');
      hiddenContainer.appendChild(tempDiv);
      const root = createRoot(tempDiv);
      root.render(componentToRender);

      await new Promise((resolve) => setTimeout(resolve, 500));

      const canvas = await html2canvas(hiddenContainer, { useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;

      const contentWidth = pageWidth - margin * 2;
      const contentHeight = pageHeight - margin * 2;

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      const scaleFactor = Math.min(
        contentWidth / imgWidth,
        contentHeight / imgHeight,
      );

      pdf.addImage(
        imgData,
        'PNG',
        margin,
        margin,
        imgWidth * scaleFactor,
        imgHeight * scaleFactor,
      );
      pdf.save('Dashboard_Report.pdf');

      hiddenContainer.innerHTML = '';
      console.warn = originalWarn;
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsLoading(false);
    }
  };

// Helper function to format numbers with K/M suffixes
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

// Helper function to escape HTML to prevent XSS attacks
const escapeHtml = (str: string): string => {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

// Generate chart data from inventory
const generateChartData = (inventory: any) => {
  const { infra, vms } = inventory;

  const powerStateData = [
    ['Powered On', vms.powerStates.poweredOn],
    ['Powered Off', vms.powerStates.poweredOff],
    ['Suspended', vms.powerStates.suspended || 0],
  ];

  const resourceData = [
    ['CPU Cores', vms.cpuCores.total, Math.round(vms.cpuCores.total * 1.2)],
    ['Memory GB', vms.ramGB.total, Math.round(vms.ramGB.total * 1.25)],
    ['Storage GB', vms.diskGB.total, Math.round(vms.diskGB.total * 1.15)],
  ];

  const osEntries = Object.entries(vms.os).sort(([,a], [,b]) => (b as number) - (a as number));
  const osData = osEntries.slice(0, 8).map(([name, count]) => [name, count]);

  const warningsData = vms.migrationWarnings.map((w: any) => [w.label, w.count]);

  const storageLabels = infra.datastores.map((ds: any) => `${ds.vendor} ${ds.type}`);
  const storageUsedData = infra.datastores.map((ds: any) => ds.totalCapacityGB - ds.freeCapacityGB);
  const storageTotalData = infra.datastores.map((ds: any) => ds.totalCapacityGB);

  return {
    powerStateData,
    resourceData,
    osData,
    warningsData,
    storageLabels,
    storageUsedData,
    storageTotalData,
  };
};

// Generate HTML table for operating systems
const generateOSTable = (vms: any): string => {
  const osEntries = Object.entries(vms.os).sort(([,a], [,b]) => (b as number) - (a as number));
  if (osEntries.length === 0) {
    return '<tr><td colspan="4">No operating system data available</td></tr>';
  }

  return osEntries.map(([osName, count]) => {
    const percentage = ((count as number) / vms.total * 100).toFixed(1);
    const priority = osName.includes('Windows') ? 'High' : 
                    osName.includes('Linux') || osName.includes('Red Hat') ? 'Medium' : 'Review Required';
    return `
      <tr>
        <td><strong>${escapeHtml(osName)}</strong></td>
        <td>${count}</td>
        <td>${percentage}%</td>
        <td>${escapeHtml(priority)}</td>
      </tr>`;
  }).join('');
};

// Generate HTML table for migration warnings
const generateWarningsTable = (vms: any): string => {
  if (vms.migrationWarnings.length === 0) {
    return `<div class="table-section">
      <h3>Migration Warnings Analysis</h3>
      <p>No migration warnings to display.</p>
    </div>`;
  }

  const warningsRows = vms.migrationWarnings.map((warning: any) => {
    const impact = warning.count > 50 ? 'Critical' : 
                  warning.count > 20 ? 'High' : 
                  warning.count > 5 ? 'Medium' : 'Low';
    const percentage = ((warning.count / vms.total) * 100).toFixed(1);
    const priority = impact === 'Critical' ? 'Immediate' :
                    impact === 'High' ? 'Before Migration' :
                    impact === 'Medium' ? 'During Migration' : 'Post Migration';
    const rowClass = impact === 'Critical' ? 'warning-high' :
                    impact === 'High' ? 'warning-medium' :
                    impact === 'Medium' ? 'warning-low' : '';

    return `
      <tr class="${rowClass}">
        <td><strong>${escapeHtml(warning.label)}</strong></td>
        <td>${warning.count}</td>
        <td>${escapeHtml(impact)}</td>
        <td>${percentage}%</td>
        <td>${escapeHtml(priority)}</td>
      </tr>`;
  }).join('');

  return `<div class="table-section">
    <h3>Migration Warnings Analysis</h3>
    <table>
      <thead>
        <tr>
          <th>Warning Category</th>
          <th>Affected VMs</th>
          <th>Impact Level</th>
          <th>% of Total VMs</th>
          <th>Priority</th>
        </tr>
      </thead>
      <tbody>
        ${warningsRows}
      </tbody>
    </table>
  </div>`;
};

// Generate HTML table for storage infrastructure
const generateStorageTable = (infra: any): string => {
  if (infra.datastores.length === 0) {
    return '<tr><td colspan="7">No datastore information available</td></tr>';
  }

  return infra.datastores.map((ds: any) => {
    const utilization = ds.totalCapacityGB > 0 ? 
      (((ds.totalCapacityGB - ds.freeCapacityGB) / ds.totalCapacityGB) * 100).toFixed(1) : '0.0';
    const hwAccel = ds.hardwareAcceleratedMove ? '✅ Yes' : '❌ No';

    return `
      <tr>
        <td><strong>${escapeHtml(ds.vendor)}</strong></td>
        <td>${escapeHtml(ds.type)}</td>
        <td>${escapeHtml(ds.protocolType)}</td>
        <td>${formatNumber(ds.totalCapacityGB)}</td>
        <td>${formatNumber(ds.freeCapacityGB)}</td>
        <td>${utilization}%</td>
        <td>${hwAccel}</td>
      </tr>`;
  }).join('');
};

// Generate CSS styles for the HTML report
const generateHTMLStyles = (): string => {
  return `
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 40px; }
    .header h1 { color: #2c3e50; margin-bottom: 10px; font-size: 2.5em; }
    .header p { color: #7f8c8d; font-size: 1.1em; }
    .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
    .summary-card { background: #3498db; color: white; padding: 20px; border-radius: 8px; text-align: center; }
    .summary-card h4 { margin: 0 0 10px 0; font-size: 14px; font-weight: 600; }
    .summary-card .number { font-size: 32px; font-weight: bold; }
    .chart-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(500px, 1fr)); gap: 30px; margin: 30px 0; }
    .chart-container { background: white; padding: 20px; border-radius: 8px; border: 1px solid #ddd; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
    .chart-container h3 { text-align: center; color: #2c3e50; margin-bottom: 20px; font-size: 1.3em; }
    .chart-wrapper { position: relative; height: 300px; }
    .section { margin: 40px 0; }
    .section h2 { color: #2c3e50; border-left: 4px solid #3498db; padding-left: 15px; margin-bottom: 25px; }
    .table-section { margin: 30px 0; }
    .table-section h3 { color: #2c3e50; margin-bottom: 15px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
    th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-weight: 600; }
    tr:nth-child(even) { background-color: #f8f9fa; }
    tr:hover { background-color: #e8f4ff; }
    .warning-high { background-color: #e74c3c !important; color: white; }
    .warning-medium { background-color: #f39c12 !important; color: white; }
    .warning-low { background-color: #27ae60 !important; color: white; }
    .summary-box { background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%); color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .summary-box h2 { margin-top: 0; }
    .footer { text-align: center; margin-top: 40px; color: #7f8c8d; border-top: 1px solid #eee; padding-top: 20px; }
    .footer p { margin: 5px 0; }
    @media print { body { background: white; } .container { box-shadow: none; } .chart-container { break-inside: avoid; } }
    @media (max-width: 768px) {
        .chart-grid { grid-template-columns: 1fr; }
        .summary-grid { grid-template-columns: repeat(2, 1fr); }
        .container { padding: 20px; margin: 10px; }
    }`;
};

// Generate complete HTML template with data and scripts
const generateHTMLTemplate = (chartData: any, inventory: any): string => {
  const { infra, vms } = inventory;
  const { powerStateData, resourceData, osData, warningsData, storageLabels, storageUsedData, storageTotalData } = chartData;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VMware Infrastructure Assessment Report</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js"></script>
    <style>
        ${generateHTMLStyles()}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>VMware Infrastructure Assessment Report</h1>
            <p>Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        </div>

        <div class="summary-grid">
            <div class="summary-card">
                <h4>Total VMs</h4>
                <div class="number">${vms.total}</div>
            </div>
            <div class="summary-card" style="background: #e74c3c;">
                <h4>ESXi Hosts</h4>
                <div class="number">${infra.totalHosts}</div>
            </div>
            <div class="summary-card" style="background: #27ae60;">
                <h4>Datastores</h4>
                <div class="number">${infra.datastores.length}</div>
            </div>
            <div class="summary-card" style="background: #f39c12;">
                <h4>Networks</h4>
                <div class="number">${infra.networks.length}</div>
            </div>
        </div>

        <div class="chart-grid">
            <div class="chart-container">
                <h3>VM Power States Distribution</h3>
                <div class="chart-wrapper">
                    <canvas id="powerChart"></canvas>
                </div>
            </div>

            <div class="chart-container">
                <h3>Resource Utilization</h3>
                <div class="chart-wrapper">
                    <canvas id="resourceChart"></canvas>
                </div>
            </div>

            <div class="chart-container">
                <h3>Top Operating Systems</h3>
                <div class="chart-wrapper">
                    <canvas id="osChart"></canvas>
                </div>
            </div>

            ${vms.migrationWarnings.length > 0 ? `
            <div class="chart-container">
                <h3>Migration Warnings</h3>
                <div class="chart-wrapper">
                    <canvas id="warningsChart"></canvas>
                </div>
            </div>` : ''}

            ${infra.datastores.length > 0 ? `
            <div class="chart-container">
                <h3>Storage Utilization by Datastore</h3>
                <div class="chart-wrapper">
                    <canvas id="storageChart"></canvas>
                </div>
            </div>` : ''}
        </div>

        <div class="section">
            <h2>Detailed Analysis Tables</h2>
            
            <div class="table-section">
                <h3>Operating System Distribution</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Operating System</th>
                            <th>VM Count</th>
                            <th>Percentage</th>
                            <th>Migration Priority</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${generateOSTable(vms)}
                    </tbody>
                </table>
            </div>

            <div class="table-section">
                <h3>Resource Allocation Analysis</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Resource Type</th>
                            <th>Current Total</th>
                            <th>Average per VM</th>
                            <th>Recommended Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>CPU Cores (vCPUs)</strong></td>
                            <td>${vms.cpuCores.total}</td>
                            <td>${(vms.cpuCores.total / vms.total).toFixed(1)}</td>
                            <td>${Math.round(vms.cpuCores.total * 1.2)} (with 20% overhead)</td>
                        </tr>
                        <tr>
                            <td><strong>Memory (GB)</strong></td>
                            <td>${vms.ramGB.total}</td>
                            <td>${(vms.ramGB.total / vms.total).toFixed(1)}</td>
                            <td>${Math.round(vms.ramGB.total * 1.25)} (with 25% overhead)</td>
                        </tr>
                        <tr>
                            <td><strong>Storage (GB)</strong></td>
                            <td>${vms.diskGB.total}</td>
                            <td>${(vms.diskGB.total / vms.total).toFixed(1)}</td>
                            <td>${Math.round(vms.diskGB.total * 1.15)} (with 15% overhead)</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            ${generateWarningsTable(vms)}

            <div class="table-section">
                <h3>Storage Infrastructure</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Vendor</th>
                            <th>Type</th>
                            <th>Protocol</th>
                            <th>Total Capacity (GB)</th>
                            <th>Free Capacity (GB)</th>
                            <th>Utilization %</th>
                            <th>Hardware Acceleration</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${generateStorageTable(infra)}
                    </tbody>
                </table>
            </div>
        </div>

        <div class="footer">
            <p>VMware Infrastructure Assessment Report - Generated from live inventory data</p>
            <p>Charts are interactive - hover for details, click legend items to show/hide data series.</p>
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Power States Doughnut Chart
            const powerCtx = document.getElementById('powerChart');
            if (powerCtx) {
                new Chart(powerCtx, {
                    type: 'doughnut',
                    data: {
                        labels: ${JSON.stringify(powerStateData.map((d: any) => d[0]))},
                        datasets: [{
                            data: ${JSON.stringify(powerStateData.map((d: any) => d[1]))},
                            backgroundColor: ['#27ae60', '#e74c3c', '#f39c12']
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { position: 'bottom' } }
                    }
                });
            }

            // Resource Utilization Bar Chart
            const resourceCtx = document.getElementById('resourceChart');
            if (resourceCtx) {
                new Chart(resourceCtx, {
                    type: 'bar',
                    data: {
                        labels: ${JSON.stringify(resourceData.map((d: any) => d[0]))},
                        datasets: [{
                            label: 'Current',
                            data: ${JSON.stringify(resourceData.map((d: any) => d[1]))},
                            backgroundColor: '#3498db'
                        }, {
                            label: 'Recommended',
                            data: ${JSON.stringify(resourceData.map((d: any) => d[2]))},
                            backgroundColor: '#2ecc71'
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { position: 'bottom' } },
                        scales: { y: { beginAtZero: true } }
                    }
                });
            }

            // Operating Systems Horizontal Bar Chart
            const osCtx = document.getElementById('osChart');
            if (osCtx) {
                new Chart(osCtx, {
                    type: 'bar',
                    data: {
                        labels: ${JSON.stringify(osData.map((d: any) => d[0]))},
                        datasets: [{
                            data: ${JSON.stringify(osData.map((d: any) => d[1]))},
                            backgroundColor: ['#3498db', '#e74c3c', '#27ae60', '#f39c12', '#9b59b6', '#1abc9c', '#34495e', '#e67e22']
                        }]
                    },
                    options: {
                        indexAxis: 'y',
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: { x: { beginAtZero: true } }
                    }
                });
            }

            ${vms.migrationWarnings.length > 0 ? `
            // Migration Warnings Chart
            const warningsCtx = document.getElementById('warningsChart');
            if (warningsCtx) {
                new Chart(warningsCtx, {
                    type: 'bar',
                    data: {
                        labels: ${JSON.stringify(warningsData.map((d: any) => d[0]))},
                        datasets: [{
                            data: ${JSON.stringify(warningsData.map((d: any) => d[1]))},
                            backgroundColor: ${JSON.stringify(warningsData.map((d: any) => {
                              const count = Number(d[1]);
                              return count > 50 ? '#e74c3c' : count > 20 ? '#f39c12' : count > 5 ? '#27ae60' : '#3498db';
                            }))}
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: { y: { beginAtZero: true } }
                    }
                });
            }` : ''}

            ${infra.datastores.length > 0 ? `
            // Storage Utilization Chart
            const storageCtx = document.getElementById('storageChart');
            if (storageCtx) {
                new Chart(storageCtx, {
                    type: 'bar',
                    data: {
                        labels: ${JSON.stringify(storageLabels)},
                        datasets: [{
                            label: 'Used (GB)',
                            data: ${JSON.stringify(storageUsedData)},
                            backgroundColor: '#e74c3c'
                        }, {
                            label: 'Total (GB)',
                            data: ${JSON.stringify(storageTotalData)},
                            backgroundColor: '#3498db'
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { position: 'bottom' } },
                        scales: { y: { beginAtZero: true } }
                    }
                });
            }` : ''}
        });
    </script>
</body>
</html>`;
};

// Download HTML file
const downloadHTMLFile = (content: string, filename: string): void => {
  const htmlBlob = new Blob([content], { type: 'text/html;charset=utf-8;' });
  const htmlUrl = URL.createObjectURL(htmlBlob);
  const htmlLink = document.createElement('a');
  htmlLink.href = htmlUrl;
  htmlLink.download = filename;
  document.body.appendChild(htmlLink);
  htmlLink.click();
  URL.revokeObjectURL(htmlUrl);
  document.body.removeChild(htmlLink);
};

const handleHTMLExport = async () => {
  try {
    setIsLoading(true);
    
    if (!sourceData?.inventory) {
      alert('No inventory data available for export');
      return;
    }

    const { inventory } = sourceData;

    const chartData = generateChartData(inventory);

    const htmlContent = generateHTMLTemplate(chartData, inventory);
    
    // Download the file
    downloadHTMLFile(htmlContent, 'VMware_Infrastructure_Assessment_Comprehensive.html');

    console.log("✅ Comprehensive HTML file with enhanced charts and tables downloaded successfully!");

  } catch (error) {
    console.error('Error generating HTML file:', error);
    alert('Failed to generate HTML file: ' + error);
  } finally {
    setIsLoading(false);
  }
};

  const exportOptions = [
    {
      key: 'pdf',
      label: 'PDF (View Only)',
      description: 'Static PDF report',
      action: handleDownloadPDF,
    },
    {
    key: 'html-interactive',
    label: 'Export HTML',
    description: 'Interactive charts',
    action: handleHTMLExport,
    disabled: !sourceData?.inventory,
  },
  ];

  const onToggleClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const onSelect = () => {
    setIsDropdownOpen(false);
  };

  return (
    <>
      <Dropdown
        isOpen={isDropdownOpen}
        onSelect={onSelect}
        onOpenChange={(isOpen: boolean) => setIsDropdownOpen(isOpen)}
        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
          <MenuToggle
            ref={toggleRef}
            onClick={onToggleClick}
            isExpanded={isDropdownOpen}
            variant="secondary"
            isDisabled={isLoading}
          >
            {isLoading ? (
              <>
                <Spinner size="sm" /> Exporting...
              </>
            ) : (
              <>
                <DownloadIcon /> Export Report
              </>
            )}
          </MenuToggle>
        )}
      >
        <DropdownList className="dropdown-list-reset">
          {exportOptions.map((option) => (
            <DropdownItem
              key={option.key}
              onClick={option.action}
              description={option.description}
              isDisabled={option.disabled}
            >
              {option.label}
            </DropdownItem>
          ))}
        </DropdownList>
      </Dropdown>

      <div
        id="hidden-container"
        ref={hiddenContainerRef}
        style={{
          position: 'absolute',
          left: '-9999px',
          top: '0',
          width: '1600px',
          minHeight: '1200px',
          padding: '2rem',
          backgroundColor: 'white',
          zIndex: -1,
        }}
      />
    </>
  );
};

export default EnhancedDownloadButton;