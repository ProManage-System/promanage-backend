class Sale {
    constructor(id, date, total) {
        this.id = id;
        this.date = date;
        this.total = total;
    }
}

class SaleRequest {
    constructor(data) {
        // items: [{ product_id, quantity }]
        this.items = Array.isArray(data.items) ? data.items : [];
    }

    validate() {
        const errors = {};

        if (this.items.length === 0) {
            errors.items = "La venta debe tener al menos un producto.";
        } else {
            this.items.forEach((item, index) => {
                if (!item.product_id || !item.quantity || item.quantity <= 0) {
                    errors[`item_${index}`] = "Cada item debe tener un ID de producto y cantidad mayor a 0.";
                }
            });
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors: errors
        };
    }
}

module.exports = { Sale, SaleRequest };