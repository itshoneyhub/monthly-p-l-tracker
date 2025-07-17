import React, { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import '../styles/dashboard.css';
import { getFixedEntries } from '../utils/fixedData';
import { useAlert } from '../hooks/useAlert';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalLiabilities, setTotalLiabilities] = useState(0);
  const [netProfitLoss, setNetProfitLoss] = useState(0);
  const [profitLossPercentage, setProfitLossPercentage] = useState(0);
  const [monthlyIncomeData, setMonthlyIncomeData] = useState([]);
  const [monthlyExpenseData, setMonthlyExpenseData] = useState([]);
  const [categoryExpenseData, setCategoryExpenseData] = useState({});
  const [monthlyTrendLabelsState, setMonthlyTrendLabelsState] = useState([]);
  const dashboardRef = useRef(null);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const { showAlert } = useAlert();

  useEffect(() => {
    console.log('Dashboard: useEffect - fetching data');
    const fetchData = (monthFilter = null) => {
      const incomeEntries = JSON.parse(localStorage.getItem('incomeEntries')) || [];
      const expenseEntries = JSON.parse(localStorage.getItem('expenseEntries')) || [];
      const liabilityEntries = JSON.parse(localStorage.getItem('liabilityEntries')) || [];

      console.log('Dashboard: Raw incomeEntries from localStorage', incomeEntries);
      console.log('Dashboard: Raw expenseEntries from localStorage', expenseEntries);
      console.log('Dashboard: Raw liabilityEntries from localStorage', liabilityEntries);

      const fixedIncomeEntries = getFixedEntries('income');
      const fixedExpenseEntries = getFixedEntries('expenses');
      const fixedLiabilityEntries = getFixedEntries('liabilities');

      const allIncome = [...incomeEntries, ...fixedIncomeEntries];
      const allExpenses = [...expenseEntries, ...fixedExpenseEntries];
      const allLiabilities = [...liabilityEntries, ...fixedLiabilityEntries];

      console.log('Dashboard: All income entries (including fixed)', allIncome);
      console.log('Dashboard: All expense entries (including fixed)', allExpenses);
      console.log('Dashboard: All liability entries (including fixed)', allLiabilities);

      // Determine available months from all entries
      const allDates = [...allIncome, ...allExpenses, ...allLiabilities]
        .map(entry => new Date(entry.date))
        .filter(date => !isNaN(date.getTime())); // Filter out invalid dates

      const uniqueMonths = Array.from(new Set(
        allDates.map(date => `${date.getFullYear()}-${date.getMonth()}`)
      ))
        .sort((a, b) => new Date(a.split('-')[0], a.split('-')[1]) - new Date(b.split('-')[0], b.split('-')[1]));

      const formattedMonths = uniqueMonths.map(monthYear => {
        const [year, month] = monthYear.split('-');
        const date = new Date(year, month);
        return date.toLocaleString('default', { month: 'long', year: 'numeric' });
      });
      setAvailableMonths(formattedMonths);
      console.log('Dashboard: Available months', formattedMonths);

      // Set default selected month to the latest available if not already set
      if (!monthFilter && formattedMonths.length > 0) {
        const latestMonth = formattedMonths[formattedMonths.length - 1];
        setSelectedMonth(latestMonth);
        monthFilter = latestMonth; // Use the latest month for initial data fetch
        console.log('Dashboard: Setting default selected month to', latestMonth);
      } else if (!monthFilter && formattedMonths.length === 0) {
        setSelectedMonth(''); // No months available
        console.log('Dashboard: No months available, selectedMonth set to empty');
      }


      // Filter entries based on selected month
      const filterByMonth = (entries) => {
        if (!monthFilter) return entries;
        return entries.filter(entry => {
          const entryDate = new Date(entry.date);
          const entryMonthYear = entryDate.toLocaleString('default', { month: 'long', year: 'numeric' });
          return entryMonthYear === monthFilter;
        });
      };

      const filteredIncome = filterByMonth(allIncome);
      const filteredExpenses = filterByMonth(allExpenses);
      const filteredLiabilities = filterByMonth(allLiabilities);

      console.log('Dashboard: Filtered income entries', filteredIncome);
      console.log('Dashboard: Filtered expense entries', filteredExpenses);
      console.log('Dashboard: Filtered liability entries', filteredLiabilities);

      const income = filteredIncome.reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0);
      const expenses = filteredExpenses.reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0);
      const liabilities = filteredLiabilities.reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0);

      console.log('Dashboard: Calculated Totals:', { income, expenses, liabilities });

      setTotalIncome(income);
      setTotalExpenses(expenses);
      setTotalLiabilities(liabilities);

      const net = income - expenses - liabilities;
      setNetProfitLoss(net);

      if (income > 0) {
        setProfitLossPercentage((net / income) * 100);
      } else {
        setProfitLossPercentage(0);
      }

      console.log('Dashboard: Totals - Income:', income, 'Expenses:', expenses, 'Liabilities:', liabilities, 'Net P/L:', net);

      // Process data for monthly trends (these should still show overall trends, not just filtered month)
      const monthlyIncome = {};
      allIncome.forEach(entry => {
        const date = new Date(entry.date);
        const monthYear = `${date.getFullYear()}-${date.getMonth()}`;
        monthlyIncome[monthYear] = (monthlyIncome[monthYear] || 0) + parseFloat(entry.amount || 0);
      });

      const monthlyExpenses = {};
      allExpenses.forEach(entry => {
        const date = new Date(entry.date);
        const monthYear = `${date.getFullYear()}-${date.getMonth()}`;
        monthlyExpenses[monthYear] = (monthlyExpenses[monthYear] || 0) + parseFloat(entry.amount || 0);
      });

      const allMonthsForTrend = Array.from(new Set([...Object.keys(monthlyIncome), ...Object.keys(monthlyExpenses)]))
        .sort((a, b) => new Date(a.split('-')[0], a.split('-')[1]) - new Date(b.split('-')[0], b.split('-')[1]));

      setMonthlyIncomeData(allMonthsForTrend.map(month => monthlyIncome[month] || 0));
      setMonthlyExpenseData(allMonthsForTrend.map(month => monthlyExpenses[month] || 0));

      const monthlyTrendLabels = allMonthsForTrend.map(monthYear => {
        const [year, month] = monthYear.split('-');
        const date = new Date(year, month);
        return date.toLocaleString('default', { month: 'short', year: '2-digit' });
      });
      setMonthlyTrendLabelsState(monthlyTrendLabels);
      console.log('Dashboard: Monthly trend labels', monthlyTrendLabels);
      console.log('Dashboard: Monthly income data', monthlyIncomeData);
      console.log('Dashboard: Monthly expense data', monthlyExpenseData);


      // Process data for category-wise expenses (filtered by selected month)
      const categoryExpenses = {};
      filteredExpenses.forEach(entry => {
        const description = entry.description || 'Uncategorized';
        categoryExpenses[description] = (categoryExpenses[description] || 0) + parseFloat(entry.amount || 0);
      });
      setCategoryExpenseData(categoryExpenses);
      console.log('Dashboard: Category expense data', categoryExpenses);

      // Check for upcoming liabilities
      const today = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);

      const upcomingLiabilities = allLiabilities.filter(liability => {
        const liabilityDate = new Date(liability.date);
        return liabilityDate >= today && liabilityDate <= thirtyDaysFromNow;
      });

      if (upcomingLiabilities.length > 0) {
        const alertMessage = `Upcoming Liabilities: ${upcomingLiabilities.map(l => `${l.description} (₹${l.amount}) on ${new Date(l.date).toLocaleDateString()}`).join(', ')}`;
        showAlert(alertMessage, 'warning');
      }
    };

    // Initial fetch and re-fetch on month change
    fetchData(selectedMonth);

    const handleStorageUpdate = () => fetchData(selectedMonth);
    window.addEventListener('localStorageUpdated', handleStorageUpdate);

    return () => {
      window.removeEventListener('localStorageUpdated', handleStorageUpdate);
    };
  }, [selectedMonth, showAlert]); // Re-run effect when selectedMonth changes or showAlert changes

  // Effect for recurring upcoming liabilities alert
  useEffect(() => {
    const checkUpcomingLiabilities = () => {
      const allLiabilities = getFixedEntries('liabilities');
      const today = new Date();
      const fiveDaysFromNow = new Date();
      fiveDaysFromNow.setDate(today.getDate() + 5);

      const upcomingLiabilities = allLiabilities.filter(liability => {
        const liabilityDate = new Date(liability.date);
        return liabilityDate >= today && liabilityDate <= fiveDaysFromNow;
      });

      if (upcomingLiabilities.length > 0) {
        const alertMessage = `Upcoming Liabilities: ${upcomingLiabilities.map(l => `₹${parseFloat(l.amount || 0).toFixed(2)} due on ${new Date(l.date).toLocaleDateString()}`).join(', ')}`;
        showAlert(alertMessage, 'warning');
      }
    };

    // Initial check
    checkUpcomingLiabilities();

    // Set up interval to check every 2 minutes (120,000 ms)
    const intervalId = setInterval(checkUpcomingLiabilities, 120000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [showAlert]); // Dependency on showAlert to ensure it's stable



  const monthlyData = {
    labels: monthlyTrendLabelsState,
    datasets: [
      {
        label: 'Income',
        data: monthlyIncomeData,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
      {
        label: 'Expenses',
        data: monthlyExpenseData,
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
    ],
  };

  const categoryData = {
    labels: Object.keys(categoryExpenseData),
    datasets: [
      {
        data: Object.values(categoryExpenseData),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966CC',
          '#FF9F40',
          '#C9CBCF',
        ],
      },
    ],
  };

  // Simple prediction based on last 3 months average
  const predictNextMonth = (data) => {
    if (data.length < 3) return { value: 0, confidence: 50 }; // Lower confidence for less data
    const lastThreeMonths = data.slice(-3);
    const average = lastThreeMonths.reduce((sum, val) => sum + val, 0) / 3;
    return { value: average.toFixed(2), confidence: 85 }; // Higher confidence for more data
  };

  const predictedIncome = predictNextMonth(monthlyIncomeData);
  const predictedExpenses = predictNextMonth(monthlyExpenseData);

  const handleDownloadReport = async () => {
    if (!dashboardRef.current) {
      console.error('Dashboard ref is null. Cannot generate PDF.');
      return;
    }

    const input = dashboardRef.current;
    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = canvas.height * imgWidth / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    pdf.save(`Monthly_P&L_Report_${selectedMonth}.pdf`);
  };

  return (
    <div className="dashboard-container" ref={dashboardRef}>
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
        <div className="header-actions">
          <div className="month-filter-container">
            <label htmlFor="month-select">Select Month:</label>
            <select
              id="month-select"
              className="month-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {availableMonths.length > 0 ? (
                availableMonths.map((month, index) => (
                  <option key={index} value={month}>
                    {month}
                  </option>
                ))
              ) : (
                <option value="">No months available</option>
              )}
            </select>
          </div>
          <button className="btn-action" onClick={handleDownloadReport}>Download Report</button>
        </div>
      </div>

      {selectedMonth && availableMonths.length > 0 ? (
        <>
          <div className="kpi-grid">
            <div className="kpi-card">
              <h2 className="kpi-title">Total Income</h2>
              <p className="kpi-value green">₹{totalIncome.toFixed(2)}</p>
            </div>
            <div className="kpi-card">
              <h2 className="kpi-title">Total Expenses</h2>
              <p className="kpi-value red">₹{totalExpenses.toFixed(2)}</p>
            </div>
            <div className="kpi-card">
              <h2 className="kpi-title">Total Liabilities</h2>
              <p className="kpi-value gray">₹{totalLiabilities.toFixed(2)}</p>
            </div>
            <div className="kpi-card">
              <h2 className="kpi-title">Net Profit/Loss</h2>
              <p className={`kpi-value ${netProfitLoss >= 0 ? 'green' : 'red'}`}>₹{netProfitLoss.toFixed(2)}</p>
              <p className={`kpi-percentage ${profitLossPercentage >= 0 ? 'green' : 'red'}`}>{profitLossPercentage.toFixed(2)}%</p>
            </div>
          </div>

          <div className="chart-grid">
            <div className="chart-card">
              <h2 className="chart-title">Monthly Trends</h2>
              <div className="chart-wrapper">
                <Bar data={monthlyData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>
            <div className="chart-card">
              <h2 className="chart-title">Category-wise Expenses</h2>
              <div className="chart-wrapper">
                <Pie data={categoryData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>
          </div>

          <div className="predictive-analytics-card">
            <h2 className="predictive-analytics-title">Predictive Analytics</h2>
            <div className="predictive-analytics-grid">
              <div>
                <h3 className="predictive-analytics-subtitle">Next Month's Predicted Income</h3>
                <p className="predictive-analytics-value">₹{predictedIncome.value} <span className="predictive-analytics-confidence">(Confidence: {predictedIncome.confidence}%)</span></p>
              </div>
              <div>
                <h3 className="predictive-analytics-subtitle">Next Month's Predicted Expenses</h3>
                <p className="predictive-analytics-value">₹{predictedExpenses.value} <span className="predictive-analytics-confidence">(Confidence: {predictedExpenses.confidence}%)</span></p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <p className="no-data-message">No data available for the selected month or no entries exist.</p>
      )}
    </div>
  );
}

export default Dashboard;