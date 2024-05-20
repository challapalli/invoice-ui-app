const API_URL = "http://localhost:8080/invoice";
export const fetchInvoices = async () => {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error('Failed to fetch invoices');
        }
        return await response.json();
    } catch (error) {
        throw new Error(`Error fetching invoices: ${error.message}`);
    }
};

export const deleteInvoice = async (id) => {
    try {
        const response = await fetch(API_URL + `/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error('Failed to delete invoice');
        }
    } catch (error) {
        throw new Error(`Error deleting invoice: ${error.message}`);
    }
};

export const saveInvoice = async (invoiceData) => {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(invoiceData),
        });
        if (!response.ok) {
            throw new Error('Failed to save invoice');
        }
        return await response.json();
    } catch (error) {
        throw new Error(`Error saving invoice: ${error.message}`);
    }
};

export const updateInvoice = async (id, updatedData) => {
    const response = await fetch(API_URL + `/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
    });
    if (!response.ok) {
        throw new Error('Failed to update invoice');
    }
    return await response.json();
};
