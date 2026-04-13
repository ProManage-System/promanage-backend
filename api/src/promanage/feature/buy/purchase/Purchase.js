class Purchase {
    constructor(id, supplier_id, date, lot) {
        this.id = id;
        this.supplier_id = supplier_id;
        this.date = date;
        this.lot = lot;
    }
}

class PurchaseRequest {
    constructor(data) {
        this.supplier_id = data.supplier_id ? parseInt(data.supplier_id) : null;
        this.lot = data.lot ? data.lot.toString().trim() : null;
        // items: [{ product_id, quantity, cost_price }]
        this.items = Array.isArray(data.items) ? data.items : [];
    }

    validate() {
        const errors = {};

        if (!this.supplier_id || isNaN(this.supplier_id)) {
            errors.supplier_id = "El ID del proveedor es obligatorio.";
        }

        if (!this.lot || this.lot === '') {
            errors.lot = "El número de lote es obligatorio.";
        }

        if (this.items.length === 0) {
            errors.items = "La compra debe tener al menos un producto.";
        } else {
            this.items.forEach((item, index) => {
                if (!item.product_id || !item.quantity || !item.cost_price || item.quantity <= 0) {
                    errors[`item_${index}`] = "Cada producto debe tener ID, cantidad (>0) y precio de costo.";
                }
            });
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors: errors
        };
    }
}

module.exports = { Purchase, PurchaseRequest };