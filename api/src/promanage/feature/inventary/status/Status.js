class Status {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
}

class StatusRequest {
    constructor(data) {
        this.name = data.name ? data.name.toString().trim() : null;
    }
    
    isValid() {
        return this.name !== null && this.name.length >= 3;
    }
}

module.exports = { Status, StatusRequest };