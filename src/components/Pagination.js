import React from 'react';

const Pagination = ({ invoicesPerPage, totalInvoices, paginate, nextPage, currentPage }) => {
  const pageNumbers = [];
  const totalPages = Math.ceil(totalInvoices / invoicesPerPage);

  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <nav>
      <div className="d-flex justify-content-between align-items-center">
        <div></div>
        <ul className="pagination">
          <li className="page-item">
            <button
              className="page-link"
              onClick={() => nextPage('prev')}
              disabled={currentPage === 1}
            >
              Previous
            </button>
          </li>
          {pageNumbers.map(number => (
            <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
              <button onClick={() => paginate(number)} className="page-link">
                {number}
              </button>
            </li>
          ))}
          <li className="page-item">
            <button
              className="page-link"
              onClick={() => nextPage('next')}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Pagination;
