"use strict";
var Checker = (function () {
    function Checker(provider) {
        this.provider = provider;
        this.correctTranslation = 'correct';
        this.typoTranslation = 'typo';
        this.incorrectTranslation = 'incorrect';
        this.provider = provider;
    }
    /**
     * @todo Add the ability to compare sentences with more than one version of a word:
     * ex. "thought/speech bubble" gives both "thought bubble" and "speech bubble"
     *
     * @returns {{evaluation: *, numberOfMistakes: *, synonymGuessed: boolean}}
     */
    Checker.prototype.checkTranslation = function () {
        var translation = this.provider.getTranslation();
        var foreignWords = this.provider.getForeignWords();
        var actualNumberOfMistakes = this.getLongestWordLength(foreignWords);
        var synonymGuessed = false;
        var i, numberOfMistakes, evaluation;
        for (i = 0; i < foreignWords.length; ++i) {
            numberOfMistakes = this.stringsDistance(translation, foreignWords[i]);
            if (numberOfMistakes < actualNumberOfMistakes) {
                actualNumberOfMistakes = numberOfMistakes;
                if (i > 0) {
                    synonymGuessed = foreignWords[i];
                }
            }
        }
        evaluation = this.getEvaluation(actualNumberOfMistakes);
        return {
            evaluation: evaluation,
            numberOfMistakes: actualNumberOfMistakes,
            synonymGuessed: synonymGuessed
        };
    };
    // Compute the edit distance between the two given strings (Damerau–Levenshtein distance)
    Checker.prototype.stringsDistance = function (a, b) {
        if (a.length === 0)
            return b.length;
        if (b.length === 0)
            return a.length;
        var i, j, cost;
        var matrix = [];
        // increment along the first column of each row
        for (i = 0; i <= a.length; i++) {
            matrix[i] = [i];
        }
        // increment each column in the first row
        for (j = 0; j <= b.length; j++) {
            matrix[0][j] = j;
        }
        // Fill in the rest of the matrix
        for (i = 1; i <= a.length; i++) {
            for (j = 1; j <= b.length; j++) {
                cost = a.charAt(i - 1) == b.charAt(j - 1) ? 0 : 1;
                matrix[i][j] = Math.min(matrix[i - 1][j] + 1, // deletion
                matrix[i][j - 1] + 1, // insertion
                matrix[i - 1][j - 1] + cost // substitution
                );
                // Damerau transposition
                if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
                    matrix[i][j] = Math.min(matrix[i][j], matrix[i - 2][j - 2] + cost // transposition
                    );
                }
            }
        }
        return matrix[a.length][b.length];
    };
    Checker.prototype.getEvaluation = function (numberOfMistakes) {
        var evaluation;
        switch (numberOfMistakes) {
            case 0:
                evaluation = this.correctTranslation;
                break;
            case 1:
            case 2:
                evaluation = this.typoTranslation;
                break;
            default:
                evaluation = this.incorrectTranslation;
                break;
        }
        return evaluation;
    };
    Checker.prototype.getLongestWordLength = function (words) {
        return words.slice(0).sort(function (a, b) { return b.length - a.length; })[0].length;
    };
    return Checker;
}());
exports.Checker = Checker;
