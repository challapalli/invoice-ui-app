import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Pagination from './Pagination';
import { fetchInvoices, deleteInvoice, saveInvoice, updateInvoice } from '../service/invoiceService';
import { validateInput } from '../validation';
import './custom.css'

const InvoiceList = () => {
    const [invoices, setInvoices] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [invoicesPerPage, setInvoicesPerPage] = useState(5);
    const [isNewRowAdding, setIsNewRowAdding] = useState(false);
    const [editInvoiceId, setEditInvoiceId] = useState(null);
    const [invoiceData, setInvoiceData] = useState({
        invoice: '',
        customer: '',
        email: '',
        invoiceDate: new Date(),
        dueDate: new Date(),
        status: '',
        amount: ''
    });

    const [validationErrors, setValidationErrors] = useState({
        invoice: false,
        customer: false,
        email: false,
        status: false,
        amount: false
    });

    const [isSaveAttempted, setIsSaveAttempted] = useState(false);
    const [alertMessage, setAlertMessage] = useState(null);

    useEffect(() => {
        const getInvoices = async () => {
            try {
                const data = await fetchInvoices();
                setInvoices(data);
            } catch (error) {
                setAlertMessage(error.message);
                clearAlertMessage();
            }
        };
        getInvoices();
    }, []);

    const handleDelete = async (id) => {
        try {
            await deleteInvoice(id);
            setInvoices(invoices.filter(invoice => invoice.id !== id));
            setAlertMessage('Invoice deleted successfully.');
            clearAlertMessage();
        } catch (error) {
            setAlertMessage(error.message);
            clearAlertMessage();
        }
    };

    const indexOfLastInvoice = currentPage * invoicesPerPage;
    const indexOfFirstInvoice = indexOfLastInvoice - invoicesPerPage;
    const currentInvoices = invoices
        .filter(invoice =>
            invoice.invoice.toLowerCase().includes(searchTerm.toLowerCase()) ||
            invoice.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
            invoice.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .slice(indexOfFirstInvoice, indexOfLastInvoice);

    const handleChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const nextPage = (direction) => {
        const maxPage = Math.ceil(invoices.length / invoicesPerPage);
        if (direction === 'next') {
            if (currentPage === maxPage) return;
            setCurrentPage(currentPage => currentPage + 1);
        } else {
            if (currentPage === 1) return;
            setCurrentPage(currentPage => currentPage - 1);
        }
    };

    const handleRowsPerPageChange = (e) => {
        setInvoicesPerPage(parseInt(e.target.value));
        setCurrentPage(1);
    };

    const handleAddNew = () => {
        setIsNewRowAdding(true);
        setIsSaveAttempted(false);
        setEditInvoiceId(null); // Disable edit mode
    };

    const handleCancelAddNew = () => {
        setIsNewRowAdding(false);
        setIsSaveAttempted(false);
        resetInvoiceData();
    };

    const handleSaveNewRow = async (e) => {
        setIsSaveAttempted(true);
        if (Object.values(validationErrors).some(error => error)) {
            setAlertMessage('Please fix the validation errors.');
            clearAlertMessage();
            return;
        } else if(Object.values(invoiceData).some(value => value === '')) {
            setAlertMessage('Please fill all the fileds.');
            clearAlertMessage();
            return;
        }
        try {
            const data = await saveInvoice(invoiceData);
            setInvoices([...invoices, data]);
            setIsNewRowAdding(false);
            resetInvoiceData();
            setCurrentPage(Math.ceil((invoices.length + 1) / invoicesPerPage));
            setAlertMessage('Invoice saved successfully.');
            clearAlertMessage();
        } catch (error) {
            setAlertMessage(error.message);
            clearAlertMessage();
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setInvoiceData({ ...invoiceData, [name]: value });
        const isValid = validateInput(name, value);
        console.log(isValid);
        setValidationErrors({ ...validationErrors, [name]: !isValid });
    };

    const clearAlertMessage = () => {
        setTimeout(() => {
            setAlertMessage(null);
        }, 3000);
    };

    const handleEdit = (invoice) => {
        setEditInvoiceId(invoice.id);
        setIsNewRowAdding(false); // Disable add new mode
        setInvoiceData({
            invoice: invoice.invoice,
            customer: invoice.customer,
            email: invoice.email,
            invoiceDate: new Date(invoice.invoiceDate),
            dueDate: new Date(invoice.dueDate),
            status: invoice.status,
            amount: invoice.amount
        });
    };

    const handleCancelEdit = () => {
        setEditInvoiceId(null);
        setIsSaveAttempted(false);
        resetInvoiceData();
    };

    const handleSaveEdit = async () => {
        setIsSaveAttempted(true);
        if (Object.values(validationErrors).some(error => error) || 
            Object.values(invoiceData).some(value => value === '')) {
            setAlertMessage('Please fix the validation errors.');
            clearAlertMessage();
            return;
        }
        try {
            const updatedInvoice = await updateInvoice(editInvoiceId, invoiceData);
            setInvoices(invoices.map(invoice => invoice.id === editInvoiceId ? updatedInvoice : invoice));
            setEditInvoiceId(null);
            resetInvoiceData();
            setAlertMessage('Invoice updated successfully.');
            clearAlertMessage();
        } catch (error) {
            setAlertMessage(error.message);
            clearAlertMessage();
        }
    };

    const resetInvoiceData = () => {
        setInvoiceData({
            invoice: '',
            customer: '',
            email: '',
            invoiceDate: new Date(),
            dueDate: new Date(),
            status: '',
            amount: ''
        });
    };

    return (
        <div>
            <h2 className="mt-5 mb-3">Invoice List</h2>
            {alertMessage && <div className="alert alert-info">{alertMessage}</div>}
            <div className="row mb-3">
                <div className="col-md-6">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={handleChange}
                        style={{ width: 100 }}
                    />
                </div>
                <div className="col-md-6">
                    <div className="float-right">
                        {isNewRowAdding ? (
                            <>
                                <button className="btn btn-success" onClick={handleSaveNewRow}>Save</button>&nbsp;
                                <button className="btn btn-secondary" onClick={handleCancelAddNew}>Cancel</button>
                            </>
                        ) : (
                            <button
                                className="btn btn-primary"
                                onClick={handleAddNew}
                                disabled={editInvoiceId !== null}
                            >
                                Add New
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <table className="table table-striped">
                <thead className="thead-light">
                    <tr>
                        <th scope="col" style={{backgroundColor:"lightblue"}}></th>
                        <th scope="col" style={{backgroundColor:"lightblue"}}>Invoice</th>
                        <th scope="col" style={{backgroundColor:"lightblue"}}>Customer</th>
                        <th scope="col" style={{backgroundColor:"lightblue"}}>Email</th>
                        <th scope="col" style={{backgroundColor:"lightblue"}}>Invoice Date</th>
                        <th scope="col" style={{backgroundColor:"lightblue"}}>Due Date</th>
                        <th scope="col" style={{backgroundColor:"lightblue"}}>Status</th>
                        <th scope="col" style={{backgroundColor:"lightblue"}}>Amount</th>
                        <th scope="col" style={{backgroundColor:"lightblue"}}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        currentInvoices.length === 0 && (
                            <tr>
                                <td colSpan="9" className="text-center">No invoices found</td>
                            </tr>
                        )
                    }
                    {isNewRowAdding && (
                        <tr>
                            <td></td>
                            <td>
                                <div className="form-group">
                                    <input
                                        type="text"
                                        name="invoice"
                                        className={`form-control ${isSaveAttempted && (validationErrors.invoice || invoiceData.invoice === '') ? 'is-invalid' : ''}`}
                                        value={invoiceData.invoice}
                                        onChange={handleInputChange}
                                        placeholder="Invoice"
                                        required
                                    />
                                    <div className="invalid-feedback">
                                        Please enter only letters and numbers.
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div className="form-group">
                                    <input
                                        type="text"
                                        name="customer"
                                        className={`form-control ${isSaveAttempted && (validationErrors.customer || invoiceData.customer === '') ? 'is-invalid' : ''}`}
                                        value={invoiceData.customer}
                                        onChange={handleInputChange}
                                        placeholder="Customer"
                                        required
                                    />
                                    <div className="invalid-feedback">
                                        Please enter only letters & special chars.
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div className="form-group">
                                    <input
                                        type="email"
                                        name="email"
                                        className={`form-control ${isSaveAttempted && (validationErrors.email || invoiceData.email === '') ? 'is-invalid' : ''}`}
                                        value={invoiceData.email}
                                        onChange={handleInputChange}
                                        placeholder="Email"
                                        required
                                    />
                                    <div className="invalid-feedback">
                                        Please enter a valid email.
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div className="form-group">
                                    <DatePicker
                                        name="invoiceDate"
                                        className="form-control"
                                        selected={invoiceData.invoiceDate}
                                        onChange={(date) => setInvoiceData({ ...invoiceData, invoiceDate: date })}
                                    />
                                </div>
                            </td>
                            <td>
                                <div className="form-group">
                                    <DatePicker
                                        name="dueDate"
                                        className="form-control"
                                        selected={invoiceData.dueDate}
                                        onChange={(date) => setInvoiceData({ ...invoiceData, dueDate: date })}
                                    />
                                </div>
                            </td>
                            <td>
                                <div className="form-group">
                                    <input
                                        type="text"
                                        name="status"
                                        className={`form-control ${isSaveAttempted && (validationErrors.status || invoiceData.status === '') ? 'is-invalid' : ''}`}
                                        value={invoiceData.status}
                                        onChange={handleInputChange}
                                        placeholder="Status"
                                        required
                                    />
                                    <div className="invalid-feedback">
                                        Please enter only letters.
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div className="form-group">
                                    <input
                                        type="number"
                                        name="amount"
                                        className={`form-control ${isSaveAttempted && (validationErrors.amount || invoiceData.amount === '') ? 'is-invalid' : ''}`}
                                        value={invoiceData.amount}
                                        onChange={handleInputChange}
                                        placeholder="Amount"
                                        required
                                    />
                                    <div className="invalid-feedback">
                                        Please enter a valid amount.
                                    </div>
                                </div>
                            </td>
                            <td></td>
                        </tr>
                    )}
                    {currentInvoices.map((invoice, index) => (
                        <tr key={invoice.id}>
                            <td>{indexOfFirstInvoice + index + 1}</td>
                            {editInvoiceId === invoice.id ? (
                                <>
                                    <td>
                                        <div className="form-group">
                                            <input
                                                type="text"
                                                name="invoice"
                                                className={`form-control ${isSaveAttempted && !validateInput('invoice', invoiceData.invoice) ? 'is-invalid' : ''}`}
                                                value={invoiceData.invoice}
                                                onChange={handleInputChange}
                                                placeholder="Invoice"
                                                required
                                            />
                                            <div className="invalid-feedback">
                                                Please enter only letters and numbers.
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="form-group">
                                            <input
                                                type="text"
                                                name="customer"
                                                className={`form-control ${isSaveAttempted && !validateInput('customer', invoiceData.customer) ? 'is-invalid' : ''}`}
                                                value={invoiceData.customer}
                                                onChange={handleInputChange}
                                                placeholder="Customer"
                                                required
                                            />
                                            <div className="invalid-feedback">
                                                Please enter only letters & special chars.
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="form-group">
                                            <input
                                                type="email"
                                                name="email"
                                                className={`form-control ${isSaveAttempted && !validateInput('email', invoiceData.email) ? 'is-invalid' : ''}`}
                                                value={invoiceData.email}
                                                onChange={handleInputChange}
                                                placeholder="Email"
                                                required
                                            />
                                            <div className="invalid-feedback">
                                                Please enter a valid email.
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="form-group">
                                            <DatePicker
                                                name="invoiceDate"
                                                className="form-control"
                                                selected={invoiceData.invoiceDate}
                                                onChange={(date) => setInvoiceData({ ...invoiceData, invoiceDate: date })}
                                            />
                                        </div>
                                    </td>
                                    <td>
                                        <div className="form-group">
                                            <DatePicker
                                                name="dueDate"
                                                className="form-control"
                                                selected={invoiceData.dueDate}
                                                onChange={(date) => setInvoiceData({ ...invoiceData, dueDate: date })}
                                            />
                                        </div>
                                    </td>
                                    <td>
                                        <div className="form-group">
                                            <input
                                                type="text"
                                                name="status"
                                                className={`form-control ${isSaveAttempted && !validateInput('status', invoiceData.status) ? 'is-invalid' : ''}`}
                                                value={invoiceData.status}
                                                onChange={handleInputChange}
                                                placeholder="Status"
                                                required
                                            />
                                            <div className="invalid-feedback">
                                                Please enter only letters.
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="form-group">
                                            <input
                                                type="number"
                                                name="amount"
                                                className={`form-control ${isSaveAttempted && !validateInput('amount', invoiceData.amount) ? 'is-invalid' : ''}`}
                                                value={invoiceData.amount}
                                                onChange={handleInputChange}
                                                placeholder="Amount"
                                                required
                                            />
                                            <div className="invalid-feedback">
                                                Please enter a valid amont.
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <button className="btn btn-success" onClick={handleSaveEdit}>Save</button>
                                        <button className="btn btn-secondary" onClick={handleCancelEdit}>Cancel</button>
                                    </td>
                                </>
                            ) : (
                                <>
                                    <td>{invoice.invoice}</td>
                                    <td>{invoice.customer}</td>
                                    <td>{invoice.email}</td>
                                    <td>{new Date(invoice.invoiceDate).toISOString().slice(0, 10)}</td>
                                    <td>{new Date(invoice.dueDate).toISOString().slice(0, 10)}</td>
                                    <td>{invoice.status}</td>
                                    <td>{invoice.amount}</td>
                                    <td>
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => handleEdit(invoice)}
                                            disabled={isNewRowAdding}
                                        >
                                            Edit
                                        </button>
                                        &nbsp;
                                        <button
                                            className="btn btn-danger"
                                            onClick={() => handleDelete(invoice.id)}
                                            disabled={isNewRowAdding}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="d-flex justify-content-between">
                <select value={invoicesPerPage} onChange={handleRowsPerPageChange}>
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                </select>
                <Pagination
                    invoicesPerPage={invoicesPerPage}
                    totalInvoices={invoices.length}
                    paginate={paginate}
                    nextPage={nextPage}
                    currentPage={currentPage}
                />
            </div>
        </div>
    );
};

export default InvoiceList;
