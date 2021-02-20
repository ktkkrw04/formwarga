export class Citizen {
    constructor(data) {
        this.data = data;
    }

    verify() {
        return this.process(this.data);
    }

    process(data) {
        let register = {
            age: this.calcAge(data),
        };

        return register;
    }

    calcAge(date) {
        let dob = new Date(date);
        let diff = Date.now() - dob.getTime();
        let age_dt = new Date(diff);
        let age = new Date(age_dt).getFullYear() - 1970;
        return age;
    }
}