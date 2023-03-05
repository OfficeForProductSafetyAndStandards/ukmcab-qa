export const findUserByEmail = (email) => {
  const querySpec = {
    query: "SELECT * FROM c WHERE c.NormalizedEmail = @email ORDER BY c.id OFFSET 0 LIMIT 1",
    parameters: [
      {
        name: "@email",
        value: email.toUpperCase()
      }
    ]
  };
  return cy.task('executeQuery', {db: 'UKMCABIdentity', container: 'AppIdentity', querySpec: querySpec}).then(result => {
    return result.resources[0]
  })
}

export const setUserRequestAsApproved = (user) => {
  findUserByEmail(user.email).then(user => {
    user.RequestApproved = true
    cy.task('upsertUser', user)
  })
}

export const getAllCabs = () => {
  return cy.task('getItems')
}