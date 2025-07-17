import React from 'react';
import '../styles/form.css';

const FixedEntriesList = ({ type, entries, onEdit, onDelete }) => {
  const getStatus = (dueDate) => {
    if (!dueDate) return '';
    const today = new Date();
    const due = new Date(dueDate);
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);

    if (due < today) {
      return 'Overdue';
    } else if (due.getMonth() === today.getMonth() && due.getFullYear() === today.getFullYear()) {
      return 'Upcoming';
    } else {
      return '';
    }
  };

  return (
    <div className="table-section">
      <h2 className="section-title">Fixed {type} Entries</h2>
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th className="table-header">Sr. No</th>
              <th className="table-header">Date</th>
              {type === 'Liabilities' && <th className="table-header">Due Date</th>}
              <th className="table-header">Description</th>
              <th className="table-header">Amount</th>
              {type === 'Liabilities' && <th className="table-header">Status</th>}
              <th className="table-header">Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <tr key={index} className={index % 2 === 0 ? 'table-row-even' : 'table-row-odd'}>
                <td className="table-data">{index + 1}</td>
                <td className="table-data">{entry.date ? new Date(entry.date).toLocaleDateString() : ''}</td>
                {type === 'Liabilities' && <td className="table-data">{entry.dueDate ? new Date(entry.dueDate).toLocaleDateString() : ''}</td>}
                <td className="table-data">{entry.description} {entry.isFixed && <span className="fixed-tag">(Fixed)</span>}</td>
                <td className="table-data">₹{parseFloat(entry.amount).toFixed(2)}</td>
                {type === 'Liabilities' && (
                  <td className="table-data">
                    <span className={
                      getStatus(entry.dueDate) === 'Overdue' ? 'status-overdue' :
                      getStatus(entry.dueDate) === 'Upcoming' ? 'status-upcoming' :
                      'status-paid'
                    }>
                      {getStatus(entry.dueDate)}
                    </span>
                  </td>
                )}
                <td className="table-data">
                  <button onClick={() => onEdit(entry, index)} className="btn btn-edit">
                    Edit
                  </button>
                  <button onClick={() => onDelete(index)} className="btn btn-delete">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FixedEntriesList;
