export const basicAuthCreds = () => {
    return {
        auth: {
            username: Cypress.env('BASIC_AUTH_USER'),
            password: Cypress.env('BASIC_AUTH_PASS')
        }
    }
}

export const header = () => {
    return cy.get('header')
}

export const footer = () => {
    return cy.get('footer')
}

export const shouldBeLoggedIn = () => {
    header().contains('a', 'Sign out')
}

export const shouldBeLoggedOut = () => {
    header().contains('a', 'Sign in')
}

export const helpPath = () => {
    return "/help";
};

export const aboutPath = () => {
    return "/about";
};

export const updatesPath = () => {
    return "/updates";
};

export const generateRandomSentence = (charCount) => {
    const words = [
        "the", "quick", "brown", "fox", "jumps", "over", "lazy", "dog",
        "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing",
        "elit", "integer", "nec", "odio", "praesent", "libero", "sed", "cursus",
        "ante", "dapibus", "diam", "sed", "nisi", "nulla", "quis", "sem", "at",
        "nibh", "elementum", "imperdiet", "duis", "sagittis", "ipsum", "praesent",
        "mauris", "fusce", "nec", "tellus", "sed", "augue", "semper", "porta"
    ];

    let sentence = '';
    while (sentence.length < charCount) {
        const word = words[Math.floor(Math.random() * words.length)];
        if (sentence.length + word.length + 1 <= charCount) {
            if (sentence.length > 0) {
                sentence += ' ';
            }
            sentence += word;
        } else {
            break;
        }
    }

    return sentence;
}


