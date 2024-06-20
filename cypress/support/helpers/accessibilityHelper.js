export const terminalAndCsvLog = (violations) => {
    cy.task(
        'log',
        `${violations.length} accessibility violation${
            violations.length === 1 ? '' : 's'
        } ${violations.length === 1 ? 'was' : 'were'} detected`
    );

    const violationData = violations.map(
        ({id, impact, description, nodes}) => ({
            id,
            impact,
            description,
            nodes: nodes.length
        })
    );

    cy.task('table', violationData);

    let csvContent = 'id,impact,description,nodes,helpUrl\n';

    violations.forEach(({id, impact, description, nodes, helpUrl}) => {
        nodes.forEach(node => {
            csvContent += `${id},${impact},${description},${node.html},${helpUrl}\n`;
        });
    });


    const baseFilePath = 'cypress/a11y-violations/ukmcab-accessibility-violations';
    cy.task('getUniqueFileName', {baseName: baseFilePath}).then(filePath => {
        cy.task('writeCsv', {filePath, content: csvContent});
        cy.task('log', `Accessibility violations written to ${filePath}`);
    });
};

