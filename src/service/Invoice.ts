export interface Invoice {
    id: number;
    invoice: string;
    customer: string;
    email: string;
    invoiceDate: Date;
    dueDate: Date;
    status: string;
    amount: string;
}
