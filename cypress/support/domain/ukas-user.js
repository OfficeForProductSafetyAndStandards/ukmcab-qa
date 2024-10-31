export default class UKASUser {

  constructor({
    email = `UkasUser${Date.now()}@ukas.example.test`,
    password = 'Som3P255W0rd!',
  } = {}) {
    this.email = email
    this.password = password
  }

}