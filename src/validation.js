export const validateInput = (name, value) => {
    switch (name) {
        case 'invoice':
            return /^[A-Za-z0-9]+$/.test(value);
        case 'customer':
            return /^[A-Za-z\s\W]+$/.test(value);
        case 'email':
            return /^\S+@\S+\.\S+$/.test(value);
        case 'status':
            return /^[A-Za-z]+$/.test(value);
        case 'amount':
            return /^[0-9]+(\.[0-9]+)?$/.test(value);
        default:
            return true;
    }
};
